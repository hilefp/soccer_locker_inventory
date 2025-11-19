export enum WarehouseType {
  MAIN = 'MAIN',
  SECONDARY = 'SECONDARY',
  STORE = 'STORE',
  VIRTUAL = 'VIRTUAL',
  PRODUCTION = 'PRODUCTION',
  TRANSIT = 'TRANSIT',
}

export interface Warehouse {
  id: string;
  code: string;
  name: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
  phone?: string;
  email?: string;
  warehouseType: WarehouseType;
  isActive: boolean;
  managerId?: string;
  capacity?: number;
  latitude?: number;
  longitude?: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateWarehouseDto {
  code: string;
  name: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
  phone?: string;
  email?: string;
  warehouseType: WarehouseType;
  isActive?: boolean;
  managerId?: string;
  capacity?: number;
  latitude?: number;
  longitude?: number;
}

export interface UpdateWarehouseDto {
  name?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
  phone?: string;
  email?: string;
  warehouseType?: WarehouseType;
  managerId?: string;
  capacity?: number;
  latitude?: number;
  longitude?: number;
  isActive?: boolean;
}

export interface WarehouseFilters {
  warehouseType?: WarehouseType;
  isActive?: boolean;
  city?: string;
  state?: string;
  country?: string;
  search?: string;
}

export interface WarehouseStatistics {
  warehouse: {
    id: string;
    code: string;
    name: string;
    warehouseType: WarehouseType;
    isActive: boolean;
    capacity?: number;
    createdAt: string;
    updatedAt: string;
  };
  statistics: {
    totalStockRecords: number;
    totalQuantity: number;
    totalReservedQuantity: number;
    totalAvailableQuantity: number;
    lowStockItems: number;
    outOfStockItems: number;
    capacityUsed: number;
  };
}
