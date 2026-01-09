// Stock Status Enum
export enum StockStatus {
  IN_STOCK = 'IN_STOCK',
  LOW_STOCK = 'LOW_STOCK',
  OUT_OF_STOCK = 'OUT_OF_STOCK',
}

// Stock Variant Item
export interface StockVariantItem {
  productVariantId: string;
  sku: string;
  productName: string;
  variantName: string;
  categoryName: string | null;
  totalQuantity: number;
  totalReserved: number;
  totalAvailable: number;
  warehouseCount: number;
  lastMovement: string | null;
  status: StockStatus;
  imageUrl: string | null;
  cost: number | null;
}

// Pagination Metadata
export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// API Response
export interface StockVariantsResponse {
  data: StockVariantItem[];
  meta: PaginationMeta;
}

// Query Parameters
export interface StockVariantQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  warehouseId?: string;
  productId?: string;
  categoryId?: string;
  status?: StockStatus;
  sortBy?: 'sku' | 'productName' | 'totalQuantity' | 'lastMovement';
  sortOrder?: 'asc' | 'desc';
}
