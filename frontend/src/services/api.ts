import { getApiBaseUrl } from './env';

export interface MenuItem {
  itemId: string;
  name: string;
  description?: string;
  price: number;
  currency: string;
  availability: {
    isAvailable: boolean;
    status: 'available' | 'limited' | 'sold_out';
  };
}

export interface OutletMenu {
  outletId: string;
  outletName: string;
  items: MenuItem[];
}

export interface PickupSlot {
  slotId: string;
  startTime: string;
  endTime: string;
  capacity: number;
  booked: number;
  available: number;
  isAvailable: boolean;
}

export interface CreateOrderPayload {
  outletId: string;
  slotDate: string;
  slotId: string;
  items: Array<{ itemId: string; quantity: number; notes?: string }>;
  customerId?: string;
}

export type OrderStatus = 'received' | 'preparing' | 'ready';

export interface VendorIncomingOrder {
  orderId: string;
  customerId: string;
  outletId: string;
  slotDate: string;
  slotId: string;
  status: OrderStatus;
  createdAt: string;
  itemsSummary: string;
}

export interface TrackedOrder extends VendorIncomingOrder {
  items: Array<{ itemId: string; name: string; quantity: number; notes?: string }>;
}


export interface VendorSummaryReport {
  outletId: string;
  period: {
    fromDate: string | null;
    toDate: string | null;
  };
  totals: {
    orders: number;
    items: number;
  };
  statusBreakdown: {
    received: number;
    preparing: number;
    ready: number;
  };
  topItems: Array<{ itemId: string; name: string; quantity: number }>;
}

export interface AdminUser {
  user_id: string;
  role_id: number;
  first_name: string | null;
  last_name: string | null;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
  role?: {
    role_name: 'customer' | 'vendor' | 'admin';
  } | null;
}

export interface AdminUserPayload {
  role_id?: number;
  first_name?: string;
  last_name?: string;
  is_active?: boolean;
}

const API_BASE = getApiBaseUrl();

export async function fetchMenuByOutlet(outletId: string): Promise<OutletMenu> {
  const response = await fetch(`${API_BASE}/api/menu?outletId=${encodeURIComponent(outletId)}`);

  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || `Failed to fetch menu (${response.status})`);
  }

  return response.json() as Promise<OutletMenu>;
}

export async function fetchPickupSlots(outletId: string, date: string): Promise<PickupSlot[]> {
  const response = await fetch(
    `${API_BASE}/api/pickup-slots?outletId=${encodeURIComponent(outletId)}&date=${encodeURIComponent(date)}`,
  );

  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || `Failed to fetch pickup slots (${response.status})`);
  }

  return response.json() as Promise<PickupSlot[]>;
}

export async function createOrder(payload: CreateOrderPayload) {
  const response = await fetch(`${API_BASE}/api/orders`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-user-role': 'customer',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || `Failed to submit order (${response.status})`);
  }

  return response.json() as Promise<{ orderId: string; status: string }>;
}

export async function fetchVendorIncomingOrders(
  outletId: string,
  status?: OrderStatus | 'all',
): Promise<VendorIncomingOrder[]> {
  const params = new URLSearchParams({ vendorOutletId: outletId });
  if (status && status !== 'all') params.set('status', status);

  const response = await fetch(`${API_BASE}/api/vendor/orders?${params.toString()}`, {
    headers: {
      'x-user-role': 'vendor',
      'x-vendor-outlet-id': outletId,
    },
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || `Failed to fetch vendor orders (${response.status})`);
  }

  return response.json() as Promise<VendorIncomingOrder[]>;
}

export async function updateVendorOrderStatus(
  orderId: string,
  status: Exclude<OrderStatus, 'received'>,
): Promise<TrackedOrder> {
  const response = await fetch(`${API_BASE}/api/orders/${encodeURIComponent(orderId)}/status`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'x-user-role': 'vendor',
    },
    body: JSON.stringify({ status }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || `Failed to update order status (${response.status})`);
  }

  return response.json() as Promise<TrackedOrder>;
}



export async function fetchVendorSummaryReport(
  outletId: string,
  fromDate?: string,
  toDate?: string,
): Promise<VendorSummaryReport> {
  const params = new URLSearchParams({ outletId });
  if (fromDate) params.set('fromDate', fromDate);
  if (toDate) params.set('toDate', toDate);

  const response = await fetch(`${API_BASE}/api/reports/vendor-summary?${params.toString()}`, {
    headers: {
      'x-user-role': 'vendor',
    },
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || `Failed to fetch vendor summary (${response.status})`);
  }

  return response.json() as Promise<VendorSummaryReport>;
}
export async function fetchCurrentUserProfile(accessToken: string) {
  const response = await fetch(`${API_BASE}/api/users/me`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || `Failed to fetch user profile (${response.status})`);
  }

  return response.json() as Promise<{
    user_id: string;
    role?: string | null;
    role_id?: number | null;
  }>;
}

function adminHeaders(accessToken: string) {
  return {
    Authorization: `Bearer ${accessToken}`,
    'Content-Type': 'application/json',
  };
}

export async function fetchAdminUsers(accessToken: string): Promise<AdminUser[]> {
  const response = await fetch(`${API_BASE}/api/admin/users`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || `Failed to fetch users (${response.status})`);
  }

  return response.json() as Promise<AdminUser[]>;
}

export async function updateAdminUser(
  accessToken: string,
  userId: string,
  payload: AdminUserPayload,
): Promise<AdminUser> {
  const response = await fetch(`${API_BASE}/api/admin/users/${encodeURIComponent(userId)}`, {
    method: 'PATCH',
    headers: adminHeaders(accessToken),
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || `Failed to update user (${response.status})`);
  }

  return response.json() as Promise<AdminUser>;
}

export async function softDeleteAdminUser(
  accessToken: string,
  userId: string,
): Promise<AdminUser> {
  const response = await fetch(`${API_BASE}/api/admin/users/${encodeURIComponent(userId)}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || `Failed to deactivate user (${response.status})`);
  }

  return response.json() as Promise<AdminUser>;
}
