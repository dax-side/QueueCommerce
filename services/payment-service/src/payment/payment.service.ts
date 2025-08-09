import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import Stripe from 'stripe';
import { Payment, PaymentDocument } from '../schemas/payment.schema';
import { PaymentEventPublisherService } from '../events/payment-event-publisher.service';
import {
  CreatePaymentIntentDto,
  ConfirmPaymentDto,
  RefundPaymentDto,
} from './dto/payment.dto';
import {
  PaymentIntentCreatedEvent,
  PaymentSucceededEvent,
  PaymentFailedEvent,
  PaymentRefundedEvent,
} from '../events/payment-events';

@Injectable()
export class PaymentService {
  private stripe: Stripe;

  constructor(
    @InjectModel(Payment.name) private paymentModel: Model<PaymentDocument>,
    private paymentEventPublisher: PaymentEventPublisherService,
  ) {
    this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
      apiVersion: '2025-07-30.basil',
    });
  }

  async createPaymentIntent(
    createPaymentDto: CreatePaymentIntentDto,
  ): Promise<Payment> {
    try {
      // Generate unique payment intent ID
      const paymentIntentId = `pi_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      // Convert amount to integer (cents) for Stripe
      const amountInCents = Math.round(createPaymentDto.amount);

      // Create Stripe Payment Intent
      const stripePaymentIntent = await this.stripe.paymentIntents.create({
        amount: amountInCents,
        currency: createPaymentDto.currency || 'usd',
        metadata: {
          orderId: createPaymentDto.orderId,
          customerId: createPaymentDto.customerId,
          paymentIntentId,
        },
        receipt_email: createPaymentDto.customerEmail,
      });

      // Save payment record in database
      const payment = new this.paymentModel({
        paymentIntentId,
        orderId: createPaymentDto.orderId,
        customerId: createPaymentDto.customerId,
        amount: createPaymentDto.amount,
        currency: createPaymentDto.currency || 'usd',
        status: 'pending',
        stripePaymentIntentId: stripePaymentIntent.id,
        stripeClientSecret: stripePaymentIntent.client_secret,
        customerEmail: createPaymentDto.customerEmail,
        orderItems: createPaymentDto.orderItems,
      });

      const savedPayment = await payment.save();

      // Publish payment intent created event
      const event: PaymentIntentCreatedEvent = {
        paymentIntentId: savedPayment.paymentIntentId,
        orderId: savedPayment.orderId,
        customerId: savedPayment.customerId,
        amount: savedPayment.amount,
        currency: savedPayment.currency,
        status: savedPayment.status,
        createdAt: new Date(),
      };

      await this.paymentEventPublisher.publishPaymentIntentCreated(event);

      return savedPayment;
    } catch (error) {
      console.error('Error creating payment intent:', error);
      throw new BadRequestException('Failed to create payment intent');
    }
  }

  async confirmPayment(confirmPaymentDto: ConfirmPaymentDto): Promise<Payment> {
    try {
      const payment = await this.findByPaymentIntentId(
        confirmPaymentDto.paymentIntentId,
      );

      if (!payment.stripePaymentIntentId) {
        throw new BadRequestException('Invalid payment intent');
      }

      // Confirm payment with Stripe
      const confirmedPayment = await this.stripe.paymentIntents.confirm(
        payment.stripePaymentIntentId,
        {
          payment_method: confirmPaymentDto.paymentMethodId,
        },
      );

      // Update payment status based on Stripe response
      if (confirmedPayment.status === 'succeeded') {
        payment.status = 'succeeded';
        payment.paymentMethodId = confirmPaymentDto.paymentMethodId;
        payment.paidAt = new Date();

        const updatedPayment = await payment.save();

        // Publish payment succeeded event
        const event: PaymentSucceededEvent = {
          paymentIntentId: updatedPayment.paymentIntentId,
          orderId: updatedPayment.orderId,
          customerId: updatedPayment.customerId,
          amount: updatedPayment.amount,
          currency: updatedPayment.currency,
          stripePaymentIntentId: updatedPayment.stripePaymentIntentId || '',
          paidAt: updatedPayment.paidAt || new Date(),
        };

        await this.paymentEventPublisher.publishPaymentSucceeded(event);

        return updatedPayment;
      } else {
        payment.status = 'failed';
        payment.errorMessage = `Payment confirmation failed with status: ${confirmedPayment.status}`;
        payment.failedAt = new Date();

        const updatedPayment = await payment.save();

        // Publish payment failed event
        const event: PaymentFailedEvent = {
          paymentIntentId: updatedPayment.paymentIntentId,
          orderId: updatedPayment.orderId,
          customerId: updatedPayment.customerId,
          amount: updatedPayment.amount,
          currency: updatedPayment.currency,
          errorMessage: updatedPayment.errorMessage || 'Payment failed',
          failedAt: updatedPayment.failedAt || new Date(),
        };

        await this.paymentEventPublisher.publishPaymentFailed(event);

        return updatedPayment;
      }
    } catch (error) {
      console.error('Error confirming payment:', error);
      throw new BadRequestException('Failed to confirm payment');
    }
  }

  async refundPayment(refundPaymentDto: RefundPaymentDto): Promise<Payment> {
    try {
      const payment = await this.findByPaymentIntentId(
        refundPaymentDto.paymentIntentId,
      );

      if (payment.status !== 'succeeded') {
        throw new BadRequestException('Can only refund succeeded payments');
      }

      if (!payment.stripePaymentIntentId) {
        throw new BadRequestException('Invalid payment intent');
      }

      // Create refund with Stripe
      const refund = await this.stripe.refunds.create({
        payment_intent: payment.stripePaymentIntentId,
        amount: refundPaymentDto.amount, // If not provided, Stripe will refund the full amount
        reason: refundPaymentDto.reason as Stripe.RefundCreateParams.Reason,
      });

      // Update payment record
      payment.status = 'refunded';
      payment.stripeRefundId = refund.id;
      payment.refundAmount = refund.amount;
      payment.refundedAt = new Date();

      const updatedPayment = await payment.save();

      // Publish payment refunded event
      const event: PaymentRefundedEvent = {
        paymentIntentId: updatedPayment.paymentIntentId,
        orderId: updatedPayment.orderId,
        customerId: updatedPayment.customerId,
        refundAmount: updatedPayment.refundAmount || 0,
        currency: updatedPayment.currency,
        stripeRefundId: updatedPayment.stripeRefundId || '',
        refundedAt: updatedPayment.refundedAt || new Date(),
      };

      await this.paymentEventPublisher.publishPaymentRefunded(event);

      return updatedPayment;
    } catch (error) {
      console.error('Error refunding payment:', error);
      throw new BadRequestException('Failed to refund payment');
    }
  }

  async findByPaymentIntentId(
    paymentIntentId: string,
  ): Promise<PaymentDocument> {
    const payment = await this.paymentModel.findOne({ paymentIntentId }).exec();
    if (!payment) {
      throw new NotFoundException('Payment not found');
    }
    return payment;
  }

  async findByOrderId(orderId: string): Promise<PaymentDocument[]> {
    return this.paymentModel.find({ orderId }).exec();
  }

  async findByCustomerId(customerId: string): Promise<PaymentDocument[]> {
    return this.paymentModel.find({ customerId }).exec();
  }

  async getAllPayments(): Promise<PaymentDocument[]> {
    return this.paymentModel.find().sort({ createdAt: -1 }).exec();
  }

  async handleStripeWebhook(
    body: string | Buffer,
    signature: string,
  ): Promise<void> {
    try {
      const event = this.stripe.webhooks.constructEvent(
        body,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET || '',
      );

      console.log('Received Stripe webhook event:', event.type);

      switch (event.type) {
        case 'payment_intent.succeeded':
          await this.handlePaymentSucceeded(event.data.object);
          break;
        case 'payment_intent.payment_failed':
          await this.handlePaymentFailed(event.data.object);
          break;
        case 'charge.dispute.created':
          console.log('Dispute created for payment:', event.data.object);
          break;
        default:
          console.log(`Unhandled event type: ${event.type}`);
      }
    } catch (error) {
      console.error('Error handling Stripe webhook:', error);
      throw error;
    }
  }

  private async handlePaymentSucceeded(
    paymentIntent: Stripe.PaymentIntent,
  ): Promise<void> {
    const payment = await this.paymentModel
      .findOne({
        stripePaymentIntentId: paymentIntent.id,
      })
      .exec();

    if (payment && payment.status !== 'succeeded') {
      payment.status = 'succeeded';
      payment.paidAt = new Date();
      await payment.save();

      const event: PaymentSucceededEvent = {
        paymentIntentId: payment.paymentIntentId,
        orderId: payment.orderId,
        customerId: payment.customerId,
        amount: payment.amount,
        currency: payment.currency,
        stripePaymentIntentId: payment.stripePaymentIntentId || '',
        paidAt: payment.paidAt || new Date(),
      };

      await this.paymentEventPublisher.publishPaymentSucceeded(event);
    }
  }

  private async handlePaymentFailed(
    paymentIntent: Stripe.PaymentIntent,
  ): Promise<void> {
    const payment = await this.paymentModel
      .findOne({
        stripePaymentIntentId: paymentIntent.id,
      })
      .exec();

    if (payment && payment.status !== 'failed') {
      payment.status = 'failed';
      payment.errorMessage =
        paymentIntent.last_payment_error?.message || 'Payment failed';
      payment.failedAt = new Date();
      await payment.save();

      const event: PaymentFailedEvent = {
        paymentIntentId: payment.paymentIntentId,
        orderId: payment.orderId,
        customerId: payment.customerId,
        amount: payment.amount,
        currency: payment.currency,
        errorMessage: payment.errorMessage,
        failedAt: payment.failedAt,
      };

      await this.paymentEventPublisher.publishPaymentFailed(event);
    }
  }
}
