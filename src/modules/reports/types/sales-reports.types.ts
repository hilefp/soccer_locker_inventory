// Sales Reports Types

export interface DateRange {
  startDate: string | null;
  endDate: string | null;
}

export interface ChartDataPoint {
  date: string;
  currentYear: number;
  previousYear: number;
}

export interface ChartData {
  netSales: ChartDataPoint[];
  orders: ChartDataPoint[];
  currentYearLabel: string;
  previousYearLabel: string;
}

export type GroupByPeriod = 'day' | 'week' | 'month';

export interface GeneralSalesReportDto {
  netSales: number;
  grossSales: number;
  totalOrders: number;
  totalProductsSold: number;
  dateRange: DateRange;
  chartData?: ChartData;
}

export interface TopProduct {
  productVariantId: string;
  productName: string;
  sku: string;
  quantitySold: number;
  totalRevenue: number;
}

export interface TopSellingVariant {
  productName: string;
  sku: string;
  quantitySold: number;
}

export interface ClubSalesReportDto {
  clubId: string;
  clubName: string;
  totalOrders: number;
  netSales: number;
  itemsSold: number;
  topProduct: TopProduct | null;
  dateRange: DateRange;
  chartData?: ChartData;
  topSellingVariants: TopSellingVariant[];
}

export interface SalesReportFilters {
  startDate?: string;
  endDate?: string;
  clubId?: string;
  groupBy?: GroupByPeriod;
}

export interface ClubSalesFilters {
  clubId: string;
  startDate?: string;
  endDate?: string;
  groupBy?: GroupByPeriod;
}
