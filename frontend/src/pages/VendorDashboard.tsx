import { useEffect, useState } from 'react';
import IncomingOrdersTable from '../components/vendor/IncomingOrdersTable';
import { fetchVendorIncomingOrders, VendorIncomingOrder } from '../services/api';

const outletOptions = [
  { id: 'outlet-b6-chicken-rice', label: 'B6 Chicken Rice' },
  { id: 'outlet-b6-noodles', label: 'B6 Noodles' },
];

export default function VendorDashboardPage() {
  const [outletId, setOutletId] = useState(outletOptions[0].id);
  const [orders, setOrders] = useState<VendorIncomingOrder[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(null);

    fetchVendorIncomingOrders(outletId)
      .then((data) => {
        if (active) setOrders(data);
      })
      .catch((err) => {
        if (active) setError(err.message || 'Failed to load incoming orders');
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [outletId]);

  return (
    <section className="menu-page">
      <div className="menu-page-header">
        <h1>Vendor Incoming Orders</h1>
        <p>Monitor incoming pre-orders by pickup slot.</p>
      </div>

      <div className="menu-toolbar">
        <label htmlFor="vendor-outlet" className="form-label">Outlet scope</label>
        <select id="vendor-outlet" className="form-input" value={outletId} onChange={(e) => setOutletId(e.target.value)}>
          {outletOptions.map((o) => (
            <option key={o.id} value={o.id}>{o.label}</option>
          ))}
        </select>
      </div>

      <div className="menu-surface">
        {loading ? <p>Loading incoming orders…</p> : null}
        {error ? <p className="alert-error">{error}</p> : null}
        {!loading && !error ? <IncomingOrdersTable orders={orders} /> : null}
      </div>
    </section>
  );
}
