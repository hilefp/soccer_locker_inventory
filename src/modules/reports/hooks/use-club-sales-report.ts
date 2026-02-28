import { useState, useEffect } from 'react';
import { salesReportsService } from '../services/sales-reports.service';
import { ClubSalesReportDto, ClubSalesFilters } from '../types/sales-reports.types';

interface UseClubSalesReportResult {
  data: ClubSalesReportDto | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useClubSalesReport(
  filters: ClubSalesFilters | null
): UseClubSalesReportResult {
  const [data, setData] = useState<ClubSalesReportDto | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    if (!filters?.clubId) {
      setData(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const result = await salesReportsService.getClubSalesReport(filters);
      setData(result);
    } catch (err: any) {
      if (err?.response?.status === 404) {
        setError(`Club with ID ${filters.clubId} not found`);
      } else {
        setError(err?.response?.data?.message || err?.message || 'Failed to fetch club sales report');
      }
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [filters?.clubId, filters?.startDate, filters?.endDate]);

  return {
    data,
    loading,
    error,
    refetch: fetchData,
  };
}
