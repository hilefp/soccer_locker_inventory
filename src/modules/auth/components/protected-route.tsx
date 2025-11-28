import { useEffect, useState } from 'react';
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
  const { isAuthenticated, user, validateSession, _hasHydrated } = useAuthStore();
  const location = useLocation();
  const [isValidating, setIsValidating] = useState(false);

  useEffect(() => {
    const checkSession = async () => {
      // Wait for hydration to complete
      if (!_hasHydrated) {
        return;
      }

      const hasToken = !!localStorage.getItem('accessToken');

      // Only validate if we have a token but are not authenticated
      // This handles the case where the page is refreshed
      if (hasToken && !isAuthenticated) {
        setIsValidating(true);
        await validateSession();
        setIsValidating(false);
      }
    };

    checkSession();
  }, [_hasHydrated, isAuthenticated, validateSession]);

  // Show loading state while waiting for hydration or validating session
  if (!_hasHydrated || isValidating) {
    return null; // or return a loading spinner component
  }

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
