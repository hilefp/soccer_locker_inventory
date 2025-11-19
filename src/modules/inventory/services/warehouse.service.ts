import axios from 'axios';
import {
  Warehouse,
  CreateWarehouseDto,
  UpdateWarehouseDto,
  WarehouseFilters,
  WarehouseStatistics,
} from '../types/warehouse.types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';
const WAREHOUSE_ENDPOINT = `${API_BASE_URL}/inventory/warehouses`;

// Helper to get auth token from localStorage
const getAuthToken = () => {
  const token = localStorage.getItem('authToken');
  return token;
};

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
    const token = getAuthToken();
    const queryParams = buildQueryParams(filters);

    const response = await axios.get<Warehouse[]>(`${WAREHOUSE_ENDPOINT}${queryParams}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data;
  },

  /**
   * Get warehouse by ID
   */
  async getById(id: string): Promise<Warehouse> {
    const token = getAuthToken();

    const response = await axios.get<Warehouse>(`${WAREHOUSE_ENDPOINT}/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data;
  },

  /**
   * Get warehouse by code
   */
  async getByCode(code: string): Promise<Warehouse> {
    const token = getAuthToken();

    const response = await axios.get<Warehouse>(`${WAREHOUSE_ENDPOINT}/code/${code}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data;
  },

  /**
   * Get warehouse statistics
   */
  async getStatistics(id: string): Promise<WarehouseStatistics> {
    const token = getAuthToken();

    const response = await axios.get<WarehouseStatistics>(
      `${WAREHOUSE_ENDPOINT}/${id}/statistics`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return response.data;
  },

  /**
   * Create new warehouse
   */
  async create(data: CreateWarehouseDto): Promise<Warehouse> {
    const token = getAuthToken();

    const response = await axios.post<Warehouse>(WAREHOUSE_ENDPOINT, data, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    return response.data;
  },

  /**
   * Update warehouse
   */
  async update(id: string, data: UpdateWarehouseDto): Promise<Warehouse> {
    const token = getAuthToken();

    const response = await axios.put<Warehouse>(`${WAREHOUSE_ENDPOINT}/${id}`, data, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    return response.data;
  },

  /**
   * Activate warehouse
   */
  async activate(id: string): Promise<Warehouse> {
    const token = getAuthToken();

    const response = await axios.put<Warehouse>(
      `${WAREHOUSE_ENDPOINT}/${id}/activate`,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return response.data;
  },

  /**
   * Deactivate warehouse
   */
  async deactivate(id: string): Promise<Warehouse> {
    const token = getAuthToken();

    const response = await axios.put<Warehouse>(
      `${WAREHOUSE_ENDPOINT}/${id}/deactivate`,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return response.data;
  },

  /**
   * Soft delete warehouse
   */
  async delete(id: string): Promise<Warehouse> {
    const token = getAuthToken();

    const response = await axios.delete<Warehouse>(`${WAREHOUSE_ENDPOINT}/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data;
  },

  /**
   * Hard delete warehouse (permanent)
   */
  async hardDelete(id: string): Promise<void> {
    const token = getAuthToken();

    await axios.delete(`${WAREHOUSE_ENDPOINT}/${id}/hard`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  },
};
