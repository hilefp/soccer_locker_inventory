import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { stockEntryService } from '../services/stock-entry.service';
import {
  CreateStockEntryDto,
  StockEntryFilters,
} from '../types/stock-entry.types';
import { toast } from 'sonner';

const STOCK_ENTRY_QUERY_KEY = 'stock-entries';

/**
 * Hook to fetch stock entries with optional filters
 */
export const useStockEntries = (filters: StockEntryFilters = {}) => {
  return useQuery({
    queryKey: [STOCK_ENTRY_QUERY_KEY, filters],
    queryFn: () => stockEntryService.getAll(filters),
  });
};

/**
 * Hook to fetch a single stock entry
 */
export const useStockEntry = (id: string) => {
  return useQuery({
    queryKey: [STOCK_ENTRY_QUERY_KEY, 'detail', id],
    queryFn: () => stockEntryService.getById(id),
    enabled: !!id,
  });
};

/**
 * Hook to create a new stock entry
 */
export const useCreateStockEntry = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateStockEntryDto) => stockEntryService.create(data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [STOCK_ENTRY_QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: ['stock-variants'] });
      toast.success(`Stock entry ${data.entryNumber} created successfully`);
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || 'Failed to create stock entry';
      const errorMessage = Array.isArray(message) ? message.join(', ') : message;
      toast.error(errorMessage);
    },
  });
};

/**
 * Hook to confirm a DRAFT stock entry (applies stock levels)
 */
export const useConfirmStockEntry = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => stockEntryService.confirm(id),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [STOCK_ENTRY_QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: ['stock-variants'] });
      toast.success(`Stock entry ${data.entryNumber} confirmed`);
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || 'Failed to confirm stock entry';
      const errorMessage = Array.isArray(message) ? message.join(', ') : message;
      toast.error(errorMessage);
    },
  });
};

/**
 * Hook to cancel a DRAFT stock entry
 */
export const useCancelStockEntry = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => stockEntryService.cancel(id),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [STOCK_ENTRY_QUERY_KEY] });
      toast.success(`Stock entry ${data.entryNumber} cancelled`);
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || 'Failed to cancel stock entry';
      const errorMessage = Array.isArray(message) ? message.join(', ') : message;
      toast.error(errorMessage);
    },
  });
};
