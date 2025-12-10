import { apiClient } from '@/shared/lib/api-client';
import {
  Warehouse,
  CreateWarehouseDto,
  UpdateWarehouseDto,
  WarehouseFilters,
  WarehouseStatistics,
} from '../types/warehouse.types';

const WAREHOUSE_ENDPOINT = '/inventory/warehouses';

// Helper to build query params
const buildQueryParams = (filters: WarehouseFilters): string => {
  const params = new URLSearchParams();

  if (filters.warehouseType) params.append('warehouseType', filters.warehouseType);
  if (filters.isActive !== undefined) params.append('isActive', String(filters.isActive));
  if (filters.city) params.append('city', filters.city);
  if (filters.state) params.append('state', filters.state);
  if (filters.country) params.append('country', filters.country);
  if (filters.search) params.append('search', filters.search);

  const queryString = params.toString();
  return queryString ? `?${queryString}` : '';
};

export const warehouseService = {
  /**
   * Get all warehouses with optional filters
   */
  async getAll(filters: WarehouseFilters = {}): Promise<Warehouse[]> {
    const queryParams = buildQueryParams(filters);

    const response = await apiClient.get<Warehouse[]>(`${WAREHOUSE_ENDPOINT}${queryParams}`);

    return response.data;
  },

  /**
   * Get warehouse by ID
   */
  async getById(id: string): Promise<Warehouse> {
    const response = await apiClient.get<Warehouse>(`${WAREHOUSE_ENDPOINT}/${id}`);

    return response.data;
  },

  /**
   * Get warehouse by code
   */
  async getByCode(code: string): Promise<Warehouse> {
    const response = await apiClient.get<Warehouse>(`${WAREHOUSE_ENDPOINT}/code/${code}`);

    return response.data;
  },

  /**
   * Get warehouse statistics
   */
  async getStatistics(id: string): Promise<WarehouseStatistics> {
    const response = await apiClient.get<WarehouseStatistics>(
      `${WAREHOUSE_ENDPOINT}/${id}/statistics`
    );

    return response.data;
  },

  /**
   * Create new warehouse
   */
  async create(data: CreateWarehouseDto): Promise<Warehouse> {
    const response = await apiClient.post<Warehouse>(WAREHOUSE_ENDPOINT, data);

    return response.data;
  },

  /**
   * Update warehouse
   */
  async update(id: string, data: UpdateWarehouseDto): Promise<Warehouse> {
    const response = await apiClient.put<Warehouse>(`${WAREHOUSE_ENDPOINT}/${id}`, data);

    return response.data;
  },

  /**
   * Activate warehouse
   */
  async activate(id: string): Promise<Warehouse> {
    const response = await apiClient.put<Warehouse>(
      `${WAREHOUSE_ENDPOINT}/${id}/activate`,
      {}
    );

    return response.data;
  },

  /**
   * Deactivate warehouse
   */
  async deactivate(id: string): Promise<Warehouse> {
    const response = await apiClient.put<Warehouse>(
      `${WAREHOUSE_ENDPOINT}/${id}/deactivate`,
      {}
    );

    return response.data;
  },

  /**
   * Soft delete warehouse
   */
  async delete(id: string): Promise<Warehouse> {
    const response = await apiClient.delete<Warehouse>(`${WAREHOUSE_ENDPOINT}/${id}`);

    return response.data;
  },

  /**
   * Hard delete warehouse (permanent)
   */
  async hardDelete(id: string): Promise<void> {
    await apiClient.delete(`${WAREHOUSE_ENDPOINT}/${id}/hard`);
  },
};
