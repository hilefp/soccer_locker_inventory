import { useQuery } from '@tanstack/react-query';
import { stockVariantService } from '../services/stock-variant.service';
import { StockVariantQueryParams } from '../types/stock-variant.types';

const STOCK_VARIANTS_QUERY_KEY = 'stock-variants';

/**
 * Hook to fetch paginated stock variants with filters
 */
export const useStockVariants = (params: StockVariantQueryParams = {}) => {
  return useQuery({
    queryKey: [STOCK_VARIANTS_QUERY_KEY, params],
    queryFn: () => stockVariantService.getAll(params),
  });
};

/**
 * Hook to fetch detailed information for a specific variant
 */
export const useStockVariantDetail = (variantId: string) => {
  return useQuery({
    queryKey: [STOCK_VARIANTS_QUERY_KEY, 'detail', variantId],
    queryFn: () => stockVariantService.getDetail(variantId),
    enabled: !!variantId,
  });
};
