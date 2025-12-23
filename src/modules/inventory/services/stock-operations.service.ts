import { apiClient } from '@/shared/lib/api-client';
import {
  AdjustStockDto,
  RegisterStockEntryDto,
  RegisterStockExitDto,
  RegisterPhysicalCountDto,
  StockOperationResponse,
  PhysicalCountResponse,
} from '../types/stock-operations.types';

const STOCK_OPERATIONS_ENDPOINT = '/inventory/stock-operations';

export const stockOperationsService = {
  /**
   * Adjust stock quantity (increase or decrease)
   */
  async adjustStock(data: AdjustStockDto): Promise<StockOperationResponse> {
    const response = await apiClient.post<StockOperationResponse>(
      `${STOCK_OPERATIONS_ENDPOINT}/adjust`,
      data
    );

    return response.data;
  },

  /**
   * Register stock entry (increase stock)
   */
  async registerEntry(data: RegisterStockEntryDto): Promise<StockOperationResponse> {
    const response = await apiClient.post<StockOperationResponse>(
      `${STOCK_OPERATIONS_ENDPOINT}/entry`,
      data
    );

    return response.data;
  },

  /**
   * Register stock exit (decrease stock)
   */
  async registerExit(data: RegisterStockExitDto): Promise<StockOperationResponse> {
    const response = await apiClient.post<StockOperationResponse>(
      `${STOCK_OPERATIONS_ENDPOINT}/exit`,
      data
    );

    return response.data;
  },

  /**
   * Register physical count (auto-adjust based on variance)
   */
  async registerPhysicalCount(data: RegisterPhysicalCountDto): Promise<PhysicalCountResponse> {
    const response = await apiClient.post<PhysicalCountResponse>(
      `${STOCK_OPERATIONS_ENDPOINT}/physical-count`,
      data
    );

    return response.data;
  },
};
