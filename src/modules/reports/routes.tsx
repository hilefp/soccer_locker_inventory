import { RouteObject } from 'react-router-dom';
import ProductsReportsPage from './pages/ProductsReportsPage';
import StockReportsPage from './pages/StockReportsPage';
import GeneralReportsPage from './pages/GeneralReportsPage';
import { InventoryReportsPage } from './pages/InventoryReportsPage';

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
    {
      path: 'inventory',
      element: <InventoryReportsPage />,
    },
  ],
};
