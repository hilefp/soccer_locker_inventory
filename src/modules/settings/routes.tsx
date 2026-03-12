import { Navigate, RouteObject } from 'react-router-dom';
import { UserListPage } from './pages/user-list-page';
<<<<<<< HEAD
import { UserProfilePage } from './pages/user-profile-page';
=======
import { RolesPermissionsPage } from './pages/roles-permissions-page';
import { CouponListPage } from './pages/coupon-list-page';
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
import { AppSettingsPage } from './pages/app-settings-page';
>>>>>>> 5d9a7e2db9bab52bf311658bcdd5a98cd8f03073

export const settingsRoutes: RouteObject = {
  path: '',
  children: [
    {
      path: 'users',
      element: <UserListPage />,
    },
    {
<<<<<<< HEAD
      path: 'profile',
      element: <UserProfilePage />,
=======
      path: 'roles-permissions',
      element: (
        <RoleGuard allowedRoles={['SUPER_ADMIN', 'ADMIN']}>
          <RolesPermissionsPage />
        </RoleGuard>
      ),
    },
    {
      path: 'coupon-codes',
      element: <CouponListPage />,
>>>>>>> 5d9a7e2db9bab52bf311658bcdd5a98cd8f03073
    },
  ],
};
