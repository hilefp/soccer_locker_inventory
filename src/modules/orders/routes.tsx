import type { RouteObject } from 'react-router-dom';
import { CurrentOrdersPage } from './pages/current-orders-page';
import { OrdersListPage } from './pages/orders-list-page';
import { OrderDetailPage } from './pages/order-detail-page';

export const ordersRoutes: RouteObject = {
  path: '',
  children: [
    { path: '', element: <OrdersListPage /> },
    { path: 'current', element: <CurrentOrdersPage /> },
    { path: ':orderId', element: <OrderDetailPage /> },
  ],
};
