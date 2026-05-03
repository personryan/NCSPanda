import OrderForm from '../components/order/OrderForm';

interface OrdersPageProps {
  accessToken: string;
}

export default function OrdersPage({ accessToken }: OrdersPageProps) {
  return <OrderForm accessToken={accessToken} />;
}
