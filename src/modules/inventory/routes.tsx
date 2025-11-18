import { RouteObject } from 'react-router';
import { WarehouseListPage } from './pages/warehouse-list-page';
import { WarehouseFormPage } from './pages/warehouse-form-page';
import { WarehouseStatisticsPage } from './pages/warehouse-statistics-page';

export const inventoryRoutes: RouteObject = {
  path: '',
  children: [
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
