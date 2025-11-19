import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { warehouseService } from '../services/warehouse.service';
import {
  WarehouseFilters,
  CreateWarehouseDto,
  UpdateWarehouseDto,
} from '../types/warehouse.types';
import { toast } from 'sonner';

const WAREHOUSE_QUERY_KEY = 'warehouses';

/**
 * Hook to fetch all warehouses with optional filters
 */
export const useWarehouses = (filters: WarehouseFilters = {}) => {
  return useQuery({
    queryKey: [WAREHOUSE_QUERY_KEY, filters],
    queryFn: () => warehouseService.getAll(filters),
  });
};

/**
 * Hook to fetch a single warehouse by ID
 */
export const useWarehouse = (id: string) => {
  return useQuery({
    queryKey: [WAREHOUSE_QUERY_KEY, id],
    queryFn: () => warehouseService.getById(id),
    enabled: !!id,
  });
};

/**
 * Hook to fetch warehouse by code
 */
export const useWarehouseByCode = (code: string) => {
  return useQuery({
    queryKey: [WAREHOUSE_QUERY_KEY, 'code', code],
    queryFn: () => warehouseService.getByCode(code),
    enabled: !!code,
  });
};

/**
 * Hook to fetch warehouse statistics
 */
export const useWarehouseStatistics = (id: string) => {
  return useQuery({
    queryKey: [WAREHOUSE_QUERY_KEY, id, 'statistics'],
    queryFn: () => warehouseService.getStatistics(id),
    enabled: !!id,
  });
};

/**
 * Hook to create a new warehouse
 */
export const useCreateWarehouse = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateWarehouseDto) => warehouseService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [WAREHOUSE_QUERY_KEY] });
      toast.success('Warehouse created successfully');
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || 'Failed to create warehouse';
      toast.error(Array.isArray(message) ? message.join(', ') : message);
    },
  });
};

/**
 * Hook to update a warehouse
 */
export const useUpdateWarehouse = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateWarehouseDto }) =>
      warehouseService.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [WAREHOUSE_QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [WAREHOUSE_QUERY_KEY, variables.id] });
      toast.success('Warehouse updated successfully');
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || 'Failed to update warehouse';
      toast.error(Array.isArray(message) ? message.join(', ') : message);
    },
  });
};

/**
 * Hook to activate a warehouse
 */
export const useActivateWarehouse = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => warehouseService.activate(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: [WAREHOUSE_QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [WAREHOUSE_QUERY_KEY, id] });
      toast.success('Warehouse activated successfully');
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || 'Failed to activate warehouse';
      toast.error(Array.isArray(message) ? message.join(', ') : message);
    },
  });
};

/**
 * Hook to deactivate a warehouse
 */
export const useDeactivateWarehouse = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => warehouseService.deactivate(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: [WAREHOUSE_QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [WAREHOUSE_QUERY_KEY, id] });
      toast.success('Warehouse deactivated successfully');
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || 'Failed to deactivate warehouse';
      toast.error(Array.isArray(message) ? message.join(', ') : message);
    },
  });
};

/**
 * Hook to soft delete a warehouse
 */
export const useDeleteWarehouse = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => warehouseService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [WAREHOUSE_QUERY_KEY] });
      toast.success('Warehouse deleted successfully');
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || 'Failed to delete warehouse';
      toast.error(Array.isArray(message) ? message.join(', ') : message);
    },
  });
};

/**
 * Hook to permanently delete a warehouse
 */
export const useHardDeleteWarehouse = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => warehouseService.hardDelete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [WAREHOUSE_QUERY_KEY] });
      toast.success('Warehouse permanently deleted');
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || 'Failed to permanently delete warehouse';
      toast.error(Array.isArray(message) ? message.join(', ') : message);
    },
  });
};
