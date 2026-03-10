import { useAuthStore } from '@/shared/stores/auth-store';
import { useNavigate } from 'react-router-dom';
import type { LoginRequest } from '../types';

export function useAuth() {
  const navigate = useNavigate();
  const {
    user,
    isAuthenticated,
    isLoading,
    error,
    login: loginAction,
    logout: logoutAction,
    clearError,
  } = useAuthStore();

  const login = async (credentials: LoginRequest) => {
    try {
      await loginAction(credentials);
      navigate('/dashboard');
    } catch (error) {
      // Error is already set in the store
      console.error('Login failed:', error);
    }
  };

  const logout = () => {
    logoutAction();
    navigate('/auth/login');
  };

  const hasRole = (role: string): boolean => {
    return user?.roles?.includes(role) ?? false;
  };

  const hasAnyRole = (roles: string[]): boolean => {
    return roles.some((role) => hasRole(role));
  };

  const hasPermission = (permission: string): boolean => {
    if (user?.roles?.includes('SUPER_ADMIN')) return true;
    return user?.permissions?.includes(permission) ?? false;
  };

  const hasAnyPermission = (permissions: string[]): boolean => {
    if (user?.roles?.includes('SUPER_ADMIN')) return true;
    return permissions.some((p) => user?.permissions?.includes(p)) ?? false;
  };

  return {
    user,
    isAuthenticated,
    isLoading,
    error,
    login,
    logout,
    hasRole,
    hasAnyRole,
    hasPermission,
    hasAnyPermission,
    clearError,
  };
}
