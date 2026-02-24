import {
  Controller,
  Get,
  Headers,
  Inject,
  Query,
  UnauthorizedException,
} from '@nestjs/common';
import { VendorOrdersQueryDto } from './dto/vendor-orders-query.dto';
import { VendorOrdersService } from './vendor-orders.service';

@Controller('vendor/orders')
export class VendorOrdersController {
  constructor(
    @Inject(VendorOrdersService) private readonly vendorOrdersService: VendorOrdersService,
  ) {}

  @Get()
  getIncomingOrders(
    @Query() query: VendorOrdersQueryDto,
    @Headers('x-user-role') role?: string,
    @Headers('x-vendor-outlet-id') vendorOutletIdHeader?: string,
  ) {
    if (role !== 'vendor') {
      throw new UnauthorizedException('Vendor role is required');
    }

    const outletId = vendorOutletIdHeader || query.vendorOutletId;
    if (!outletId) {
      throw new UnauthorizedException('Vendor outlet scope is required');
    }

    return this.vendorOrdersService.getIncomingOrders({
      ...query,
      vendorOutletId: outletId,
    });
  }
}
