import { StockStatus } from './stock-variant.types';

// Warehouse Type Enum
export enum WarehouseType {
  MAIN = 'MAIN',
  SECONDARY = 'SECONDARY',
  STORE = 'STORE',
  VIRTUAL = 'VIRTUAL',
  PRODUCTION = 'PRODUCTION',
  TRANSIT = 'TRANSIT',
}

// Movement Type Enum
export enum MovementType {
  ENTRY = 'ENTRY',
  EXIT = 'EXIT',
  TRANSFER_OUT = 'TRANSFER_OUT',
  TRANSFER_IN = 'TRANSFER_IN',
  ADJUSTMENT = 'ADJUSTMENT',
  RETURN = 'RETURN',
  DAMAGE = 'DAMAGE',
  LOSS = 'LOSS',
}

// Alert Type Enum
export enum AlertType {
  LOW_STOCK = 'LOW_STOCK',
  OVERSTOCK = 'OVERSTOCK',
  OUT_OF_STOCK = 'OUT_OF_STOCK',
  NEAR_EXPIRATION = 'NEAR_EXPIRATION',
  EXPIRED = 'EXPIRED',
}

// Reference Type Enum
export enum ReferenceType {
  PURCHASE_ORDER = 'PURCHASE_ORDER',
  SALE_ORDER = 'SALE_ORDER',
  STOCK_ENTRY = 'STOCK_ENTRY',
  STOCK_TRANSFER = 'STOCK_TRANSFER',
  STOCK_ADJUSTMENT = 'STOCK_ADJUSTMENT',
  PRODUCTION_ORDER = 'PRODUCTION_ORDER',
  RETURN_ORDER = 'RETURN_ORDER',
}

// Warehouse Stock
export interface WarehouseStock {
  warehouseId: string;
  warehouseCode: string;
  warehouseName: string;
  warehouseType: WarehouseType;
  location: string | null;
  quantity: number;
  reservedQuantity: number;
  availableQuantity: number;
  minimumStock: number;
  maximumStock: number | null;
  lastCountDate: string | null;
  status: StockStatus;
}

// Stock Movement
export interface StockMovement {
  id: string;
  movementType: MovementType;
  quantity: number;
  previousStock: number;
  newStock: number;
  referenceType: ReferenceType | null;
  referenceId: string | null;
  costPerUnit: number | null;
  totalCost: number | null;
  reason: string | null;
  notes: string | null;
  createdBy: string;
  createdAt: string;
  warehouse: {
    id: string;
    code: string;
    name: string;
  };
}

// Stock Alert
export interface StockAlert {
  id: string;
  alertType: AlertType;
  message: string;
  warehouseId: string;
  createdAt: string;
}

// Variant Detail Response
export interface StockVariantDetail {
  variant: {
    id: string;
    sku: string;
    barcode: string | null;
    attributes: Record<string, string>;
    variantName: string;
    price: number;
    compareAtPrice: number | null;
    cost: number | null;
    weight: number | null;
    weightUnit: string | null;
    dimensions: any;
    dimensionUnit: string | null;
    imageUrl: string | null;
    imageUrls: string[];
    isActive: boolean;
    isDefault: boolean;
    createdAt: string;
    updatedAt: string;
  };
  product: {
    id: string;
    name: string;
    description: string | null;
    slug: string;
    model: string | null;
    imageUrl: string | null;
    imageUrls: string[];
    tags: string[];
    isActive: boolean;
    isFeatured: boolean;
    category: {
      id: string;
      name: string;
      slug: string;
    } | null;
    brand: {
      id: string;
      name: string;
      code: string;
      imageUrl: string | null;
    } | null;
  };
  stockSummary: {
    totalQuantity: number;
    totalReserved: number;
    totalAvailable: number;
    warehouseCount: number;
    status: StockStatus;
    activeAlerts: number;
  };
  warehouseStocks: WarehouseStock[];
  recentMovements: StockMovement[];
  movementStatistics: {
    totalMovements: number;
    recentMovementsShown: number;
  };
  alerts: StockAlert[];
}
