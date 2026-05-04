import {
  Body,
  Controller,
  Get,
  Inject,
  Param,
  Patch,
  Post,
  Req,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { Request } from 'express';
import { AuthGuard } from '../auth/auth.guard';
import { AuthUser, SupabaseAuthService } from '../auth/supabase-auth.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { OrdersService } from './orders.service';

@Controller('orders')
export class OrdersController {
  constructor(
    @Inject(OrdersService) private readonly ordersService: OrdersService,
    @Inject(SupabaseAuthService) private readonly supabaseAuthService: SupabaseAuthService,
  ) {}

  @Post()
  @UseGuards(AuthGuard)
  async createOrder(
    @Body() payload: CreateOrderDto,
    @Req() req: Request & { user: AuthUser },
  ) {
    return this.ordersService.createOrder(payload, req.user.id);
  }

  @Get('me')
  @UseGuards(AuthGuard)
  async listMyOrders(@Req() req: Request & { user: AuthUser }) {
    return this.ordersService.listOrdersForCustomer(req.user.id);
  }

  @Get(':orderId')
  async getOrderTracking(
    @Param('orderId') orderId: string,
    @Req() req: Request,
  ) {
    if (req.headers['x-user-role'] === 'vendor') {
      return this.ordersService.getOrderById(orderId);
    }

    const user = await this.getAuthUser(req);
    if (!user) {
      throw new UnauthorizedException('Customer or vendor role is required');
    }

    return this.ordersService.getOrderByIdForCustomer(orderId, user.id);
  }

  @Patch(':orderId/status')
  async updateOrderStatus(
    @Param('orderId') orderId: string,
    @Body() payload: UpdateOrderStatusDto,
    @Req() req: Request,
  ) {
    if (req.headers['x-user-role'] !== 'vendor') {
      throw new UnauthorizedException('Vendor role is required');
    }

    return this.ordersService.updateOrderStatus(orderId, payload.status);
  }

  private async getAuthUser(req: Request): Promise<AuthUser | null> {
    const authHeader = req.headers.authorization;
    const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;
    if (!token) return null;

    return this.supabaseAuthService.validateAccessToken(token);
  }
}
