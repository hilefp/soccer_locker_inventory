import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { productBrandService } from '@/modules/products/services/product-brand.service';
import { ProductBrandRequest } from '@/modules/products/types/product-brand.type';
import { toast } from 'sonner';
import { Alert, AlertIcon, AlertTitle } from '@/shared/components/ui/alert';
import { Info } from 'lucide-react';

export const productBrandKeys = {
  all: ['product-brands'] as const,
  detail: (id: string) => [...productBrandKeys.all, id] as const,
};

export function useProductBrands() {
  return useQuery({
    queryKey: productBrandKeys.all,
    queryFn: () => productBrandService.getProductBrands(),
    staleTime: 1000 * 60 * 5,
  });
}

export function useCreateProductBrand() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: ProductBrandRequest) =>
      productBrandService.createProductBrand(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productBrandKeys.all });

      toast.custom(
        (t) => (
          <Alert
            variant="mono"
            icon="success"
            close={true}
            onClose={() => toast.dismiss(t)}
          >
            <AlertIcon>
              <Info />
            </AlertIcon>
            <AlertTitle>Brand created successfully.</AlertTitle>
          </Alert>
        ),
        {
          duration: 5000,
        },
      );
    },
    onError: (error) => {
      console.error('Error creating brand:', error);
      toast.error('Failed to create brand');
    },
  });
}

// Hook to update a product brand
export function useUpdateProductBrand() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: ProductBrandRequest }) =>
      productBrandService.updateProductBrand(id, data),
    onSuccess: (_, variables) => {
      // Invalidate specific brand and all brands
      queryClient.invalidateQueries({ queryKey: productBrandKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: productBrandKeys.all });

      toast.custom(
        (t) => (
          <Alert
            variant="mono"
            icon="success"
            close={true}
            onClose={() => toast.dismiss(t)}
          >
            <AlertIcon>
              <Info />
            </AlertIcon>
            <AlertTitle>Brand updated successfully.</AlertTitle>
          </Alert>
        ),
        {
          duration: 5000,
        },
      );
    },
    onError: (error) => {
      console.error('Error updating brand:', error);
      toast.error('Failed to update brand');
    },
  });
}

export function useDeleteProductBrand() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => productBrandService.deleteProductBrand(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: productBrandKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: productBrandKeys.all });

      toast.custom(
        (t) => (
          <Alert
            variant="mono"
            icon="success"
            close={true}
            onClose={() => toast.dismiss(t)}
          >
            <AlertIcon>
              <Info />
            </AlertIcon>
            <AlertTitle>Brand deleted successfully.</AlertTitle>
          </Alert>
        ),
        {
          duration: 5000,
        },
      );
    },
    onError: (error) => {
      console.error('Error deleting brand:', error);
      toast.error('Failed to delete brand');
    },
  });
}
