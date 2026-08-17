import { apiClient } from '@/shared/lib/api-client';
import {
  CreateStockEntryDto,
  StockEntryFilters,
  StockEntryResponse,
} from '../types/stock-entry.types';

const STOCK_ENTRY_ENDPOINT = '/inventory/stock-entries';

export const stockEntryService = {
  /**
   * Create a new stock entry
   */
  async create(data: CreateStockEntryDto): Promise<StockEntryResponse> {
    const response = await apiClient.post<StockEntryResponse>(
      STOCK_ENTRY_ENDPOINT,
      data
    );

    return response.data;
  },

  /**
   * Get all stock entries with optional filters
   */
  async getAll(filters: StockEntryFilters = {}): Promise<StockEntryResponse[]> {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== '') {
        params.append(key, String(value));
      }
    });

    const response = await apiClient.get<StockEntryResponse[]>(
      STOCK_ENTRY_ENDPOINT,
      { params }
    );

    return response.data;
  },

  /**
   * Get a stock entry by ID
   */
  async getById(id: string): Promise<StockEntryResponse> {
    const response = await apiClient.get<StockEntryResponse>(
      `${STOCK_ENTRY_ENDPOINT}/${id}`
    );

    return response.data;
  },

  /**
   * Confirm a DRAFT stock entry (applies stock levels)
   */
  async confirm(id: string): Promise<StockEntryResponse> {
    const response = await apiClient.patch<StockEntryResponse>(
      `${STOCK_ENTRY_ENDPOINT}/${id}/confirm`
    );

    return response.data;
  },

  /**
   * Cancel a DRAFT stock entry
   */
  async cancel(id: string): Promise<StockEntryResponse> {
    const response = await apiClient.patch<StockEntryResponse>(
      `${STOCK_ENTRY_ENDPOINT}/${id}/cancel`
    );

    return response.data;
  },

  /**
   * Generate a new entry number
   */
  async generateEntryNumber(): Promise<string> {
    // This could be an API call or generated client-side
    const now = new Date();
    const year = now.getFullYear();
    const timestamp = Date.now().toString().slice(-6);
    return `ENT-${year}-${timestamp}`;
  },
};
