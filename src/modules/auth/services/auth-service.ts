import { apiClient } from '@/shared/lib/api-client';
import type { LoginRequest, LoginResponse } from '../types';

export const authService = {
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    const response = await apiClient.post<LoginResponse>(
      '/inventory/auth/login',
      credentials
    );
    return response.data;
  },

  async logout(): Promise<void> {
    // If you have a logout endpoint on the backend, call it here
    // await apiClient.post('/inventory/auth/logout');
  },
};
