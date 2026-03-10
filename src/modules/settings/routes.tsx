import { Navigate, RouteObject } from 'react-router-dom';
import { UserListPage } from './pages/user-list-page';
import { RolesPermissionsPage } from './pages/roles-permissions-page';
import { useAuthStore } from '@/shared/stores/auth-store';

function RoleGuard({
  allowedRoles,
  children,
}: {
  allowedRoles: string[];
  children: React.ReactNode;
}) {
  const user = useAuthStore((state) => state.user);
  const hasRole = allowedRoles.some((r) => user?.roles?.includes(r));

  if (!hasRole) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}

export const settingsRoutes: RouteObject = {
  path: '',
  children: [
    {
      path: 'users',
      element: <UserListPage />,
    },
    {
      path: 'roles-permissions',
      element: (
        <RoleGuard allowedRoles={['SUPER_ADMIN', 'ADMIN']}>
          <RolesPermissionsPage />
        </RoleGuard>
      ),
    },
  ],
};
