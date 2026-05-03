import {
  createOrder,
  fetchCurrentUserProfile,
  fetchAdminUsers,
  fetchMenuByOutlet,
  fetchMyOrders,
  fetchPickupSlots,
  fetchVendorIncomingOrders,
  fetchVendorSummaryReport,
  softDeleteAdminUser,
  updateAdminUser,
  updateVendorOrderStatus,
} from './api';

jest.mock('./env', () => ({
  getApiBaseUrl: () => '',
}));

describe('api service', () => {
  const fetchMock = jest.fn();

  beforeEach(() => {
    fetchMock.mockReset();
    global.fetch = fetchMock;
  });

  it('fetches menu and pickup slots with encoded query params', async () => {
    fetchMock
      .mockResolvedValueOnce({ ok: true, json: async () => ({ outletId: 'outlet a', items: [] }) })
      .mockResolvedValueOnce({ ok: true, json: async () => [{ slotId: 'slot-1' }] });

    await expect(fetchMenuByOutlet('outlet a')).resolves.toEqual({ outletId: 'outlet a', items: [] });
    await expect(fetchPickupSlots('outlet a', '2099-01-01')).resolves.toEqual([{ slotId: 'slot-1' }]);

    expect(fetchMock).toHaveBeenNthCalledWith(1, '/api/menu?outletId=outlet%20a');
    expect(fetchMock).toHaveBeenNthCalledWith(
      2,
      '/api/pickup-slots?outletId=outlet%20a&date=2099-01-01',
    );
  });

  it('posts orders and propagates API error text', async () => {
    fetchMock
      .mockResolvedValueOnce({ ok: true, json: async () => ({ orderId: 'ord-1', status: 'received' }) })
      .mockResolvedValueOnce({ ok: false, status: 400, text: async () => 'slot full' });

    await expect(
      createOrder({
        outletId: 'outlet-1',
        slotDate: '2099-01-01',
        slotId: 'slot-1',
        items: [{ itemId: 'item-1', quantity: 1 }],
      }, 'token-1'),
    ).resolves.toEqual({ orderId: 'ord-1', status: 'received' });

    await expect(
      createOrder({
        outletId: 'outlet-1',
        slotDate: '2099-01-01',
        slotId: 'slot-1',
        items: [],
      }, 'token-1'),
    ).rejects.toThrow('slot full');

    expect(fetchMock).toHaveBeenNthCalledWith(
      1,
      '/api/orders',
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({ Authorization: 'Bearer token-1' }),
        body: JSON.stringify({
          outletId: 'outlet-1',
          slotDate: '2099-01-01',
          slotId: 'slot-1',
          items: [{ itemId: 'item-1', quantity: 1 }],
        }),
      }),
    );
  });

  it('fetches and updates vendor workflows', async () => {
    fetchMock
      .mockResolvedValueOnce({ ok: true, json: async () => [{ orderId: 'ord-1' }] })
      .mockResolvedValueOnce({ ok: true, json: async () => ({ orderId: 'ord-1', status: 'ready' }) })
      .mockResolvedValueOnce({ ok: true, json: async () => ({ totals: { orders: 1 } }) })
      .mockResolvedValueOnce({ ok: true, json: async () => ({ user_id: 'user-1', role_id: 2 }) })
      .mockResolvedValueOnce({ ok: true, json: async () => [{ orderId: 'ord-2' }] });

    await expect(fetchVendorIncomingOrders('outlet-1', 'received')).resolves.toEqual([
      { orderId: 'ord-1' },
    ]);
    await expect(updateVendorOrderStatus('ord-1', 'ready')).resolves.toEqual({
      orderId: 'ord-1',
      status: 'ready',
    });
    await expect(fetchVendorSummaryReport('outlet-1', '2099-01-01', '2099-01-02')).resolves.toEqual({
      totals: { orders: 1 },
    });
    await expect(fetchCurrentUserProfile('token-1')).resolves.toEqual({
      user_id: 'user-1',
      role_id: 2,
    });
    await expect(fetchMyOrders('token-1')).resolves.toEqual([{ orderId: 'ord-2' }]);

    expect(fetchMock).toHaveBeenNthCalledWith(
      1,
      '/api/vendor/orders?vendorOutletId=outlet-1&status=received',
      expect.objectContaining({ headers: expect.objectContaining({ 'x-user-role': 'vendor' }) }),
    );
    expect(fetchMock).toHaveBeenNthCalledWith(
      2,
      '/api/orders/ord-1/status',
      expect.objectContaining({ method: 'PATCH' }),
    );
    expect(fetchMock).toHaveBeenNthCalledWith(
      5,
      '/api/orders/me',
      expect.objectContaining({ headers: expect.objectContaining({ Authorization: 'Bearer token-1' }) }),
    );
  });

  it('manages admin user API calls with bearer auth', async () => {
    fetchMock
      .mockResolvedValueOnce({ ok: true, json: async () => [{ user_id: 'user-1' }] })
      .mockResolvedValueOnce({ ok: true, json: async () => ({ user_id: 'user-2', role_id: 2 }) })
      .mockResolvedValueOnce({ ok: true, json: async () => ({ user_id: 'user-2', is_active: false }) });

    await expect(fetchAdminUsers('token-1')).resolves.toEqual([{ user_id: 'user-1' }]);
    await expect(updateAdminUser('token-1', 'user-2', { role_id: 2 })).resolves.toEqual({
      user_id: 'user-2',
      role_id: 2,
    });
    await expect(softDeleteAdminUser('token-1', 'user-2')).resolves.toEqual({
      user_id: 'user-2',
      is_active: false,
    });

    expect(fetchMock).toHaveBeenNthCalledWith(
      1,
      '/api/admin/users',
      expect.objectContaining({ headers: { Authorization: 'Bearer token-1' } }),
    );
    expect(fetchMock).toHaveBeenNthCalledWith(
      2,
      '/api/admin/users/user-2',
      expect.objectContaining({ method: 'PATCH' }),
    );
    expect(fetchMock).toHaveBeenNthCalledWith(
      3,
      '/api/admin/users/user-2',
      expect.objectContaining({ method: 'DELETE' }),
    );
  });

  it('uses fallback error messages when error responses have no body', async () => {
    fetchMock.mockResolvedValue({ ok: false, status: 500, text: async () => '' });

    await expect(fetchMenuByOutlet('outlet-1')).rejects.toThrow('Failed to fetch menu (500)');
    await expect(fetchPickupSlots('outlet-1', '2099-01-01')).rejects.toThrow(
      'Failed to fetch pickup slots (500)',
    );
    await expect(fetchVendorIncomingOrders('outlet-1', 'all')).rejects.toThrow(
      'Failed to fetch vendor orders (500)',
    );
    await expect(updateVendorOrderStatus('ord-1', 'ready')).rejects.toThrow(
      'Failed to update order status (500)',
    );
    await expect(fetchVendorSummaryReport('outlet-1')).rejects.toThrow(
      'Failed to fetch vendor summary (500)',
    );
    await expect(fetchCurrentUserProfile('token-1')).rejects.toThrow(
      'Failed to fetch user profile (500)',
    );
    await expect(fetchAdminUsers('token-1')).rejects.toThrow('Failed to fetch users (500)');
    await expect(updateAdminUser('token-1', 'user-1', { role_id: 2 })).rejects.toThrow(
      'Failed to update user (500)',
    );
    await expect(softDeleteAdminUser('token-1', 'user-1')).rejects.toThrow(
      'Failed to deactivate user (500)',
    );
    await expect(fetchMyOrders('token-1')).rejects.toThrow(
      'Failed to fetch order history (500)',
    );
  });
});
