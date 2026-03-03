import { RouteObject } from 'react-router-dom';
import { UserListPage } from './pages/user-list-page';
import { AppSettingsPage } from './pages/app-settings-page';

export const settingsRoutes: RouteObject = {
  path: '',
  children: [
    {
      path: 'users',
      element: <UserListPage />,
    },
    {
      path: 'configurations',
      element: <AppSettingsPage />,
    },
  ],
};
