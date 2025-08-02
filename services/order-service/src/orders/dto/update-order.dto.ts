import { OrderStatus } from '../entities/order.entity';

export class UpdateOrderDto {
  status?: OrderStatus;
  notes?: string;
  shippingAddress?: {
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
}
