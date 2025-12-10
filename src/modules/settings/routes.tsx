import { RouteObject } from 'react-router-dom';
import { UserListPage } from './pages/user-list-page';

export const settingsRoutes: RouteObject = {
  path: '',
  children: [
    {
      path: 'users',
      element: <UserListPage />,
    },
  ],
};
