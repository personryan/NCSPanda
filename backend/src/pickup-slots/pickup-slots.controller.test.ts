import { PickupSlotsController } from './pickup-slots.controller';

describe('PickupSlotsController', () => {
  it('delegates slot lookup to the service', async () => {
    const slots = [{ slotId: 'slot-1', isAvailable: true }];
    const pickupSlotsService = {
      getSlots: jest.fn().mockResolvedValue(slots),
    };
    const controller = new PickupSlotsController(pickupSlotsService as any);

    await expect(
      controller.getPickupSlots({ outletId: 'outlet-1', date: '2099-01-01' }),
    ).resolves.toBe(slots);
    expect(pickupSlotsService.getSlots).toHaveBeenCalledWith('outlet-1', '2099-01-01');
  });
});
