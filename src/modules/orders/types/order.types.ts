// Order Status Enum
export type OrderStatus =
  | 'NEW'
  | 'PRINT'
  | 'PICKING_UP'
  | 'PROCESSING'
  | 'SHIPPING'
  | 'DELIVERED'
  | 'MISSING'
  | 'REFUND';

// Order Status Flow Configuration
export const ORDER_STATUS_FLOW: Record<OrderStatus, OrderStatus[]> = {
  NEW: ['PRINT', 'MISSING', 'REFUND'],
  PRINT: ['PICKING_UP', 'MISSING', 'REFUND'],
  PICKING_UP: ['PROCESSING', 'MISSING', 'REFUND'],
  PROCESSING: ['SHIPPING', 'MISSING', 'REFUND'],
  SHIPPING: ['DELIVERED', 'MISSING', 'REFUND'],
  DELIVERED: ['REFUND'],
  MISSING: ['NEW', 'REFUND'],
  REFUND: [],
};

// Order Status Labels
export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  NEW: 'New',
  PRINT: 'Print',
  PICKING_UP: 'Picking Up',
  PROCESSING: 'Processing',
  SHIPPING: 'Shipping',
  DELIVERED: 'Delivered',
  MISSING: 'Missing',
  REFUND: 'Refund',
};

// Kanban Column Order (for current orders view)
export const KANBAN_STATUS_ORDER: OrderStatus[] = [
  'NEW',
  'PRINT',
  'PICKING_UP',
  'PROCESSING',
  'SHIPPING',
  'DELIVERED',
];

// Order Item Interface
export interface OrderItem {
  id: string;
  orderId: string;
  productVariantId: string;
  name: string | null;
  sku: string | null;
  attributes: Record<string, string> | null;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  createdAt: string;
  productVariant?: {
    id: string;
    sku: string;
    product?: {
      id: string;
      name: string;
      imageUrl?: string;
    };
  };
}

// Order Status History Interface
export interface OrderStatusHistory {
  id: string;
  orderId: string;
  fromStatus: OrderStatus;
  toStatus: OrderStatus;
  changedByUserId: string | null;
  changedByUser?: { id: string; email: string } | null;
  note: string | null;
  createdAt: string;
}

// Club (minimal)
export interface OrderClub {
  id: string;
  name: string;
  logoUrl?: string;
}

// Customer User (minimal)
export interface OrderCustomerUser {
  id: string;
  email: string;
  avatarUrl?: string;
}

// Inventory User Profile (minimal)
export interface OrderInventoryUser {
  id: string;
  firstName: string;
  lastName: string;
  position?: string;
}

// Order Interface
export interface Order {
  id: string;
  orderNumber: string;
  clubId: string | null;
  customerUserId: string | null;
  assignedInventoryUserId: string | null;
  status: OrderStatus;
  subtotal: number;
  taxTotal: number;
  shippingTotal: number;
  total: number;
  currency: string;
  shippingName: string | null;
  shippingPhone: string | null;
  shippingAddress1: string | null;
  shippingAddress2: string | null;
  shippingCity: string | null;
  shippingState: string | null;
  shippingPostalCode: string | null;
  shippingCountry: string | null;
  carrier: string | null;
  trackingNumber: string | null;
  shippedAt: string | null;
  deliveredAt: string | null;
  printedAt: string | null;
  pickedAt: string | null;
  processedAt: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  items?: OrderItem[];
  club?: OrderClub | null;
  customerUser?: OrderCustomerUser | null;
  assignedInventoryUser?: OrderInventoryUser | null;
  statusHistory?: OrderStatusHistory[];
  _count?: {
    items: number;
    statusHistory: number;
  };
}

// Create Order Item Request
export interface CreateOrderItemRequest {
  productVariantId: string;
  quantity: number;
  unitPrice: number;
  name?: string;
  sku?: string;
  attributes?: Record<string, string>;
  totalPrice?: number;
}

// Create Order Request
export interface CreateOrderRequest {
  clubId?: string;
  customerUserId?: string;
  assignedInventoryUserId?: string;
  status?: OrderStatus;
  subtotal?: number;
  taxTotal?: number;
  shippingTotal?: number;
  total?: number;
  currency?: string;
  shippingName?: string;
  shippingPhone?: string;
  shippingAddress1?: string;
  shippingAddress2?: string;
  shippingCity?: string;
  shippingState?: string;
  shippingPostalCode?: string;
  shippingCountry?: string;
  carrier?: string;
  notes?: string;
  items: CreateOrderItemRequest[];
}

// Update Order Request
export interface UpdateOrderRequest {
  clubId?: string;
  customerUserId?: string;
  assignedInventoryUserId?: string;
  status?: OrderStatus;
  subtotal?: number;
  taxTotal?: number;
  shippingTotal?: number;
  total?: number;
  currency?: string;
  shippingName?: string;
  shippingPhone?: string;
  shippingAddress1?: string;
  shippingAddress2?: string;
  shippingCity?: string;
  shippingState?: string;
  shippingPostalCode?: string;
  shippingCountry?: string;
  carrier?: string;
  trackingNumber?: string;
  shippedAt?: string;
  deliveredAt?: string;
  notes?: string;
}

// Update Shipping Request
export interface UpdateShippingRequest {
  carrier?: string;
  trackingNumber?: string;
  shippedAt?: string;
  deliveredAt?: string;
  shippingName?: string;
  shippingPhone?: string;
  shippingAddress1?: string;
  shippingAddress2?: string;
  shippingCity?: string;
  shippingState?: string;
  shippingPostalCode?: string;
  shippingCountry?: string;
}

// Update Status Request
export interface UpdateStatusRequest {
  status: OrderStatus;
  changedByUserId?: string;
  note?: string;
}

// Assign Order Request
export interface AssignOrderRequest {
  assignedInventoryUserId: string;
}

// Pagination Meta
export interface OrderListMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Paginated Response
export interface OrderListResponse {
  data: Order[];
  meta: OrderListMeta;
}

// Filter Parameters
export type OrderSortBy = 'createdAt' | 'updatedAt' | 'orderNumber' | 'total' | 'status';
export type SortOrder = 'asc' | 'desc';

export interface OrderFilterParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: OrderStatus;
  statuses?: OrderStatus[];
  clubId?: string;
  customerUserId?: string;
  assignedInventoryUserId?: string;
  startDate?: string;
  endDate?: string;
  sortBy?: OrderSortBy;
  sortOrder?: SortOrder;
}

// Order Statistics Response
export interface OrderStatistics {
  totalOrders: number;
  statusCounts: Record<OrderStatus, number>;
  totalRevenue: number;
  recentOrders: {
    id: string;
    orderNumber: string;
    status: OrderStatus;
    total: number;
    createdAt: string;
  }[];
}

// Bulk Print Types
export type DocumentType = 'PACKING_SLIP' | 'INVOICE';

export interface BulkPrintRequest {
  orderIds: string[];
  documentType: DocumentType;
}

export interface BulkPrintResponse {
  success: boolean;
  documentType: DocumentType;
  count: number;
  presignedUrls: string[];
  expiresIn: string;
}
