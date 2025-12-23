import { apiClient } from '@/shared/lib/api-client';
import {
  StockMovementQueryParams,
  StockMovementItem,
  CreateStockMovementDto,
  WarehouseStatistics,
} from '../types/stock-movement.types';

const STOCK_MOVEMENTS_ENDPOINT = '/inventory/stock-movements';

// Helper to build query params
const buildQueryParams = (params: StockMovementQueryParams): string => {
  const urlParams = new URLSearchParams();

  if (params.productVariantId) urlParams.append('productVariantId', params.productVariantId);
  if (params.warehouseId) urlParams.append('warehouseId', params.warehouseId);
  if (params.movementType) urlParams.append('movementType', params.movementType);
  if (params.startDate) urlParams.append('startDate', params.startDate);
  if (params.endDate) urlParams.append('endDate', params.endDate);
  if (params.userId) urlParams.append('userId', params.userId);

  const queryString = urlParams.toString();
  return queryString ? `?${queryString}` : '';
};

export const stockMovementService = {
  /**
   * Get all stock movements with filters
   */
  async getAll(params: StockMovementQueryParams = {}): Promise<StockMovementItem[]> {
    const queryParams = buildQueryParams(params);

    const response = await apiClient.get<StockMovementItem[]>(
      `${STOCK_MOVEMENTS_ENDPOINT}${queryParams}`
    );

    return response.data;
  },

  /**
   * Get a single stock movement by ID
   */
  async getById(id: string): Promise<StockMovementItem> {
    const response = await apiClient.get<StockMovementItem>(
      `${STOCK_MOVEMENTS_ENDPOINT}/${id}`
    );

    return response.data;
  },

  /**
   * Create a new stock movement
   */
  async create(data: CreateStockMovementDto): Promise<StockMovementItem> {
    const response = await apiClient.post<StockMovementItem>(
      STOCK_MOVEMENTS_ENDPOINT,
      data
    );

    return response.data;
  },

  /**
   * Get movements by reference (e.g., purchase order, sales order)
   */
  async getByReference(
    referenceType: string,
    referenceId: string
  ): Promise<StockMovementItem[]> {
    const response = await apiClient.get<StockMovementItem[]>(
      `${STOCK_MOVEMENTS_ENDPOINT}/reference/${referenceType}/${referenceId}`
    );

    return response.data;
  },

  /**
   * Get variant history for a specific warehouse
   */
  async getVariantHistory(
    variantId: string,
    warehouseId: string,
    params?: { startDate?: string; endDate?: string }
  ): Promise<StockMovementItem[]> {
    const queryParams = buildQueryParams(params || {});

    const response = await apiClient.get<StockMovementItem[]>(
      `${STOCK_MOVEMENTS_ENDPOINT}/variant/${variantId}/warehouse/${warehouseId}/history${queryParams}`
    );

    return response.data;
  },

  /**
   * Get warehouse statistics
   */
  async getWarehouseStatistics(
    warehouseId: string,
    params?: { startDate?: string; endDate?: string }
  ): Promise<WarehouseStatistics> {
    const queryParams = buildQueryParams(params || {});

    const response = await apiClient.get<WarehouseStatistics>(
      `${STOCK_MOVEMENTS_ENDPOINT}/warehouse/${warehouseId}/statistics${queryParams}`
    );

    return response.data;
  },

  /**
   * Hard delete a stock movement
   */
  async hardDelete(id: string): Promise<void> {
    await apiClient.delete(`${STOCK_MOVEMENTS_ENDPOINT}/${id}/hard`);
  },
};
