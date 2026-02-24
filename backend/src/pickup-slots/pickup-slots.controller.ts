import { Controller, Get, Inject, Query } from '@nestjs/common';
import { PickupSlotsQueryDto } from './dto/pickup-slots-query.dto';
import { PickupSlotView, PickupSlotsService } from './pickup-slots.service';

@Controller('pickup-slots')
export class PickupSlotsController {
  constructor(
    @Inject(PickupSlotsService) private readonly pickupSlotsService: PickupSlotsService,
  ) {}

  @Get()
  getPickupSlots(@Query() query: PickupSlotsQueryDto): PickupSlotView[] {
    return this.pickupSlotsService.getSlots(query.outletId, query.date);
  }
}
