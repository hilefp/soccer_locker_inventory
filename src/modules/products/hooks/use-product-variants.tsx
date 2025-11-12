import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { productVariantService } from '@/modules/products/services/product-variant.service';
import { ProductVariantRequest } from '@/modules/products/types/product.type';
import { toast } from 'sonner';
import { Alert, AlertIcon, AlertTitle } from '@/shared/components/ui/alert';
import { Info } from 'lucide-react';

// Query keys
export const productVariantKeys = {
  all: ['product-variants'] as const,
  byProduct: (productId: string) => [...productVariantKeys.all, 'product', productId] as const,
  detail: (variantId: string) => [...productVariantKeys.all, variantId] as const,
};

// Hook to fetch variants by product
export function useProductVariants(productId: string) {
  return useQuery({
    queryKey: productVariantKeys.byProduct(productId),
    queryFn: () => productVariantService.getVariantsByProduct(productId),
    enabled: !!productId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

// Hook to fetch a single variant
export function useProductVariant(variantId: string) {
  return useQuery({
    queryKey: productVariantKeys.detail(variantId),
    queryFn: () => productVariantService.getVariant(variantId),
    enabled: !!variantId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

// Hook to create a variant
export function useCreateProductVariant() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ productId, data }: { productId: string; data: ProductVariantRequest }) =>
      productVariantService.createVariant(productId, data),
    onSuccess: (_, variables) => {
      // Invalidate variants for this product
      queryClient.invalidateQueries({ queryKey: productVariantKeys.byProduct(variables.productId) });

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
            <AlertTitle>Variant created successfully.</AlertTitle>
          </Alert>
        ),
        {
          duration: 5000,
        },
      );
    },
    onError: (error) => {
      console.error('Error creating variant:', error);
      toast.error('Failed to create variant');
    },
  });
}

// Hook to update a variant
export function useUpdateProductVariant() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ variantId, data }: { variantId: string; data: ProductVariantRequest }) =>
      productVariantService.updateVariant(variantId, data),
    onSuccess: (data, variables) => {
      // Invalidate specific variant and all variants
      queryClient.invalidateQueries({ queryKey: productVariantKeys.detail(variables.variantId) });
      if (data.productId) {
        queryClient.invalidateQueries({ queryKey: productVariantKeys.byProduct(data.productId) });
      }

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
            <AlertTitle>Variant updated successfully.</AlertTitle>
          </Alert>
        ),
        {
          duration: 5000,
        },
      );
    },
    onError: (error) => {
      console.error('Error updating variant:', error);
      toast.error('Failed to update variant');
    },
  });
}

// Hook to delete a variant
export function useDeleteProductVariant() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (variantId: string) => productVariantService.deleteVariant(variantId),
    onSuccess: (_, variantId) => {
      // Invalidate specific variant and all variants
      queryClient.invalidateQueries({ queryKey: productVariantKeys.detail(variantId) });
      queryClient.invalidateQueries({ queryKey: productVariantKeys.all });

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
            <AlertTitle>Variant deleted successfully.</AlertTitle>
          </Alert>
        ),
        {
          duration: 5000,
        },
      );
    },
    onError: (error) => {
      console.error('Error deleting variant:', error);
      toast.error('Failed to delete variant');
    },
  });
}
