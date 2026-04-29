// Stock Status Enum
export enum StockStatus {
  IN_STOCK = 'IN_STOCK',
  LOW_STOCK = 'LOW_STOCK',
  OUT_OF_STOCK = 'OUT_OF_STOCK',
}

// Stock Variant Item
export interface StockVariantItem {
  productVariantId: string;
  productId: string;
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
  tags: string[];
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

// Barcode lookup response (envelope around the variants list + product info)
export interface BarcodeLookupProduct {
  id: string;
  name: string;
  description: string | null;
  slug: string;
  model: string | null;
  categoryId: string | null;
  brandId: string | null;
  imageUrl: string | null;
  tags: string[];
  imageUrls: string[];
  isActive: boolean;
  isFeatured: boolean;
  minPrice: number | null;
  maxPrice: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface BarcodeLookupResponse {
  barcode: string;
  type: string;
  product: BarcodeLookupProduct;
  variants: StockVariantsResponse;
}

// Query Parameters
export interface StockVariantQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  warehouseId?: string;
  productId?: string;
  categoryId?: string;
  categoryIds?: string[];
  tags?: string[];
  color?: string;
  status?: StockStatus;
  sortBy?: 'sku' | 'productName' | 'totalQuantity' | 'lastMovement';
  sortOrder?: 'asc' | 'desc';
}
