interface VendorOrder {
  orderId: string;
  customerId: string;
  slotDate: string;
  slotId: string;
  status: string;
  itemsSummary: string;
  createdAt: string;
}

export default function OrderRow({ order }: { order: VendorOrder }) {
  const slotTime = order.slotId.split('-').slice(-1)[0] || '-';

  return (
    <tr>
      <td>{order.orderId}</td>
      <td>{order.customerId}</td>
      <td>{order.slotDate} {slotTime}</td>
      <td>{order.itemsSummary}</td>
      <td>{order.status}</td>
    </tr>
  );
}
