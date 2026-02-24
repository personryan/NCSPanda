import { BadRequestException, Controller, Get, Inject, Query } from '@nestjs/common';
import { MenuService, OutletMenuView } from './menu.service';

@Controller('menu')
export class MenuController {
  constructor(
    @Inject(MenuService) private readonly menuService: MenuService,
  ) {}

  @Get()
  getOutletMenu(@Query('outletId') outletId?: string): OutletMenuView {
    if (!outletId || !outletId.trim()) {
      throw new BadRequestException('outletId query param is required');
    }

    return this.menuService.getMenuByOutlet(outletId.trim());
  }
}
