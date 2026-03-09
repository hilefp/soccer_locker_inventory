import { RouteObject } from 'react-router-dom';
import { UserListPage } from './pages/user-list-page';
import { RolesPermissionsPage } from './pages/roles-permissions-page';

export const settingsRoutes: RouteObject = {
  path: '',
  children: [
    {
      path: 'users',
      element: <UserListPage />,
    },
    {
      path: 'roles-permissions',
      element: <RolesPermissionsPage />,
    },
  ],
};
