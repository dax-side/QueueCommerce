import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type PaymentDocument = Payment & Document;

@Schema({ timestamps: true })
export class Payment {
  @Prop({ required: true, unique: true })
  paymentIntentId: string;

  @Prop({ required: true })
  orderId: string;

  @Prop({ required: true })
  customerId: string;

  @Prop({ required: true })
  amount: number;

  @Prop({ required: true, default: 'usd' })
  currency: string;

  @Prop({
    required: true,
    enum: [
      'pending',
      'processing',
      'succeeded',
      'failed',
      'cancelled',
      'refunded',
    ],
    default: 'pending',
  })
  status: string;

  @Prop()
  stripePaymentIntentId?: string;

  @Prop()
  stripeClientSecret?: string;

  @Prop()
  paymentMethodId?: string;

  @Prop()
  customerEmail?: string;

  @Prop({ type: [Object] })
  orderItems?: {
    productId: string;
    productName: string;
    quantity: number;
    unitPrice: number;
  }[];

  @Prop()
  errorMessage?: string;

  @Prop()
  paidAt?: Date;

  @Prop()
  failedAt?: Date;

  @Prop()
  refundedAt?: Date;

  @Prop()
  stripeRefundId?: string;

  @Prop()
  refundAmount?: number;

  @Prop({ type: Object })
  metadata?: Record<string, any>;
}

export const PaymentSchema = SchemaFactory.createForClass(Payment);
