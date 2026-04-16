import { apiClient } from '@/shared/lib/api-client';
import {
  Catalog,
  CreateCatalogDto,
  UpdateCatalogDto,
} from '../types/catalog.types';

export const catalogService = {
  // Admin endpoints
  async getCatalogs(includeInactive = false): Promise<Catalog[]> {
    const params = includeInactive ? '?includeInactive=true' : '';
    const response = await apiClient.get<Catalog[]>(`/inventory/catalogs${params}`);
    return response.data;
  },

  async getCatalogById(id: string): Promise<Catalog> {
    const response = await apiClient.get<Catalog>(`/inventory/catalogs/${id}`);
    return response.data;
  },

  async createCatalog(data: CreateCatalogDto): Promise<Catalog> {
    const response = await apiClient.post<Catalog>('/inventory/catalogs', data);
    return response.data;
  },

  async updateCatalog(id: string, data: UpdateCatalogDto): Promise<Catalog> {
    const response = await apiClient.put<Catalog>(`/inventory/catalogs/${id}`, data);
    return response.data;
  },

  async deleteCatalog(id: string): Promise<void> {
    await apiClient.delete(`/inventory/catalogs/${id}`);
  },
};
