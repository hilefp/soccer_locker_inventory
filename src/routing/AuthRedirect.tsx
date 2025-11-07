import { Navigate } from 'react-router-dom';
import { useAuthStore } from '@/shared/stores/auth-store';

export function AuthRedirect() {
  const { isAuthenticated } = useAuthStore();

  return <Navigate to={isAuthenticated ? '/dashboard' : '/auth/login'} replace />;
}
