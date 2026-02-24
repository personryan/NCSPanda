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

const API_BASE = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000').replace(/\/$/, '');

export async function fetchMenuByOutlet(outletId: string): Promise<OutletMenu> {
  const response = await fetch(`${API_BASE}/api/menu?outletId=${encodeURIComponent(outletId)}`);

  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || `Failed to fetch menu (${response.status})`);
  }

  return response.json() as Promise<OutletMenu>;
}
