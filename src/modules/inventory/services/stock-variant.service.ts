import axios from 'axios';
import {
  StockVariantsResponse,
  StockVariantQueryParams,
} from '../types/stock-variant.types';
import { StockVariantDetail } from '../types/stock-variant-detail.types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';
const STOCK_VARIANTS_ENDPOINT = `${API_BASE_URL}/inventory/stocks/variants`;
const STOCK_VARIANT_DETAIL_ENDPOINT = `${API_BASE_URL}/inventory/stocks/variant`;

// Helper to get auth token from localStorage
const getAuthToken = () => {
  const token = localStorage.getItem('authToken');
  return token;
};

// Helper to build query params
const buildQueryParams = (params: StockVariantQueryParams): string => {
  const urlParams = new URLSearchParams();

  if (params.page !== undefined) urlParams.append('page', String(params.page));
  if (params.limit !== undefined) urlParams.append('limit', String(params.limit));
  if (params.search) urlParams.append('search', params.search);
  if (params.warehouseId) urlParams.append('warehouseId', params.warehouseId);
  if (params.productId) urlParams.append('productId', params.productId);
  if (params.categoryId) urlParams.append('categoryId', params.categoryId);
  if (params.status) urlParams.append('status', params.status);
  if (params.sortBy) urlParams.append('sortBy', params.sortBy);
  if (params.sortOrder) urlParams.append('sortOrder', params.sortOrder);

  const queryString = urlParams.toString();
  return queryString ? `?${queryString}` : '';
};

export const stockVariantService = {
  /**
   * Get paginated stock variants with filters
   */
  async getAll(params: StockVariantQueryParams = {}): Promise<StockVariantsResponse> {
    const token = getAuthToken();
    const queryParams = buildQueryParams(params);

    const response = await axios.get<StockVariantsResponse>(
      `${STOCK_VARIANTS_ENDPOINT}${queryParams}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return response.data;
  },

  /**
   * Get detailed information for a specific variant
   */
  async getDetail(variantId: string): Promise<StockVariantDetail> {
    const token = getAuthToken();

    const response = await axios.get<StockVariantDetail>(
      `${STOCK_VARIANT_DETAIL_ENDPOINT}/${variantId}/detail`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return response.data;
  },
};
