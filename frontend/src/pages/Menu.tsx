import { useEffect, useMemo, useState } from 'react';
import MenuList from '../components/MenuList';
import { fetchMenuByOutlet, OutletMenu } from '../services/api';

const outletOptions = [
  { id: 'outlet-b6-chicken-rice', label: 'B6 Chicken Rice' },
  { id: 'outlet-b6-noodles', label: 'B6 Noodles' },
];

export default function MenuPage() {
  const [outletId, setOutletId] = useState(outletOptions[0].id);
  const [menu, setMenu] = useState<OutletMenu | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(null);

    fetchMenuByOutlet(outletId)
      .then((result) => {
        if (active) setMenu(result);
      })
      .catch((err) => {
        if (active) setError(err.message || 'Failed to load menu');
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [outletId]);

  const outletLabel = useMemo(
    () => outletOptions.find((o) => o.id === outletId)?.label || outletId,
    [outletId],
  );
  
  return (
    <section className="menu-page">
      <div className="menu-page-header">
        <h1>Browse Menu</h1>
        <p>Choose an outlet and view available items before placing your pre-order.</p>
      </div>

      <div className="menu-toolbar">
        <label htmlFor="outlet" className="form-label">Outlet</label>
        <select
          id="outlet"
          className="form-input"
          value={outletId}
          onChange={(e) => setOutletId(e.target.value)}
        >
          {outletOptions.map((outlet) => (
            <option key={outlet.id} value={outlet.id}>
              {outlet.label}
            </option>
          ))}
        </select>
      </div>

      <div className="menu-surface">
        <h2>{menu?.outletName || outletLabel}</h2>
        {loading ? <p>Loading menu…</p> : null}
        {error ? <p className="alert-error">{error}</p> : null}
        {!loading && !error && menu ? <MenuList items={menu.items} /> : null}
      </div>
    </section>
  );
}
