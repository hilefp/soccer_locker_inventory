// Stock Operations Types

// DTOs for API requests
export interface AdjustStockDto {
  productVariantId: string;
  warehouseId: string;
  quantity: number;
  reason: string;
  costPerUnit?: number;
  notes?: string;
  createdBy: string;
}

export interface RegisterStockEntryDto {
  productVariantId: string;
  warehouseId: string;
  quantity: number;
  costPerUnit?: number;
  reason?: string;
  notes?: string;
  createdBy: string;
}

export interface RegisterStockExitDto {
  productVariantId: string;
  warehouseId: string;
  quantity: number;
  reason: string;
  costPerUnit?: number;
  notes?: string;
  createdBy: string;
}

export interface RegisterPhysicalCountDto {
  productVariantId: string;
  warehouseId: string;
  countedQuantity: number;
  location?: string;
  notes?: string;
  countedBy: string;
}

// Response types
export interface Stock {
  id: string;
  productVariantId: string;
  warehouseId: string;
  quantity: number;
  reservedQuantity: number;
  availableQuantity: number;
  minimumStock: number;
  maximumStock: number;
  location: string | null;
  lastCountDate: string | null;
  createdAt: string;
  updatedAt: string;
  productVariant?: unknown;
  warehouse?: unknown;
}

export interface StockMovement {
  id: string;
  productVariantId: string;
  warehouseId: string;
  movementType: string;
  quantity: number;
  previousStock: number;
  newStock: number;
  referenceType: string | null;
  referenceId: string | null;
  costPerUnit: number | null;
  totalCost: number | null;
  reason: string | null;
  notes: string | null;
  createdBy: string;
  createdAt: string;
}

export interface PhysicalCount {
  id: string;
  productVariantId: string;
  warehouseId: string;
  systemQuantity: number;
  countedQuantity: number;
  variance: number;
  countDate: string;
  countedBy: string;
  location: string | null;
  notes: string | null;
  createdAt: string;
}

export interface StockOperationResponse {
  stock: Stock;
  movement: StockMovement | null;
}

export interface PhysicalCountResponse extends StockOperationResponse {
  physicalCount: PhysicalCount;
  variance: number;
}
