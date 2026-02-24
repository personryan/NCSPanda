interface SelectedItem {
  itemId: string;
  name: string;
  quantity: number;
  price: number;
  currency: string;
}

interface OrderSummaryProps {
  items: SelectedItem[];
}

export default function OrderSummary({ items }: OrderSummaryProps) {
  const total = items.reduce((sum, item) => sum + item.quantity * item.price, 0);

  return (
    <div className="order-summary">
      <h3>Order Summary</h3>
      {!items.length ? <p className="menu-empty">No items selected yet.</p> : null}
      {items.map((item) => (
        <div key={item.itemId} className="order-summary-row">
          <span>{item.name} × {item.quantity}</span>
          <strong>{item.currency} {(item.quantity * item.price).toFixed(2)}</strong>
        </div>
      ))}
      <div className="order-summary-total">
        <span>Total</span>
        <strong>SGD {total.toFixed(2)}</strong>
      </div>
    </div>
  );
}
