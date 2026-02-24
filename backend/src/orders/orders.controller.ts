import {
  Body,
  Controller,
  Headers,
  Post,
  UnauthorizedException,
} from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto';
import { OrdersService } from './orders.service';

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  createOrder(@Body() payload: CreateOrderDto, @Headers('x-user-role') role?: string) {
    if (role !== 'customer') {
      throw new UnauthorizedException('Customer role is required');
    }

    return this.ordersService.createOrder(payload);
  }
}
