import {
  createIntegrationHarness,
  OUTLET_ID,
} from './integration-test-helpers';

describe('Flow 2: Menu Management', () => {
  it('returns a menu item that is stored in the DB', async () => {
    const { prisma, menuController } = createIntegrationHarness();

    prisma.seedMenuItem({
      item_id: 'item-integration-noodles',
      outlet_id: OUTLET_ID,
      name: 'Integration Noodles',
      description: 'Stored before user fetch',
      price: 7.25,
      availability_status: 'limited',
    });

    const menu = await menuController.getOutletMenu(OUTLET_ID);

    expect(menu.items).toEqual(expect.arrayContaining([
      expect.objectContaining({
        itemId: 'item-integration-noodles',
        name: 'Integration Noodles',
        price: 7.25,
        availability: { isAvailable: true, status: 'limited' },
      }),
    ]));
  });
});
