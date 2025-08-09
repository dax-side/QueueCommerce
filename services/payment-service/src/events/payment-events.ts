export class PaymentIntentCreatedEvent {
  paymentIntentId: string;
  orderId: string;
  customerId: string;
  amount: number;
  currency: string;
  status: string;
  createdAt: Date;
}

export class PaymentProcessRequestedEvent {
  orderId: string;
  customerId: string;
  amount: number;
  currency: string;
  paymentMethodId?: string;
  customerEmail: string;
  orderItems: {
    productId: string;
    productName: string;
    quantity: number;
    unitPrice: number;
  }[];
}

export class PaymentSucceededEvent {
  paymentIntentId: string;
  orderId: string;
  customerId: string;
  amount: number;
  currency: string;
  stripePaymentIntentId: string;
  paidAt: Date;
}

export class PaymentFailedEvent {
  paymentIntentId: string;
  orderId: string;
  customerId: string;
  amount: number;
  currency: string;
  errorMessage: string;
  failedAt: Date;
}

export class PaymentRefundedEvent {
  paymentIntentId: string;
  orderId: string;
  customerId: string;
  refundAmount: number;
  currency: string;
  stripeRefundId: string;
  refundedAt: Date;
}
