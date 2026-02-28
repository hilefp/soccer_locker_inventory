export interface ReportFilterDto {
  startDate?: string;
  endDate?: string;
  period?: 'day' | 'week' | 'month' | 'year';
  categoryId?: string;
  brandId?: string;
  sortOrder?: 'asc' | 'desc';
}

// Products Reports Types
export interface ProductReportCount {
  count: number;
}

export interface ProductReportAveragePrice {
  averagePrice: number;
}

export interface ProductVariantData {
  name: string;
  price: number;
}

// Stock Reports Types
export interface StockTotalQuantity {
  totalQuantity: number;
}

export interface Warehouse {
  name: string;
}

export interface Product {
  name: string;
}

export interface ProductVariant {
  sku: string;
  product?: Product; // Made optional/adjusted as per new spec response might differ slightly, but keeping consistent
}

export interface StockObject {
  id?: string;
  quantity: number;
  availableQuantity?: number;
  warehouse?: Warehouse;
  productVariant?: ProductVariant;
}

export interface InventoryValue {
  totalValue: number;
}

export interface StockInsertionHistory {
  productName: string;
  insertionCount: number;
  totalQuantityInserted: number;
}

export interface DamagedProductReport {
  productName: string;
  sku?: string;
  quantityLost: number;
  reason: string;
  warehouse?: string;
  date: string;
}

export interface LowStockVariantDto {
  productName: string;
  variant: string;
  currentStock: number;
  minimumStock: number;
  warehouse: string;
}

export interface StockRankingDto {
  name: string;
  quantity: number;
  warehouse: string;
}

// Re-export sales reports types
export * from './sales-reports.types';
