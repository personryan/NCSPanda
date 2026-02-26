import { describe, expect, it } from 'vitest';
import { BadRequestException } from '@nestjs/common';
import { MenuController } from './menu.controller';
import { MenuService } from './menu.service';

const mockPrisma = {
  outlet: { findUnique: async () => null },
} as any;

describe('MenuController', () => {
  const controller = new MenuController(new MenuService(mockPrisma));

  it('rejects request without outletId', async () => {
    await expect(controller.getOutletMenu(undefined)).rejects.toThrow(BadRequestException);
  });
});
