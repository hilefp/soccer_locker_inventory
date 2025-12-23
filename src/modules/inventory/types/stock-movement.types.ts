// Stock Movement Types
export enum MovementType {
  PURCHASE = 'PURCHASE',
  SALE = 'SALE',
  ADJUSTMENT = 'ADJUSTMENT',
  TRANSFER_IN = 'TRANSFER_IN',
  TRANSFER_OUT = 'TRANSFER_OUT',
  RETURN = 'RETURN',
  RESERVATION = 'RESERVATION',
  RELEASE = 'RELEASE',
}

// Stock Movement Item
export interface StockMovementItem {
  id: string;
  productVariantId: string;
  warehouseId: string;
  movementType: MovementType;
  quantity: number;
  userId: string;
  referenceType: string | null;
  referenceId: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  // Additional fields for display
  productName?: string;
  variantName?: string;
  sku?: string;
  warehouseName?: string;
  userName?: string;
}

// Query Parameters (matching backend API)
export interface StockMovementQueryParams {
  productVariantId?: string;
  warehouseId?: string;
  movementType?: string;
  startDate?: string;
  endDate?: string;
  userId?: string;
}

// Create Stock Movement DTO
export interface CreateStockMovementDto {
  productVariantId: string;
  warehouseId: string;
  movementType: MovementType;
  quantity: number;
  userId: string;
  referenceType?: string;
  referenceId?: string;
  notes?: string;
}

// Warehouse Statistics Response
export interface WarehouseStatistics {
  totalMovements: number;
  movementsByType: Record<string, number>;
  [key: string]: unknown;
}
