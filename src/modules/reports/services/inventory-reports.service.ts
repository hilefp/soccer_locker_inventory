import { apiClient } from '@/shared/lib/api-client';
import type {
  MonthlyEntriesVsExitsParams,
  MonthlyEntriesVsExitsResponse,
  ObsoleteVariantsParams,
  ObsoleteVariantsResponse,
  MonthlyTotalStockParams,
  MonthlyTotalStockResponse,
} from '../types/inventory-reports.types';

/**
 * Inventory Reports Service
 * Handles all API calls for inventory analytics and reporting
 */

const REPORTS_BASE = '/reports/inventory';

/**
 * Get monthly entries vs exits data
 */
export async function getMonthlyEntriesVsExits(
  params?: MonthlyEntriesVsExitsParams
): Promise<MonthlyEntriesVsExitsResponse> {
  const response = await apiClient.get<MonthlyEntriesVsExitsResponse>(
    `${REPORTS_BASE}/movements/monthly-entries-vs-exits`,
    { params }
  );
  return response.data;
}

/**
 * Get obsolete product variants
 */
export async function getObsoleteVariants(
  params?: ObsoleteVariantsParams
): Promise<ObsoleteVariantsResponse> {
  const response = await apiClient.get<ObsoleteVariantsResponse>(
    `${REPORTS_BASE}/obsolete`,
    { params }
  );
  return response.data;
}

/**
 * Get monthly total stock over time
 */
export async function getMonthlyTotalStock(
  params?: MonthlyTotalStockParams
): Promise<MonthlyTotalStockResponse> {
  const response = await apiClient.get<MonthlyTotalStockResponse>(
    `${REPORTS_BASE}/stock/monthly-total`,
    { params }
  );
  return response.data;
}
