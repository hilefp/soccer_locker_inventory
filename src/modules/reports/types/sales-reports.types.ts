// Sales Reports Types

export interface DateRange {
  startDate: string | null;
  endDate: string | null;
}

export interface GeneralSalesReportDto {
  netSales: number;
  grossSales: number;
  totalOrders: number;
  totalProductsSold: number;
  dateRange: DateRange;
}

export interface TopProduct {
  productVariantId: string;
  productName: string;
  sku: string;
  quantitySold: number;
  totalRevenue: number;
}

export interface ClubSalesReportDto {
  clubId: string;
  clubName: string;
  totalOrders: number;
  netSales: number;
  itemsSold: number;
  topProduct: TopProduct | null;
  dateRange: DateRange;
}

export interface SalesReportFilters {
  startDate?: string;
  endDate?: string;
  clubId?: string;
}

export interface ClubSalesFilters {
  clubId: string;
  startDate?: string;
  endDate?: string;
}
