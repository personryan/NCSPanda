import OrderForm from '../components/order/OrderForm';

interface OrdersPageProps {
  accessToken: string;
}

export default function OrdersPage({ accessToken }: Readonly<OrdersPageProps>) {
  return <OrderForm accessToken={accessToken} />;
}
