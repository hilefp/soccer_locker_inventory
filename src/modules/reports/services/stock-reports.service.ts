import { apiClient } from '@/shared/lib/api-client';
import {
  DamagedProductReport,
  InventoryValue,
  LowStockVariantDto,
  ReportFilterDto,
  StockInsertionHistory,
  StockObject,
  StockRankingDto,
  StockTotalQuantity,
} from '../types';

export const stockReportsService = {
  getTotalStockQuantity: async () => {
    const { data } = await apiClient.get<StockTotalQuantity>(
      '/reports-stock/total-quantity'
    );
    return data;
  },

  getHighestStock: async () => {
    const { data } = await apiClient.get<StockObject>(
      '/reports-stock/highest-stock'
    );
    return data;
  },

  getLowestStock: async () => {
    const { data } = await apiClient.get<StockObject>(
      '/reports-stock/lowest-stock'
    );
    return data;
  },

  getInventoryValue: async () => {
    const { data } = await apiClient.get<InventoryValue>(
      '/reports-stock/inventory-value'
    );
    return data;
  },

  getStockInsertionHistory: async (filters?: ReportFilterDto) => {
    const { data } = await apiClient.get<StockInsertionHistory[]>(
      '/reports-stock/insertion-history',
      { params: filters }
    );
    return data;
  },

  getDamagedProducts: async (filters?: ReportFilterDto) => {
    const { data } = await apiClient.get<DamagedProductReport[]>(
      '/reports-stock/damaged',
      { params: filters }
    );
    return data;
  },

  getLowStockVariants: async (filters?: ReportFilterDto) => {
    const { data } = await apiClient.get<LowStockVariantDto[]>(
      '/reports-stock/low-stock-list',
      { params: filters }
    );
    return data;
  },

  getStockRanking: async (filters?: ReportFilterDto) => {
    const { data } = await apiClient.get<StockRankingDto[]>(
      '/reports-stock/ranking',
      { params: filters }
    );
    return data;
  },
};
