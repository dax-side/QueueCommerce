import { Controller, Get, UseGuards } from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';

import { AppService } from './app.service';
import { Public } from './auth/decorators/public.decorator';

@Controller()
@UseGuards(ThrottlerGuard)
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Public()
  @Get()
  getInfo() {
    return this.appService.getInfo();
  }

  @Public()
  @Get('status')
  getStatus() {
    return this.appService.getStatus();
  }
}
