import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return 'Hello World!';
  }
  getOrders(): string {
    return 'Here are your orders!';
  }
}
