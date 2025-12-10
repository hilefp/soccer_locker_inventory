import { apiClient } from '@/shared/lib/api-client';
import {
  CreateStockEntryDto,
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
