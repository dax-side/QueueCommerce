// Incoming events (consumed by Inventory Service)
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

export class InventoryReservationReleaseEvent {
  constructor(
    public readonly orderId: string,
    public readonly reservationId: string,
    public readonly reason: string = 'Order cancelled',
    public readonly timestamp: Date = new Date(),
  ) {}
}

// Outgoing events (published by Inventory Service)
export class InventoryReservedEvent {
  constructor(
    public readonly orderId: string,
    public readonly reservationId: string,
    public readonly customerId: string,
    public readonly items: Array<{
      productId: string;
      productName: string;
      quantity: number;
      unitPrice: number;
      reservedQuantity: number;
    }>,
    public readonly expiresAt: Date,
    public readonly timestamp: Date = new Date(),
  ) {}
}

export class InventoryInsufficientEvent {
  constructor(
    public readonly orderId: string,
    public readonly customerId: string,
    public readonly insufficientItems: Array<{
      productId: string;
      productName: string;
      requestedQuantity: number;
      availableQuantity: number;
    }>,
    public readonly reason: string = 'Insufficient inventory',
    public readonly timestamp: Date = new Date(),
  ) {}
}

export class InventoryReleasedEvent {
  constructor(
    public readonly orderId: string,
    public readonly reservationId: string,
    public readonly customerId: string,
    public readonly items: Array<{
      productId: string;
      quantity: number;
    }>,
    public readonly reason: string,
    public readonly timestamp: Date = new Date(),
  ) {}
}

export class LowStockAlertEvent {
  constructor(
    public readonly productId: string,
    public readonly productName: string,
    public readonly currentStock: number,
    public readonly threshold: number,
    public readonly timestamp: Date = new Date(),
  ) {}
}
