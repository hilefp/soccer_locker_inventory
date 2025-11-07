import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/shared/stores/auth-store';

interface GuestRouteProps {
  redirectTo?: string;
}

export function GuestRoute({ redirectTo = '/dashboard' }: GuestRouteProps) {
  const { isAuthenticated } = useAuthStore();
  const location = useLocation();

  if (isAuthenticated) {
    // Get the intended destination from location state, or use default
    const from = (location.state as any)?.from?.pathname || redirectTo;
    return <Navigate to={from} replace />;
  }

  // User is not authenticated, show the auth pages
  return <Outlet />;
}
