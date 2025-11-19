import { useMutation, useQueryClient } from '@tanstack/react-query';
import { stockEntryService } from '../services/stock-entry.service';
import { CreateStockEntryDto } from '../types/stock-entry.types';
import { toast } from 'sonner';

const STOCK_ENTRY_QUERY_KEY = 'stock-entries';

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
