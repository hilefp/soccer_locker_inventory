// Enums
export enum EntryType {
  PURCHASE = 'PURCHASE',
  TRANSFER_IN = 'TRANSFER_IN',
  RETURN = 'RETURN',
  PRODUCTION = 'PRODUCTION',
  ADJUSTMENT = 'ADJUSTMENT',
  INITIAL = 'INITIAL',
}

export enum EntryStatus {
  DRAFT = 'DRAFT',
  CONFIRMED = 'CONFIRMED',
  CANCELLED = 'CANCELLED',
}

// Request DTOs
export interface CreateStockEntryDetailDto {
  productVariantId: string;
  quantity: number;
  expectedQuantity?: number;
  costPerUnit: number;
  lotNumber?: string;
  expirationDate?: string;
  notes?: string;
}

export interface CreateStockEntryDto {
  entryNumber: string;
  warehouseId: string;
  supplierId?: string;
  purchaseOrderId?: string;
  entryType: EntryType;
  referenceDocument?: string;
  entryDate: string;
  notes?: string;
  createdBy: string;
  details: CreateStockEntryDetailDto[];
}

// Response Types
export interface StockEntryDetailResponse {
  id: string;
  stockEntryId: string;
  productVariantId: string;
  quantity: number;
  expectedQuantity: number | null;
  costPerUnit: number;
  totalCost: number;
  lotNumber: string | null;
  expirationDate: string | null;
  notes: string | null;
  productVariant: {
    id: string;
    sku: string;
    product: {
      id: string;
      name: string;
    };
  };
}

export interface StockEntryResponse {
  id: string;
  entryNumber: string;
  warehouseId: string;
  supplierId: string | null;
  purchaseOrderId: string | null;
  entryType: EntryType;
  referenceDocument: string | null;
  entryDate: string;
  totalCost: number;
  status: EntryStatus;
  notes: string | null;
  createdBy: string;
  approvedBy: string | null;
  createdAt: string;
  updatedAt: string;
  details: StockEntryDetailResponse[];
  warehouse: {
    id: string;
    code: string;
    name: string;
    warehouseType: string;
  };
}

// Form types for the UI
export interface StockEntryDetailForm {
  id: string; // Temporary ID for UI
  productVariantId: string;
  productName?: string;
  sku?: string;
  quantity: number;
  expectedQuantity?: number;
  costPerUnit: number;
  totalCost: number;
  lotNumber?: string;
  expirationDate?: string;
  notes?: string;
}

export interface StockEntryForm {
  entryNumber: string;
  warehouseId: string;
  supplierId?: string;
  purchaseOrderId?: string;
  entryType: EntryType;
  referenceDocument?: string;
  entryDate: Date;
  notes?: string;
  details: StockEntryDetailForm[];
}
