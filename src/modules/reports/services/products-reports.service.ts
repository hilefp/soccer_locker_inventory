import { apiClient } from '@/shared/lib/api-client';
import {
  ProductReportAveragePrice,
  ProductReportCount,
  ProductVariantData,
  ReportFilterDto,
} from '../types';

export const productsReportsService = {
  getProductsCount: async (filters?: ReportFilterDto) => {
    const { data } = await apiClient.get<ProductReportCount>(
      '/reports/products/count',
      { params: filters }
    );
    return data;
  },

  getAveragePrice: async (filters?: ReportFilterDto) => {
    const { data } = await apiClient.get<ProductReportAveragePrice>(
      '/reports/products/average-price',
      { params: filters }
    );
    return data;
  },

  getProductVariantsChart: async (filters?: ReportFilterDto) => {
    const { data } = await apiClient.get<ProductVariantData[]>(
      '/reports/products/variants-chart',
      { params: filters }
    );
    return data;
  },
};
