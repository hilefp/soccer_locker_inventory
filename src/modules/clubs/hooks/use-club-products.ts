import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { clubProductsService } from '../services/club-products.service';
import type {
  AddProductsToClubDto,
  ClubProductFilters,
  UpdateClubProductDto,
} from '../types/club-product';

const QUERY_KEY = 'club-products';
const CLUB_PRODUCT_QUERY_KEY = 'club-product';
const CLUB_STATS_QUERY_KEY = 'club-product-stats';

// Get a single club product
export function useClubProduct(
  clubId: string | undefined,
  clubProductId: string | undefined
) {
  return useQuery({
    queryKey: [CLUB_PRODUCT_QUERY_KEY, clubId, clubProductId],
    queryFn: () => clubProductsService.getClubProduct(clubId!, clubProductId!),
    enabled: !!clubId && !!clubProductId,
  });
}

// Get club products with pagination
export function useClubProducts(
  clubId: string | undefined,
  params?: {
    page?: number;
    limit?: number;
    filters?: ClubProductFilters;
  }
) {
  return useQuery({
    queryKey: [QUERY_KEY, clubId, params],
    queryFn: () => clubProductsService.getClubProducts(clubId!, params),
    enabled: !!clubId,
  });
}

// Get club product stats
export function useClubProductStats(clubId: string | undefined) {
  return useQuery({
    queryKey: [CLUB_STATS_QUERY_KEY, clubId],
    queryFn: () => clubProductsService.getClubProductStats(clubId!),
    enabled: !!clubId,
  });
}

// Add products to club
export function useAddProductsToClub(clubId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: AddProductsToClubDto) =>
      clubProductsService.addProductsToClub(clubId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, clubId] });
      queryClient.invalidateQueries({
        queryKey: [CLUB_STATS_QUERY_KEY, clubId],
      });
      toast.success('Products added to club successfully');
    },
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message || 'Failed to add products to club'
      );
    },
  });
}

// Update club product
export function useUpdateClubProduct(clubId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      clubProductId,
      data,
    }: {
      clubProductId: string;
      data: UpdateClubProductDto;
    }) => clubProductsService.updateClubProduct(clubId, clubProductId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, clubId] });
      queryClient.invalidateQueries({
        queryKey: [CLUB_STATS_QUERY_KEY, clubId],
      });
      toast.success('Club product updated successfully');
    },
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message || 'Failed to update club product'
      );
    },
  });
}

// Remove product from club
export function useRemoveClubProduct(clubId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (clubProductId: string) =>
      clubProductsService.removeClubProduct(clubId, clubProductId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, clubId] });
      queryClient.invalidateQueries({
        queryKey: [CLUB_STATS_QUERY_KEY, clubId],
      });
      toast.success('Product removed from club successfully');
    },
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message || 'Failed to remove product from club'
      );
    },
  });
}
