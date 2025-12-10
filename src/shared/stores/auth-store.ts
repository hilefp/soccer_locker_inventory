import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { authService } from '@/modules/auth/services/auth-service';
import type { AuthState, LoginRequest, User } from '@/modules/auth/types';

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => {
      // Listen for unauthorized events from axios interceptor
      if (typeof window !== 'undefined') {
        window.addEventListener('auth:unauthorized', () => {
          set({
            user: null,
            accessToken: null,
            isAuthenticated: false,
            isLoading: false,
            error: 'Session expired. Please login again.',
          });
        });
      }

      return {
        user: null,
        accessToken: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
        _hasHydrated: false,

      setHasHydrated: (hasHydrated: boolean) => {
        set({ _hasHydrated: hasHydrated });
      },

      login: async (credentials: LoginRequest) => {
        set({ isLoading: true, error: null });
        try {
          const response = await authService.login(credentials);

          // Store token in localStorage for axios interceptor
          localStorage.setItem('accessToken', response.accessToken);
          localStorage.setItem('user', JSON.stringify(response.user));

          set({
            user: response.user,
            accessToken: response.accessToken,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });
        } catch (error: unknown) {
          const errorMessage =
            (error as { response?: { data?: { message?: string } }; message?: string })?.response?.data?.message ||
            (error as { message?: string })?.message ||
            'Login failed. Please try again.';

          set({
            user: null,
            accessToken: null,
            isAuthenticated: false,
            isLoading: false,
            error: errorMessage,
          });
          throw error;
        }
      },

      logout: () => {
        // Call logout service
        authService.logout().catch(() => {
          // Silent fail on logout service error
        });

        // Clear localStorage
        localStorage.removeItem('accessToken');
        localStorage.removeItem('user');

        // Reset state
        set({
          user: null,
          accessToken: null,
          isAuthenticated: false,
          isLoading: false,
          error: null,
        });
      },

      validateSession: async () => {
        const token = localStorage.getItem('accessToken');

        if (!token) {
          set({
            user: null,
            accessToken: null,
            isAuthenticated: false,
            isLoading: false,
          });
          return false;
        }

        try {
          const user = await authService.getProfile();

          set({
            user,
            accessToken: token,
            isAuthenticated: true,
            error: null,
          });

          return true;
        } catch {
          // Clear auth state if profile fetch fails
          localStorage.removeItem('accessToken');
          localStorage.removeItem('user');

          set({
            user: null,
            accessToken: null,
            isAuthenticated: false,
            isLoading: false,
          });

          return false;
        }
      },

      setUser: (user: User | null) => {
        set({ user, isAuthenticated: !!user });
      },

      setToken: (token: string | null) => {
        set({ accessToken: token });
        if (token) {
          localStorage.setItem('accessToken', token);
        } else {
          localStorage.removeItem('accessToken');
        }
      },

      clearError: () => {
        set({ error: null });
      },
      };
    },
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        isAuthenticated: state.isAuthenticated,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);
