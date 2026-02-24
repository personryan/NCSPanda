import { useEffect, useMemo, useState } from 'react';
import {
  createOrder,
  fetchMenuByOutlet,
  fetchPickupSlots,
  MenuItem,
  PickupSlot,
} from '../../services/api';
import SlotPicker from './SlotPicker';
import OrderSummary from './OrderSummary';

const outletOptions = [
  { id: 'outlet-b6-chicken-rice', label: 'B6 Chicken Rice' },
  { id: 'outlet-b6-noodles', label: 'B6 Noodles' },
];

export default function OrderForm() {
  const [outletId, setOutletId] = useState(outletOptions[0].id);
  const [slotDate, setSlotDate] = useState('2099-01-01');
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [slots, setSlots] = useState<PickupSlot[]>([]);
  const [selectedSlotId, setSelectedSlotId] = useState('');
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [feedback, setFeedback] = useState<{ type: 'ok' | 'err'; msg: string } | null>(null);

  useEffect(() => {
    fetchMenuByOutlet(outletId)
      .then((menu) => setMenuItems(menu.items.filter((i) => i.availability.isAvailable)))
      .catch((err) => setFeedback({ type: 'err', msg: err.message }));
  }, [outletId]);

  useEffect(() => {
    fetchPickupSlots(outletId, slotDate)
      .then((data) => {
        setSlots(data);
        if (!data.find((s) => s.slotId === selectedSlotId)) setSelectedSlotId('');
      })
      .catch((err) => setFeedback({ type: 'err', msg: err.message }));
  }, [outletId, slotDate, selectedSlotId]);

  const selectedItems = useMemo(
    () =>
      menuItems
        .filter((item) => (quantities[item.itemId] || 0) > 0)
        .map((item) => ({ ...item, quantity: quantities[item.itemId] || 0 })),
    [menuItems, quantities],
  );

  const submitOrder = async () => {
    if (!selectedSlotId) {
      setFeedback({ type: 'err', msg: 'Please select a pickup slot before submitting.' });
      return;
    }
    if (!selectedItems.length) {
      setFeedback({ type: 'err', msg: 'Please add at least one item to your order.' });
      return;
    }

    try {
      const result = await createOrder({
        outletId,
        slotDate,
        slotId: selectedSlotId,
        items: selectedItems.map((item) => ({ itemId: item.itemId, quantity: item.quantity })),
      });
      setFeedback({ type: 'ok', msg: `Order submitted successfully. ID: ${result.orderId}` });
      setQuantities({});
      setSelectedSlotId('');
    } catch (err) {
      setFeedback({ type: 'err', msg: (err as Error).message });
    }
  };

  return (
    <div className="order-page">
      <h1>Place Pre-order</h1>
      <p className="user-meta">No payment required in this phase.</p>

      <div className="order-grid">
        <section className="menu-surface">
          <label className="form-label" htmlFor="order-outlet">Outlet</label>
          <select id="order-outlet" className="form-input" value={outletId} onChange={(e) => setOutletId(e.target.value)}>
            {outletOptions.map((o) => (
              <option key={o.id} value={o.id}>{o.label}</option>
            ))}
          </select>

          <label className="form-label" htmlFor="slot-date">Pickup date</label>
          <input id="slot-date" className="form-input" type="date" value={slotDate} onChange={(e) => setSlotDate(e.target.value)} />

          <h2 style={{ marginTop: '1rem' }}>Pickup Slots</h2>
          <SlotPicker slots={slots} selectedSlotId={selectedSlotId} onSelect={setSelectedSlotId} />

          <h2 style={{ marginTop: '1rem' }}>Items</h2>
          <div className="menu-grid">
            {menuItems.map((item) => (
              <div className="menu-item-card" key={item.itemId}>
                <div className="menu-item-header">
                  <h3>{item.name}</h3>
                  <span>{item.currency} {item.price.toFixed(2)}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.5rem' }}>
                  <button type="button" className="btn btn-ghost" onClick={() => setQuantities((q) => ({ ...q, [item.itemId]: Math.max(0, (q[item.itemId] || 0) - 1) }))}>-</button>
                  <span>{quantities[item.itemId] || 0}</span>
                  <button type="button" className="btn btn-ghost" onClick={() => setQuantities((q) => ({ ...q, [item.itemId]: (q[item.itemId] || 0) + 1 }))}>+</button>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="menu-surface">
          <OrderSummary items={selectedItems} />
          <button type="button" className="btn btn-primary" onClick={submitOrder}>Submit pre-order</button>
          {feedback ? <p className={feedback.type === 'ok' ? 'success-note' : 'alert-error'}>{feedback.msg}</p> : null}
        </section>
      </div>
    </div>
  );
}
