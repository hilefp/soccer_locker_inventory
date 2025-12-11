export interface ReportFilterDto {
  startDate?: string;
  endDate?: string;
  period?: 'day' | 'week' | 'month' | 'year';
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
  product: Product;
}

export interface StockObject {
  id: string;
  quantity: number;
  availableQuantity: number;
  warehouse: Warehouse;
  productVariant: ProductVariant;
}

export interface InventoryValue {
  totalValue: number;
}

export interface StockInsertionHistory {
  productVariantId: string;
  productName: string;
  sku: string;
  insertionCount: number;
  totalQuantityInserted: number;
}

export interface DamagedProductReport {
  productName: string;
  sku: string;
  quantityLost: number;
  reason: string;
  warehouse: string;
  date: string;
}
