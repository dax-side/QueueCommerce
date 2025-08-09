import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  HttpCode,
  HttpStatus,
  Headers,
  Req,
} from '@nestjs/common';
import { EventPattern, MessagePattern } from '@nestjs/microservices';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { PaymentService } from './payment.service';
import {
  CreatePaymentIntentDto,
  ConfirmPaymentDto,
  RefundPaymentDto,
} from './dto/payment.dto';
import { PaymentProcessRequestedEvent } from '../events/payment-events';
import type { Request } from 'express';

@Controller('payments')
@ApiTags('payments')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Post()
  @ApiOperation({ summary: 'Create a payment intent' })
  @ApiResponse({
    status: 201,
    description: 'Payment intent created successfully',
  })
  async createPaymentIntent(@Body() createPaymentDto: CreatePaymentIntentDto) {
    return this.paymentService.createPaymentIntent(createPaymentDto);
  }

  @Post(':paymentIntentId/confirm')
  @ApiOperation({ summary: 'Confirm a payment' })
  @ApiResponse({ status: 200, description: 'Payment confirmed successfully' })
  async confirmPayment(
    @Param('paymentIntentId') paymentIntentId: string,
    @Body() confirmPaymentDto: ConfirmPaymentDto,
  ) {
    return this.paymentService.confirmPayment({
      ...confirmPaymentDto,
      paymentIntentId,
    });
  }

  @Post(':paymentIntentId/refund')
  @ApiOperation({ summary: 'Refund a payment' })
  @ApiResponse({ status: 200, description: 'Payment refunded successfully' })
  async refundPayment(
    @Param('paymentIntentId') paymentIntentId: string,
    @Body() refundPaymentDto: RefundPaymentDto,
  ) {
    return this.paymentService.refundPayment({
      ...refundPaymentDto,
      paymentIntentId,
    });
  }

  @Get(':paymentIntentId')
  @ApiOperation({ summary: 'Get payment by payment intent ID' })
  @ApiResponse({ status: 200, description: 'Payment found' })
  async getPayment(@Param('paymentIntentId') paymentIntentId: string) {
    return this.paymentService.findByPaymentIntentId(paymentIntentId);
  }

  @Get('order/:orderId')
  @ApiOperation({ summary: 'Get payments by order ID' })
  @ApiResponse({ status: 200, description: 'Payments found' })
  async getPaymentsByOrderId(@Param('orderId') orderId: string) {
    return this.paymentService.findByOrderId(orderId);
  }

  @Get('customer/:customerId')
  @ApiOperation({ summary: 'Get payments by customer ID' })
  @ApiResponse({ status: 200, description: 'Payments found' })
  async getPaymentsByCustomerId(@Param('customerId') customerId: string) {
    return this.paymentService.findByCustomerId(customerId);
  }

  @Get()
  @ApiOperation({ summary: 'Get all payments' })
  @ApiResponse({ status: 200, description: 'All payments retrieved' })
  async getAllPayments() {
    return this.paymentService.getAllPayments();
  }

  @Post('webhook/stripe')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Handle Stripe webhooks' })
  async handleStripeWebhook(
    @Headers('stripe-signature') signature: string,
    @Req() req: Request & { rawBody: Buffer },
  ) {
    return this.paymentService.handleStripeWebhook(req.rawBody, signature);
  }

  // Microservice Event Handlers
  @EventPattern('payment.process.requested')
  async handlePaymentProcessRequested(data: PaymentProcessRequestedEvent) {
    try {
      console.log('Received payment process request:', data);
      const paymentIntent = await this.paymentService.createPaymentIntent({
        orderId: data.orderId,
        customerId: data.customerId,
        amount: data.amount,
        currency: data.currency,
        customerEmail: data.customerEmail,
        orderItems: data.orderItems,
      });

      console.log('Payment intent created:', paymentIntent.paymentIntentId);
      return paymentIntent;
    } catch (error) {
      console.error('Error processing payment request:', error);
      throw error;
    }
  }

  @MessagePattern('payment.status.get')
  async getPaymentStatus(data: { paymentIntentId: string }) {
    try {
      console.log('Getting payment status for:', data.paymentIntentId);
      return await this.paymentService.findByPaymentIntentId(
        data.paymentIntentId,
      );
    } catch (error) {
      console.error('Error getting payment status:', error);
      throw error;
    }
  }

  @MessagePattern('payment.order.get')
  async getOrderPayments(data: { orderId: string }) {
    try {
      console.log('Getting payments for order:', data.orderId);
      return await this.paymentService.findByOrderId(data.orderId);
    } catch (error) {
      console.error('Error getting order payments:', error);
      throw error;
    }
  }
}
