/**
 * Inventory Reports Types
 * Types for inventory analytics and reporting
 */

// ============================================
// Monthly Entries vs Exits
// ============================================

export interface MonthlyEntriesVsExitsParams {
  dateFrom?: string; // ISO date string (YYYY-MM-DD)
  dateTo?: string; // ISO date string (YYYY-MM-DD)
  warehouseId?: string;
  productVariantId?: string;
  categoryId?: string;
}

export interface MonthlyEntriesVsExitsResponse {
  labels: string[]; // ["2025-01", "2025-02", "2025-03"]
  series: {
    entries: number[];
    exits: number[];
    adjustments: number[];
  };
}

export interface MonthlyEntriesVsExitsChartData {
  month: string;
  entries: number;
  exits: number;
  adjustments: number;
}

// ============================================
// Obsolete Product Variants
// ============================================

export interface ObsoleteVariantsParams {
  daysInactive?: number; // default 90
  dateFrom?: string;
  dateTo?: string;
  warehouseId?: string;
  productVariantId?: string;
  categoryId?: string;
}

export interface ObsoleteVariant {
  productVariantId: string;
  sku: string;
  productId: string;
  productName: string;
  categoryId: string;
  categoryName: string;
  currentStock: number;
  lastOutflowDate: string; // ISO date string
  daysSinceLastOutflow: number;
  warehouseCount?: number;
}

export interface ObsoleteVariantsResponse {
  data: ObsoleteVariant[];
  total: number;
}

// ============================================
// Total Stock Over Time
// ============================================

export interface MonthlyTotalStockParams {
  dateFrom?: string;
  dateTo?: string;
  warehouseId?: string;
  productVariantId?: string;
  categoryId?: string;
}

export interface MonthlyTotalStockResponse {
  labels: string[]; // ["2025-01", "2025-02", "2025-03"]
  series: {
    totalStock: number[];
  };
}

export interface MonthlyTotalStockChartData {
  month: string;
  totalStock: number;
}

// ============================================
// Filters
// ============================================

export interface InventoryReportFilters {
  dateFrom?: string;
  dateTo?: string;
  warehouseId?: string;
  productVariantId?: string;
  categoryId?: string;
  daysInactive?: number; // default 90
}
