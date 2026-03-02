import { RouteObject } from 'react-router-dom';
import ProductsReportsPage from './pages/ProductsReportsPage';
import StockReportsPage from './pages/StockReportsPage';
import GeneralReportsPage from './pages/GeneralReportsPage';
import { InventoryReportsPage } from './pages/InventoryReportsPage';
import GeneralSalesReportPage from './pages/GeneralSalesReportPage';
import ClubSalesReportPage from './pages/ClubSalesReportPage';

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
    {
      path: 'sales/general',
      element: <GeneralSalesReportPage />,
    },
    {
      path: 'sales/club',
      element: <ClubSalesReportPage />,
    },
  ],
};
