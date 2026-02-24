import { describe, expect, it } from 'vitest';
import { BadRequestException } from '@nestjs/common';
import { MenuController } from './menu.controller';
import { MenuService } from './menu.service';

describe('MenuController', () => {
  const controller = new MenuController(new MenuService());

  it('rejects request without outletId', () => {
    expect(() => controller.getOutletMenu(undefined)).toThrow(BadRequestException);
  });
});
