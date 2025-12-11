import { apiClient } from '@/shared/lib/api-client';
import {
  DamagedProductReport,
  InventoryValue,
  ReportFilterDto,
  StockInsertionHistory,
  StockObject,
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
};
