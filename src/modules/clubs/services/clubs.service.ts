import { apiClient } from '@/shared/lib/api-client';
import type { Club, CreateClubDto, UpdateClubDto } from '../types';

const BASE_URL = '/inventory/clubs';

export const clubsService = {
  async getAll(): Promise<Club[]> {
    const response = await apiClient.get<Club[]>(BASE_URL);
    return response.data;
  },

  async getById(id: string): Promise<Club> {
    const response = await apiClient.get<Club>(`${BASE_URL}/${id}`);
    return response.data;
  },

  async create(data: CreateClubDto): Promise<Club> {
    const response = await apiClient.post<Club>(BASE_URL, data);
    return response.data;
  },

  async update(id: string, data: UpdateClubDto): Promise<Club> {
    const response = await apiClient.put<Club>(`${BASE_URL}/${id}`, data);
    return response.data;
  },

  async delete(id: string): Promise<void> {
    await apiClient.delete(`${BASE_URL}/${id}`);
  },
};
