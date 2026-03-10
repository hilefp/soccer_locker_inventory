import { apiClient } from '@/shared/lib/api-client';
import type { AppSetting, UpdateAppSettingDto } from '../types';

const BASE_URL = '/inventory/settings';

export const appSettingsService = {
  async getAll(): Promise<AppSetting[]> {
    const response = await apiClient.get<AppSetting[]>(BASE_URL);
    return response.data;
  },

  async getByKey(key: string): Promise<AppSetting> {
    const response = await apiClient.get<AppSetting>(`${BASE_URL}/${key}`);
    return response.data;
  },

  async update(key: string, data: UpdateAppSettingDto): Promise<AppSetting> {
    const response = await apiClient.patch<AppSetting>(`${BASE_URL}/${key}`, data);
    return response.data;
  },
};
