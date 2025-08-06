export class OrderCreatedEvent {
  constructor(
    public readonly orderId: string,
    public readonly orderNumber: string,
    public readonly customerId: string,
    public readonly total: number,
    public readonly items: Array<{
      productId: string;
      productName: string;
      quantity: number;
      unitPrice: number;
    }>,
    public readonly createdAt: Date,
  ) {}
}

export class OrderUpdatedEvent {
  constructor(
    public readonly orderId: string,
    public readonly orderNumber: string,
    public readonly status: string,
    public readonly updatedAt: Date,
  ) {}
}

export class OrderCancelledEvent {
  constructor(
    public readonly orderId: string,
    public readonly orderNumber: string,
    public readonly customerId: string,
    public readonly reason: string,
    public readonly cancelledAt: Date,
  ) {}
}

export class InventoryReservationRequestedEvent {
  constructor(
    public readonly orderId: string,
    public readonly customerId: string,
    public readonly items: Array<{
      productId: string;
      productName: string;
      quantity: number;
      unitPrice: number;
    }>,
    public readonly reservationTimeoutMinutes: number = 15,
    public readonly timestamp: Date = new Date(),
  ) {}
}

export class PaymentProcessRequestedEvent {
  constructor(
    public readonly orderId: string,
    public readonly customerId: string,
    public readonly amount: number,
    public readonly currency: string,
    public readonly customerEmail: string,
    public readonly orderItems: Array<{
      productId: string;
      productName: string;
      quantity: number;
      unitPrice: number;
    }>,
    public readonly timestamp: Date = new Date(),
  ) {}
}

export class PaymentProcessingRequestedEvent {
  constructor(
    public readonly orderId: string,
    public readonly customerId: string,
    public readonly amount: number,
    public readonly paymentMethod: string,
  ) {}
}
