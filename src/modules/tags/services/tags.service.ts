import { apiClient } from '@/shared/lib/api-client';
import type { Tag, CreateTagDto, UpdateTagDto } from '../types/tag';

const BASE_URL = '/inventory/tags';

export const tagsService = {
  async getAll(includeInactive?: boolean): Promise<Tag[]> {
    const params = includeInactive ? { includeInactive: true } : {};
    const response = await apiClient.get<Tag[]>(BASE_URL, { params });
    return response.data;
  },

  async getById(id: string): Promise<Tag> {
    const response = await apiClient.get<Tag>(`${BASE_URL}/${id}`);
    return response.data;
  },

  async create(data: CreateTagDto): Promise<Tag> {
    const response = await apiClient.post<Tag>(BASE_URL, data);
    return response.data;
  },

  async update(id: string, data: UpdateTagDto): Promise<Tag> {
    const response = await apiClient.put<Tag>(`${BASE_URL}/${id}`, data);
    return response.data;
  },

  async delete(id: string): Promise<void> {
    await apiClient.delete(`${BASE_URL}/${id}`);
  },
};
