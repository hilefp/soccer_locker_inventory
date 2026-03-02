import { useQuery } from '@tanstack/react-query';
import { stockReportsService } from '../services/stock-reports.service';
import type { InventoryValueFilters } from '../types';

export function useStockInventoryValue(filters?: InventoryValueFilters) {
  const query = useQuery({
    queryKey: ['stock-reports', 'inventory-value-report', filters],
    queryFn: () => stockReportsService.getInventoryValueReport(filters),
  });

  return {
    data: query.data ?? null,
    loading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
}
