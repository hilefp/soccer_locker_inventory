export interface ReportFilterDto {
  startDate?: string;
  endDate?: string;
  period?: 'day' | 'week' | 'month' | 'year';
  categoryId?: string;
  brandId?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface DateRange {
  startDate: string | null;
  endDate: string | null;
}

// ─── Products Reports Types ─────────────────────────────────────

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

export interface CategoryStat {
  categoryId: string;
  categoryName: string;
  totalProducts: number;
  totalVariants: number;
  inventoryValue: number;
  averagePrice: number;
  percentageOfTotal: number;
}

export interface BrandStat {
  brandId: string;
  brandName: string;
  totalProducts: number;
  totalVariants: number;
  inventoryValue: number;
  averagePrice: number;
  percentageOfTotal: number;
}

export interface TopProductByValue {
  productId: string;
  productName: string;
  sku: string;
  totalStock: number;
  inventoryValue: number;
  variantCount: number;
}

export interface TopProductByStock {
  productId: string;
  productName: string;
  sku: string;
  totalStock: number;
  inventoryValue: number;
  variantCount: number;
}

export interface PriceRangeItem {
  range: string;
  minPrice: number;
  maxPrice: number;
  productCount: number;
  percentage: number;
}

export interface ProductsReportDto {
  totalProducts: number;
  totalVariants: number;
  activeProducts: number;
  inactiveProducts: number;
  averagePrice: number;
  lowestPrice: number;
  highestPrice: number;
  totalInventoryValue: number;
  totalInventoryCost: number;
  potentialProfit: number;
  averageProfitMargin: number;
  productsWithStock: number;
  productsOutOfStock: number;
  productsWithLowStock: number;
  categoryStats: CategoryStat[];
  brandStats: BrandStat[];
  topProductsByValue: TopProductByValue[];
  topProductsByStock: TopProductByStock[];
  priceRangeDistribution: PriceRangeItem[];
  dateRange: DateRange;
}

// ─── Stock Reports Types ────────────────────────────────────────

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
  product?: Product;
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

export interface WarehouseStat {
  warehouseId: string;
  warehouseName: string;
  totalQuantity: number;
  availableQuantity: number;
  reservedQuantity: number;
  inventoryValue: number;
  uniqueProducts: number;
  percentageOfTotal: number;
}

export interface StockCategoryStat {
  categoryId: string;
  categoryName: string;
  totalQuantity: number;
  inventoryValue: number;
  productCount: number;
  percentageOfTotal: number;
}

export interface MovementSummary {
  totalEntries: number;
  totalExits: number;
  totalAdjustments: number;
  totalTransfersIn: number;
  totalTransfersOut: number;
  totalDamaged: number;
  totalLost: number;
  netChange: number;
}

export interface StockTopProduct {
  productId: string;
  productName: string;
  totalQuantity?: number;
  totalValue?: number;
  price: number;
}

export interface LowStockAlert {
  productId: string;
  productName: string;
  variantName: string;
  currentStock: number;
  minimumStock: number;
  warehouse: string;
}

export interface TurnoverMetrics {
  averageDaysToSell: number;
  turnoverRate: number;
  fastMovingCount: number;
  slowMovingCount: number;
  obsoleteCount: number;
}

export interface StockReportDto {
  totalQuantity: number;
  totalAvailableQuantity: number;
  totalReservedQuantity: number;
  totalInventoryValueCost: number;
  totalInventoryValueRetail: number;
  potentialRevenue: number;
  uniqueProducts: number;
  uniqueVariants: number;
  totalWarehouses: number;
  productsWithStock: number;
  productsOutOfStock: number;
  productsWithLowStock: number;
  stockAccuracy: number;
  warehouseStats: WarehouseStat[];
  categoryStats: StockCategoryStat[];
  movementSummary: MovementSummary;
  topProductsByQuantity: StockTopProduct[];
  topProductsByValue: StockTopProduct[];
  lowStockAlerts: LowStockAlert[];
  turnoverMetrics: TurnoverMetrics;
  dateRange: DateRange;
}

// Re-export sales reports types
export * from './sales-reports.types';
