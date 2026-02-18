import { apiClient } from '@/shared/lib/api-client';
import {
  Order,
  OrderItem,
  OrderStatusHistory,
  OrderNote,
  CreateOrderNoteRequest,
  OrderListResponse,
  OrderStatistics,
  OrderFilterParams,
  CreateOrderRequest,
  UpdateOrderRequest,
  UpdateStatusRequest,
  UpdateShippingRequest,
  AssignOrderRequest,
  BulkPrintRequest,
  BulkPrintResponse,
} from '@/modules/orders/types';

const BASE_URL = '/inventory/orders';

export const ordersService = {
  /**
   * Get all orders with pagination and filters
   */
  async getOrders(params?: OrderFilterParams): Promise<OrderListResponse> {
    const queryParams = new URLSearchParams();

    if (params) {
      if (params.page) queryParams.append('page', params.page.toString());
      if (params.limit) queryParams.append('limit', params.limit.toString());
      if (params.search) queryParams.append('search', params.search);
      if (params.status) queryParams.append('status', params.status);
      if (params.statuses && params.statuses.length > 0) {
        params.statuses.forEach((status) => queryParams.append('statuses', status));
      }
      if (params.clubId) queryParams.append('clubId', params.clubId);
      if (params.customerUserId) queryParams.append('customerUserId', params.customerUserId);
      if (params.assignedInventoryUserId) queryParams.append('assignedInventoryUserId', params.assignedInventoryUserId);
      if (params.startDate) queryParams.append('startDate', params.startDate);
      if (params.endDate) queryParams.append('endDate', params.endDate);
      if (params.sortBy) queryParams.append('sortBy', params.sortBy);
      if (params.sortOrder) queryParams.append('sortOrder', params.sortOrder);
    }

    const queryString = queryParams.toString();
    const url = `${BASE_URL}${queryString ? `?${queryString}` : ''}`;

    const response = await apiClient.get<OrderListResponse>(url);
    return response.data;
  },

  /**
   * Get order statistics for dashboard/reporting
   */
  async getStatistics(): Promise<OrderStatistics> {
    const response = await apiClient.get<OrderStatistics>(`${BASE_URL}/statistics`);
    return response.data;
  },

  /**
   * Get order by ID
   */
  async getOrder(id: string): Promise<Order> {
    const response = await apiClient.get<Order>(`${BASE_URL}/${id}`);
    return response.data;
  },

  /**
   * Get order by order number
   */
  async getOrderByNumber(orderNumber: string): Promise<Order> {
    const response = await apiClient.get<Order>(`${BASE_URL}/number/${orderNumber}`);
    return response.data;
  },

  /**
   * Get order items
   */
  async getOrderItems(id: string): Promise<OrderItem[]> {
    const response = await apiClient.get<OrderItem[]>(`${BASE_URL}/${id}/items`);
    return response.data;
  },

  /**
   * Get order status history
   */
  async getOrderStatusHistory(id: string): Promise<OrderStatusHistory[]> {
    const response = await apiClient.get<OrderStatusHistory[]>(`${BASE_URL}/${id}/status-history`);
    return response.data;
  },

  /**
   * Create a new order
   */
  async createOrder(data: CreateOrderRequest): Promise<Order> {
    const response = await apiClient.post<Order>(BASE_URL, data);
    return response.data;
  },

  /**
   * Update an existing order
   */
  async updateOrder(id: string, data: UpdateOrderRequest): Promise<Order> {
    const response = await apiClient.put<Order>(`${BASE_URL}/${id}`, data);
    return response.data;
  },

  /**
   * Update order status
   */
  async updateOrderStatus(id: string, data: UpdateStatusRequest): Promise<OrderStatusHistory> {
    const response = await apiClient.patch<OrderStatusHistory>(`${BASE_URL}/${id}/status`, data);
    return response.data;
  },

  /**
   * Assign order to inventory user
   */
  async assignOrder(id: string, data: AssignOrderRequest): Promise<Order> {
    const response = await apiClient.patch<Order>(`${BASE_URL}/${id}/assign`, data);
    return response.data;
  },

  /**
   * Update shipping information
   */
  async updateShipping(id: string, data: UpdateShippingRequest): Promise<Order> {
    const response = await apiClient.patch<Order>(`${BASE_URL}/${id}/shipping`, data);
    return response.data;
  },

  /**
   * Delete an order
   */
  async deleteOrder(id: string): Promise<void> {
    await apiClient.delete(`${BASE_URL}/${id}`);
  },

  /**
   * Bulk print packing slips or invoices
   */
  async bulkPrint(data: BulkPrintRequest): Promise<BulkPrintResponse> {
    const response = await apiClient.post<BulkPrintResponse>(`${BASE_URL}/bulk-print`, data);
    return response.data;
  },

  /**
   * Get order notes
   */
  async getOrderNotes(id: string): Promise<OrderNote[]> {
    const response = await apiClient.get<OrderNote[]>(`${BASE_URL}/${id}/notes`);
    return response.data;
  },

  /**
   * Create an order note
   */
  async createOrderNote(id: string, data: CreateOrderNoteRequest): Promise<OrderNote> {
    const response = await apiClient.post<OrderNote>(`${BASE_URL}/${id}/notes`, data);
    return response.data;
  },

  /**
   * Delete an order note
   */
  async deleteOrderNote(id: string, noteId: string): Promise<void> {
    await apiClient.delete(`${BASE_URL}/${id}/notes/${noteId}`);
  },
};
