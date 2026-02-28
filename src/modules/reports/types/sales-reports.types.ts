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
  quanttype GroupByPeriod = 'day' | 'week' | 'month';

export itySold: number;
  totalRevenue: number;
}
;
  groupBy?: GroupByPeriod
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
