import { RouteObject } from 'react-router-dom';
import ProductsReportsPage from './pages/ProductsReportsPage';
import StockReportsPage from './pages/StockReportsPage';
import GeneralReportsPage from './pages/GeneralReportsPage';

export const reportsRoutes: RouteObject = {
  path: '',
  children: [
    {
      index: true,
      element: <GeneralReportsPage />,
    },
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
