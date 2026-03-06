import { RouteObject } from 'react-router-dom';
import { UserListPage } from './pages/user-list-page';
import { UserProfilePage } from './pages/user-profile-page';

export const settingsRoutes: RouteObject = {
  path: '',
  children: [
    {
      path: 'users',
      element: <UserListPage />,
    },
    {
      path: 'profile',
      element: <UserProfilePage />,
    },
  ],
};
