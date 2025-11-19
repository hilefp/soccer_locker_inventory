import axios from 'axios';
import {
  CreateStockEntryDto,
  StockEntryResponse,
} from '../types/stock-entry.types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';
const STOCK_ENTRY_ENDPOINT = `${API_BASE_URL}/inventory/stock-entries`;

// Helper to get auth token from localStorage
const getAuthToken = () => {
  const token = localStorage.getItem('authToken');
  return token;
};

export const stockEntryService = {
  /**
   * Create a new stock entry
   */
  async create(data: CreateStockEntryDto): Promise<StockEntryResponse> {
    const token = getAuthToken();

    const response = await axios.post<StockEntryResponse>(
      STOCK_ENTRY_ENDPOINT,
      data,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
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
