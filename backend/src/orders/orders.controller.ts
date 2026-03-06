import {
  Body,
  Controller,
  Get,
  Headers,
  Inject,
  Param,
  Patch,
  Post,
  UnauthorizedException,
} from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { OrdersService } from './orders.service';

@Controller('orders')
export class OrdersController {
  constructor(@Inject(OrdersService) private readonly ordersService: OrdersService) {}

  @Post()
  async createOrder(@Body() payload: CreateOrderDto, @Headers('x-user-role') role?: string) {
    if (role !== 'customer') {
      throw new UnauthorizedException('Customer role is required');
    }

    return this.ordersService.createOrder(payload);
  }

  @Get(':orderId')
  async getOrderTracking(
    @Param('orderId') orderId: string,
    @Headers('x-user-role') role?: string,
  ) {
    if (role !== 'customer' && role !== 'vendor') {
      throw new UnauthorizedException('Customer or vendor role is required');
    }

    return this.ordersService.getOrderById(orderId);
  }

  @Patch(':orderId/status')
  async updateOrderStatus(
    @Param('orderId') orderId: string,
    @Body() payload: UpdateOrderStatusDto,
    @Headers('x-user-role') role?: string,
  ) {
    if (role !== 'vendor') {
      throw new UnauthorizedException('Vendor role is required');
    }

    return this.ordersService.updateOrderStatus(orderId, payload.status);
  }
}
