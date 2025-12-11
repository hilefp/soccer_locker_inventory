import { RouteObject } from 'react-router-dom';
import ProductsReportsPage from './pages/ProductsReportsPage';
import StockReportsPage from './pages/StockReportsPage';

export const reportsRoutes: RouteObject = {
  path: '',
  children: [
    {
      path: 'products',
      element: <ProductsReportsPage />,
    },
    {
      path: 'stock',
      element: <StockReportsPage />,
    },
  ],
};
