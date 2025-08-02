import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Order, OrderStatus } from './entities/order.entity';
import { CreateOrderDto } from './dto/create-order-simple.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { OrderEventPublisher } from '../events/order-event-publisher.service';
import {
  OrderCreatedEvent,
  OrderUpdatedEvent,
  OrderCancelledEvent,
} from '../events/order-events';

@Injectable()
export class OrdersService {
  constructor(
    @InjectModel(Order.name) private orderModel: Model<Order>,
    private readonly orderEventPublisher: OrderEventPublisher,
  ) {}

  async create(createOrderDto: CreateOrderDto): Promise<Order> {
    const orderNumber = `ORD-${Date.now()}`;

    // Calculate totals
    const subtotal = createOrderDto.items.reduce(
      (sum, item) => sum + item.quantity * item.unitPrice,
      0,
    );
    const tax = subtotal * 0.1; // 10% tax
    const shippingCost = 10.0; // Fixed shipping cost
    const total = subtotal + tax + shippingCost;

    // Create order items with calculated total prices
    const items = createOrderDto.items.map((item) => ({
      ...item,
      totalPrice: item.quantity * item.unitPrice,
    }));

    const orderData = {
      orderNumber,
      customer: createOrderDto.customer,
      items,
      subtotal,
      tax,
      shippingCost,
      total,
      status: OrderStatus.PENDING,
      shippingAddress: createOrderDto.shippingAddress,
      paymentMethod: createOrderDto.paymentMethod,
      notes: createOrderDto.notes,
    };

    const createdOrder = new this.orderModel(orderData);
    const savedOrder = await createdOrder.save();

    // Publish OrderCreated event
    const orderCreatedEvent = new OrderCreatedEvent(
      String(savedOrder._id),
      savedOrder.orderNumber,
      savedOrder.customer.customerId,
      savedOrder.total,
      savedOrder.items.map((item) => ({
        productId: item.productId,
        productName: item.productName,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
      })),
      savedOrder.createdAt || new Date(),
    );

    await this.orderEventPublisher.publishOrderCreated(orderCreatedEvent);

    return savedOrder;
  }

  async findAll(): Promise<Order[]> {
    return this.orderModel.find().sort({ createdAt: -1 }).exec();
  }

  async findOne(id: string): Promise<Order> {
    const order = await this.orderModel.findById(id).exec();
    if (!order) {
      throw new NotFoundException(`Order with ID ${id} not found`);
    }
    return order;
  }

  async update(id: string, updateOrderDto: UpdateOrderDto): Promise<Order> {
    const updatedOrder = await this.orderModel
      .findByIdAndUpdate(id, updateOrderDto, { new: true })
      .exec();

    if (!updatedOrder) {
      throw new NotFoundException(`Order with ID ${id} not found`);
    }

    // Publish OrderUpdated event if status changed
    if (updateOrderDto.status) {
      const orderUpdatedEvent = new OrderUpdatedEvent(
        String(updatedOrder._id),
        updatedOrder.orderNumber,
        updatedOrder.status,
        new Date(),
      );
      await this.orderEventPublisher.publishOrderUpdated(orderUpdatedEvent);
    }

    return updatedOrder;
  }

  async remove(id: string): Promise<void> {
    const result = await this.orderModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException(`Order with ID ${id} not found`);
    }
  }

  async findByStatus(status: OrderStatus): Promise<Order[]> {
    return this.orderModel.find({ status }).sort({ createdAt: -1 }).exec();
  }

  async findByCustomer(customerId: string): Promise<Order[]> {
    return this.orderModel
      .find({ 'customer.customerId': customerId })
      .sort({ createdAt: -1 })
      .exec();
  }

  async findByOrderNumber(orderNumber: string): Promise<Order> {
    const order = await this.orderModel.findOne({ orderNumber }).exec();
    if (!order) {
      throw new NotFoundException(`Order with number ${orderNumber} not found`);
    }
    return order;
  }

  async cancelOrder(id: string, reason: string): Promise<Order> {
    const order = await this.orderModel
      .findByIdAndUpdate(id, { status: OrderStatus.CANCELLED }, { new: true })
      .exec();

    if (!order) {
      throw new NotFoundException(`Order with ID ${id} not found`);
    }

    // Publish OrderCancelled event
    const orderCancelledEvent = new OrderCancelledEvent(
      String(order._id),
      order.orderNumber,
      order.customer.customerId,
      reason,
      new Date(),
    );
    await this.orderEventPublisher.publishOrderCancelled(orderCancelledEvent);

    return order;
  }
}
