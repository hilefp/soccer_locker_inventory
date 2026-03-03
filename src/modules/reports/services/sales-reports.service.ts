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
    if (filters?.groupBy) {
      params.append('groupBy', filters.groupBy);
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
    if (filters.groupBy) {
      params.append('groupBy', filters.groupBy);
    }

    const url = `${this.baseUrl}/club-sales?${params.toString()}`;
    const response = await apiClient.get<ClubSalesReportDto>(url);
    return response.data;
  }

  /**
   * Export general sales report as Excel file
   */
  async exportGeneralSalesReport(filters?: SalesReportFilters): Promise<Blob> {
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
    if (filters?.groupBy) {
      params.append('groupBy', filters.groupBy);
    }

    const url = `${this.baseUrl}/sales/general/export${params.toString() ? `?${params.toString()}` : ''}`;
    const response = await apiClient.get(url, { responseType: 'blob' });
    return response.data;
  }

  /**
   * Export club-specific sales report as Excel file
   */
  async exportClubSalesReport(filters: ClubSalesFilters): Promise<Blob> {
    const params = new URLSearchParams();
    params.append('clubId', filters.clubId);

    if (filters.startDate) {
      params.append('startDate', filters.startDate);
    }
    if (filters.endDate) {
      params.append('endDate', filters.endDate);
    }
    if (filters.groupBy) {
      params.append('groupBy', filters.groupBy);
    }

    const url = `${this.baseUrl}/club-sales/export?${params.toString()}`;
    const response = await apiClient.get(url, { responseType: 'blob' });
    return response.data;
  }

  /**
   * Export club sales variations (top selling variants) as Excel file
   */
  async exportClubSalesVariations(filters: ClubSalesFilters): Promise<Blob> {
    const params = new URLSearchParams();
    params.append('clubId', filters.clubId);

    if (filters.startDate) {
      params.append('startDate', filters.startDate);
    }
    if (filters.endDate) {
      params.append('endDate', filters.endDate);
    }
    if (filters.groupBy) {
      params.append('groupBy', filters.groupBy);
    }

    const url = `${this.baseUrl}/club-sales/export-variations?${params.toString()}`;
    const response = await apiClient.get(url, { responseType: 'blob' });
    return response.data;
  }
}

export const salesReportsService = new SalesReportsService();
