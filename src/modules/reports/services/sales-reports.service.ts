import { apiClient } from '@/shared/lib/api-client';
import {
  GeneralSalesReportDto,
  ClubSalesReportDto,
  SalesReportFilters,
  ClubSalesFilters,
} from '../types/sales-reports.types';

class SalesReportsService {
  private baseUrl = '/reports';

  /**
   * Get general sales report with optional filters
   */
  async getGeneralSalesReport(
    filters?: SalesReportFilters
  ): Promise<GeneralSalesReportDto> {
    const params = new URLSearchParams();

    if (filters?.startDate) {
      params.append('startDate', filters.startDate);
    }
    if (filters?.endDate) {
      params.append('endDate', filters.endDate);
    }
    if (filters?.clubId) {
      params.append('clubId', filters.clubId);
    }

    const url = `${this.baseUrl}/sales/general${params.toString() ? `?${params.toString()}` : ''}`;
    const response = await apiClient.get<GeneralSalesReportDto>(url);
    return response.data;
  }

  /**
   * Get club-specific sales report
   */
  async getClubSalesReport(
    filters: ClubSalesFilters
  ): Promise<ClubSalesReportDto> {
    const params = new URLSearchParams();
    params.append('clubId', filters.clubId);

    if (filters.startDate) {
      params.append('startDate', filters.startDate);
    }
    if (filters.endDate) {
      params.append('endDate', filters.endDate);
    }

    const url = `${this.baseUrl}/club-sales?${params.toString()}`;
    const response = await apiClient.get<ClubSalesReportDto>(url);
    return response.data;
  }
}

export const salesReportsService = new SalesReportsService();
