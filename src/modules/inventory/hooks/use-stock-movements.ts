import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { stockMovementService } from '../services/stock-movement.service';
import {
  StockMovementQueryParams,
  CreateStockMovementDto
} from '../types/stock-movement.types';

const STOCK_MOVEMENTS_QUERY_KEY = 'stock-movements';

/**
 * Hook to fetch paginated stock movements with filters
 */
export const useStockMovements = (params: StockMovementQueryParams = {}) => {
  return useQuery({
    queryKey: [STOCK_MOVEMENTS_QUERY_KEY, params],
    queryFn: () => stockMovementService.getAll(params),
  });
};

/**
 * Hook to fetch a single stock movement by ID
 */
export const useStockMovement = (id: string) => {
  return useQuery({
    queryKey: [STOCK_MOVEMENTS_QUERY_KEY, id],
    queryFn: () => stockMovementService.getById(id),
    enabled: !!id,
  });
};

/**
 * Hook to fetch movements by reference
 */
export const useStockMovementsByReference = (
  referenceType: string,
  referenceId: string
) => {
  return useQuery({
    queryKey: [STOCK_MOVEMENTS_QUERY_KEY, 'reference', referenceType, referenceId],
    queryFn: () => stockMovementService.getByReference(referenceType, referenceId),
    enabled: !!referenceType && !!referenceId,
  });
};

/**
 * Hook to fetch variant history
 */
export const useVariantHistory = (
  variantId: string,
  warehouseId: string,
  params?: { startDate?: string; endDate?: string }
) => {
  return useQuery({
    queryKey: [STOCK_MOVEMENTS_QUERY_KEY, 'history', variantId, warehouseId, params],
    queryFn: () => stockMovementService.getVariantHistory(variantId, warehouseId, params),
    enabled: !!variantId && !!warehouseId,
  });
};

/**
 * Hook to fetch warehouse statistics
 */
export const useWarehouseStatistics = (
  warehouseId: string,
  params?: { startDate?: string; endDate?: string }
) => {
  return useQuery({
    queryKey: [STOCK_MOVEMENTS_QUERY_KEY, 'statistics', warehouseId, params],
    queryFn: () => stockMovementService.getWarehouseStatistics(warehouseId, params),
    enabled: !!warehouseId,
  });
};

/**
 * Hook to create a new stock movement
 */
export const useCreateStockMovement = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateStockMovementDto) => stockMovementService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [STOCK_MOVEMENTS_QUERY_KEY] });
    },
  });
};

/**
 * Hook to hard delete a stock movement
 */
export const useHardDeleteStockMovement = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => stockMovementService.hardDelete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [STOCK_MOVEMENTS_QUERY_KEY] });
    },
  });
};
