import { RouteObject } from 'react-router';
import { CatalogListPage } from './pages/catalog-list-page';

export const catalogsRoutes: RouteObject = {
  path: '',
  children: [
    { path: '', element: <CatalogListPage /> },
  ],
};
