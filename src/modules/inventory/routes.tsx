import { RouteObject } from 'react-router';
import { WarehouseListPage } from './pages/warehouse-list-page';
import { WarehouseFormPage } from './pages/warehouse-form-page';
import { WarehouseStatisticsPage } from './pages/warehouse-statistics-page';
import { StockVariantListPage } from './pages/stock-variant-list-page';
import { StockVariantDetailPage } from './pages/stock-variant-detail-page';
import { StockEntryCreatePage } from './pages/stock-entry-create-page';

export const inventoryRoutes: RouteObject = {
  path: '',
  children: [
    {
      path: '',
      element: <StockVariantListPage />,
    },
    {
      path: 'stocks/variant/:variantId',
      element: <StockVariantDetailPage />,
    },
    {
      path: 'stock-entries/new',
      element: <StockEntryCreatePage />,
    },
    {
      path: 'warehouses',
      children: [
        {
          path: '',
          element: <WarehouseListPage />,
        },
        {
          path: 'new',
          element: <WarehouseFormPage />,
        },
        {
          path: ':id/edit',
          element: <WarehouseFormPage />,
        },
        {
          path: ':id',
          element: <WarehouseStatisticsPage />,
        },
      ],
    },
  ],
};
