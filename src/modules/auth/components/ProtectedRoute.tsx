import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/shared/stores/auth-store';

interface ProtectedRouteProps {
  allowedRoles?: string[];
  redirectTo?: string;
}

export function ProtectedRoute({
  allowedRoles,
  redirectTo = '/auth/login',
}: ProtectedRouteProps) {
  const { isAuthenticated, user } = useAuthStore();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  if (allowedRoles && allowedRoles.length > 0) {
    const hasRequiredRole = allowedRoles.some((role) =>
      user?.roles?.includes(role)
    );

    if (!hasRequiredRole) {
      return <Navigate to="/dashboard" replace />;
    }
  }

  return <Outlet />;
}
