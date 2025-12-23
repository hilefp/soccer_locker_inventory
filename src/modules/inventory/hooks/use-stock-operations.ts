import { useMutation, useQueryClient } from '@tanstack/react-query';
import { stockOperationsService } from '../services/stock-operations.service';
import {
  AdjustStockDto,
  RegisterStockEntryDto,
  RegisterStockExitDto,
  RegisterPhysicalCountDto,
} from '../types/stock-operations.types';

/**
 * Hook to adjust stock (increase or decrease)
 */
export const useAdjustStock = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: AdjustStockDto) => stockOperationsService.adjustStock(data),
    onSuccess: () => {
      // Invalidate stock-related queries
      queryClient.invalidateQueries({ queryKey: ['stock-variants'] });
      queryClient.invalidateQueries({ queryKey: ['stock-movements'] });
    },
  });
};

/**
 * Hook to register stock entry (increase stock)
 */
export const useRegisterStockEntry = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: RegisterStockEntryDto) => stockOperationsService.registerEntry(data),
    onSuccess: () => {
      // Invalidate stock-related queries
      queryClient.invalidateQueries({ queryKey: ['stock-variants'] });
      queryClient.invalidateQueries({ queryKey: ['stock-movements'] });
    },
  });
};

/**
 * Hook to register stock exit (decrease stock)
 */
export const useRegisterStockExit = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: RegisterStockExitDto) => stockOperationsService.registerExit(data),
    onSuccess: () => {
      // Invalidate stock-related queries
      queryClient.invalidateQueries({ queryKey: ['stock-variants'] });
      queryClient.invalidateQueries({ queryKey: ['stock-movements'] });
    },
  });
};

/**
 * Hook to register physical count (auto-adjust based on variance)
 */
export const useRegisterPhysicalCount = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: RegisterPhysicalCountDto) => stockOperationsService.registerPhysicalCount(data),
    onSuccess: () => {
      // Invalidate stock-related queries
      queryClient.invalidateQueries({ queryKey: ['stock-variants'] });
      queryClient.invalidateQueries({ queryKey: ['stock-movements'] });
    },
  });
};
