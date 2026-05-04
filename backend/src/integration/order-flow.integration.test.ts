import {
  createIntegrationHarness,
  CUSTOMER_ID,
  OUTLET_ID,
  TEST_DATE,
} from './integration-test-helpers';

describe('Flow 1: Order Flow', () => {
  it('stores a customer order, exposes it to vendor, and persists status updates', async () => {
    const { prisma, ordersController, vendorOrdersController } = createIntegrationHarness();
    const slotId = `${OUTLET_ID}-${TEST_DATE}-11:30`;

    const created = await ordersController.createOrder({
      outletId: OUTLET_ID,
      slotDate: TEST_DATE,
      slotId,
      items: [{ itemId: 'item-original', quantity: 2, notes: 'less rice' }],
    }, { user: { id: CUSTOMER_ID, email: 'casey@example.com' } } as any);

    expect(prisma.orders).toHaveLength(1);
    expect(prisma.orders[0]).toMatchObject({
      order_id: created.orderId,
      customer_id: CUSTOMER_ID,
      status: 'received',
    });

    const vendorOrders = await vendorOrdersController.getIncomingOrders(
      { vendorOutletId: OUTLET_ID },
      'vendor',
      OUTLET_ID,
    );
    expect(vendorOrders).toEqual([
      expect.objectContaining({
        orderId: created.orderId,
        status: 'received',
        itemsSummary: 'Original Bowl x2',
      }),
    ]);

    const updated = await ordersController.updateOrderStatus(
      created.orderId,
      { status: 'preparing' },
      { headers: { 'x-user-role': 'vendor' } } as any,
    );

    expect(updated.status).toBe('preparing');
    expect(prisma.orders[0].status).toBe('preparing');
  });
});
