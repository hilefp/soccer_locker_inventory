import { useQuery } from '@tanstack/react-query';
import {
  getMonthlyEntriesVsExits,
  getObsoleteVariants,
  getMonthlyTotalStock,
} from '../services/inventory-reports.service';
import type {
  MonthlyEntriesVsExitsParams,
  MonthlyEntriesVsExitsChartData,
  ObsoleteVariantsParams,
  MonthlyTotalStockParams,
  MonthlyTotalStockChartData,
} from '../types/inventory-reports.types';

/**
 * Transform monthly entries vs exits response to chart data
 */
function transformEntriesVsExits(data: {
  labels: string[];
  series: { entries: number[]; exits: number[]; adjustments: number[] };
}): MonthlyEntriesVsExitsChartData[] {
  return data.labels.map((month, index) => ({
    month,
    entries: data.series.entries[index] || 0,
    exits: data.series.exits[index] || 0,
    adjustments: data.series.adjustments[index] || 0,
  }));
}

/**
 * Transform monthly total stock response to chart data
 */
function transformTotalStock(data: {
  labels: string[];
  series: { totalStock: number[] };
}): MonthlyTotalStockChartData[] {
  return data.labels.map((month, index) => ({
    month,
    totalStock: data.series.totalStock[index] || 0,
  }));
}

/**
 * Hook to fetch monthly entries vs exits data
 */
export function useMonthlyEntriesVsExits(params?: MonthlyEntriesVsExitsParams) {
  return useQuery({
    queryKey: ['inventory-reports', 'monthly-entries-vs-exits', params],
    queryFn: async () => {
      const data = await getMonthlyEntriesVsExits(params);
      return transformEntriesVsExits(data);
    },
  });
}

/**
 * Hook to fetch obsolete variants data
 */
export function useObsoleteVariants(params?: ObsoleteVariantsParams) {
  return useQuery({
    queryKey: ['inventory-reports', 'obsolete-variants', params],
    queryFn: () => getObsoleteVariants(params),
  });
}

/**
 * Hook to fetch monthly total stock data
 */
export function useMonthlyTotalStock(params?: MonthlyTotalStockParams) {
  return useQuery({
    queryKey: ['inventory-reports', 'monthly-total-stock', params],
    queryFn: async () => {
      const data = await getMonthlyTotalStock(params);
      return transformTotalStock(data);
    },
  });
}
