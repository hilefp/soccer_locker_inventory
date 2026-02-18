import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ordersService } from '@/modules/orders/services/orders.service';
import {
  OrderFilterParams,
  OrderStatus,
  CreateOrderRequest,
  UpdateOrderRequest,
  UpdateShippingRequest,
  CreateOrderNoteRequest,
} from '@/modules/orders/types';
import { toast } from 'sonner';
import { Alert, AlertIcon, AlertTitle } from '@/shared/components/ui/alert';
import { Info } from 'lucide-react';

// Query keys
export const orderKeys = {
  all: ['orders'] as const,
  list: (filters?: OrderFilterParams) => [...orderKeys.all, 'list', filters] as const,
  detail: (id: string) => [...orderKeys.all, id] as const,
  items: (id: string) => [...orderKeys.all, id, 'items'] as const,
  statusHistory: (id: string) => [...orderKeys.all, id, 'status-history'] as const,
  statistics: () => [...orderKeys.all, 'statistics'] as const,
};

// Hook to fetch orders with pagination and filters
export function useOrders(params?: OrderFilterParams) {
  return useQuery({
    queryKey: orderKeys.list(params),
    queryFn: () => ordersService.getOrders(params),
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
}

// Hook to fetch order statistics
export function useOrderStatistics() {
  return useQuery({
    queryKey: orderKeys.statistics(),
    queryFn: () => ordersService.getStatistics(),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

// Hook to fetch a single order
export function useOrder(id: string) {
  return useQuery({
    queryKey: orderKeys.detail(id),
    queryFn: () => ordersService.getOrder(id),
    enabled: !!id,
    staleTime: 1000 * 60 * 2,
  });
}

// Hook to fetch order items
export function useOrderItems(id: string) {
  return useQuery({
    queryKey: orderKeys.items(id),
    queryFn: () => ordersService.getOrderItems(id),
    enabled: !!id,
    staleTime: 1000 * 60 * 2,
  });
}

// Hook to fetch order status history
export function useOrderStatusHistory(id: string) {
  return useQuery({
    queryKey: orderKeys.statusHistory(id),
    queryFn: () => ordersService.getOrderStatusHistory(id),
    enabled: !!id,
    staleTime: 1000 * 60 * 2,
  });
}

// Hook to create an order
export function useCreateOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateOrderRequest) => ordersService.createOrder(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: orderKeys.all });
      toast.custom(
        (t) => (
          <Alert variant="mono" icon="success" close={true} onClose={() => toast.dismiss(t)}>
            <AlertIcon>
              <Info />
            </AlertIcon>
            <AlertTitle>Order created successfully.</AlertTitle>
          </Alert>
        ),
        { duration: 5000 }
      );
    },
    onError: (error: Error & { response?: { data?: { message?: string } } }) => {
      console.error('Error creating order:', error);
      toast.error(error?.response?.data?.message || 'Failed to create order');
    },
  });
}

// Hook to update an order
export function useUpdateOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateOrderRequest }) =>
      ordersService.updateOrder(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: orderKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: orderKeys.all });
      toast.custom(
        (t) => (
          <Alert variant="mono" icon="success" close={true} onClose={() => toast.dismiss(t)}>
            <AlertIcon>
              <Info />
            </AlertIcon>
            <AlertTitle>Order updated successfully.</AlertTitle>
          </Alert>
        ),
        { duration: 5000 }
      );
    },
    onError: (error: Error & { response?: { data?: { message?: string } } }) => {
      console.error('Error updating order:', error);
      toast.error(error?.response?.data?.message || 'Failed to update order');
    },
  });
}

// Hook to update order status
export function useUpdateOrderStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      status,
      note,
      changedByUserId,
    }: {
      id: string;
      status: OrderStatus;
      note?: string;
      changedByUserId?: string;
    }) => ordersService.updateOrderStatus(id, { status, note, changedByUserId }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: orderKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: orderKeys.statusHistory(variables.id) });
      queryClient.invalidateQueries({ queryKey: orderKeys.all });
      queryClient.invalidateQueries({ queryKey: orderKeys.statistics() });
      toast.custom(
        (t) => (
          <Alert variant="mono" icon="success" close={true} onClose={() => toast.dismiss(t)}>
            <AlertIcon>
              <Info />
            </AlertIcon>
            <AlertTitle>Order status updated successfully.</AlertTitle>
          </Alert>
        ),
        { duration: 5000 }
      );
    },
    onError: (error: Error & { response?: { data?: { message?: string } } }) => {
      console.error('Error updating order status:', error);
      toast.error(error?.response?.data?.message || 'Failed to update order status');
    },
  });
}

// Hook to assign order to inventory user
export function useAssignOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, assignedInventoryUserId }: { id: string; assignedInventoryUserId: string }) =>
      ordersService.assignOrder(id, { assignedInventoryUserId }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: orderKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: orderKeys.all });
      toast.custom(
        (t) => (
          <Alert variant="mono" icon="success" close={true} onClose={() => toast.dismiss(t)}>
            <AlertIcon>
              <Info />
            </AlertIcon>
            <AlertTitle>Order assigned successfully.</AlertTitle>
          </Alert>
        ),
        { duration: 5000 }
      );
    },
    onError: (error: Error & { response?: { data?: { message?: string } } }) => {
      console.error('Error assigning order:', error);
      toast.error(error?.response?.data?.message || 'Failed to assign order');
    },
  });
}

// Hook to update shipping information
export function useUpdateShipping() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateShippingRequest }) =>
      ordersService.updateShipping(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: orderKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: orderKeys.all });
      toast.custom(
        (t) => (
          <Alert variant="mono" icon="success" close={true} onClose={() => toast.dismiss(t)}>
            <AlertIcon>
              <Info />
            </AlertIcon>
            <AlertTitle>Shipping information updated successfully.</AlertTitle>
          </Alert>
        ),
        { duration: 5000 }
      );
    },
    onError: (error: Error & { response?: { data?: { message?: string } } }) => {
      console.error('Error updating shipping:', error);
      toast.error(error?.response?.data?.message || 'Failed to update shipping information');
    },
  });
}

// Hook to fetch order notes
export function useOrderNotes(id: string) {
  return useQuery({
    queryKey: [...orderKeys.all, id, 'notes'] as const,
    queryFn: () => ordersService.getOrderNotes(id),
    enabled: !!id,
    staleTime: 1000 * 60 * 2,
  });
}

// Hook to create an order note
export function useCreateOrderNote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ orderId, data }: { orderId: string; data: CreateOrderNoteRequest }) =>
      ordersService.createOrderNote(orderId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [...orderKeys.all, variables.orderId, 'notes'] });
    },
    onError: (error: Error & { response?: { data?: { message?: string } } }) => {
      console.error('Error creating order note:', error);
    },
  });
}

// Hook to delete an order note
export function useDeleteOrderNote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ orderId, noteId }: { orderId: string; noteId: string }) =>
      ordersService.deleteOrderNote(orderId, noteId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [...orderKeys.all, variables.orderId, 'notes'] });
    },
    onError: (error: Error & { response?: { data?: { message?: string } } }) => {
      console.error('Error deleting order note:', error);
    },
  });
}

// Hook to delete an order
export function useDeleteOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => ordersService.deleteOrder(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: orderKeys.all });
      toast.custom(
        (t) => (
          <Alert variant="mono" icon="success" close={true} onClose={() => toast.dismiss(t)}>
            <AlertIcon>
              <Info />
            </AlertIcon>
            <AlertTitle>Order deleted successfully.</AlertTitle>
          </Alert>
        ),
        { duration: 5000 }
      );
    },
    onError: (error: Error & { response?: { data?: { message?: string } } }) => {
      console.error('Error deleting order:', error);
      toast.error(error?.response?.data?.message || 'Failed to delete order');
    },
  });
}
