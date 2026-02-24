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

const API_BASE = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000').replace(/\/$/, '');

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
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || `Failed to submit order (${response.status})`);
  }

  return response.json() as Promise<{ orderId: string; status: string }>;
}
