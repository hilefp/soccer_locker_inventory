import { useState, useEffect } from 'react';
import { salesReportsService } from '../services/sales-reports.service';
import { GeneralSalesReportDto, SalesReportFilters } from '../types/sales-reports.types';

interface UseGeneralSalesReportResult {
  data: GeneralSalesReportDto | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useGeneralSalesReport(
  filters?: SalesReportFilters
): UseGeneralSalesReportResult {
  const [data, setData] = useState<GeneralSalesReportDto | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await salesReportsService.getGeneralSalesReport(filters);
      setData(result);
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || 'Failed to fetch general sales report');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [filters?.startDate, filters?.endDate, filters?.clubId]);

  return {
    data,
    loading,
    error,
    refetch: fetchData,
  };
}
