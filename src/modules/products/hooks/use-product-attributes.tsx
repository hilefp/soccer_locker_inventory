import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { productAttributeService } from '@/modules/products/services/product-attribute.service';
import { ProductAttributeRequest } from '@/modules/products/types/product-attribute.type';
import { toast } from 'sonner';
import { Alert, AlertIcon, AlertTitle } from '@/shared/components/ui/alert';
import { Info } from 'lucide-react';

// Query keys
export const productAttributeKeys = {
  all: ['product-attributes'] as const,
  detail: (id: string) => [...productAttributeKeys.all, id] as const,
};

// Hook to fetch all product attributes
export function useProductAttributes() {
  return useQuery({
    queryKey: productAttributeKeys.all,
    queryFn: () => productAttributeService.getProductAttributes(),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

// Hook to fetch a single product attribute
export function useProductAttribute(id: string) {
  return useQuery({
    queryKey: productAttributeKeys.detail(id),
    queryFn: () => productAttributeService.getProductAttributeById(id),
    enabled: !!id,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

// Hook to create a product attribute
export function useCreateProductAttribute() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: ProductAttributeRequest) =>
      productAttributeService.createProductAttribute(data),
    onSuccess: () => {
      // Invalidate and refetch attributes
      queryClient.invalidateQueries({ queryKey: productAttributeKeys.all });

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
            <AlertTitle>Attribute created successfully.</AlertTitle>
          </Alert>
        ),
        {
          duration: 5000,
        },
      );
    },
    onError: (error) => {
      console.error('Error creating attribute:', error);
      toast.error('Failed to create attribute');
    },
  });
}

// Hook to update a product attribute
export function useUpdateProductAttribute() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: ProductAttributeRequest }) =>
      productAttributeService.updateProductAttribute(id, data),
    onSuccess: (_, variables) => {
      // Invalidate specific attribute and all attributes
      queryClient.invalidateQueries({ queryKey: productAttributeKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: productAttributeKeys.all });

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
            <AlertTitle>Attribute updated successfully.</AlertTitle>
          </Alert>
        ),
        {
          duration: 5000,
        },
      );
    },
    onError: (error) => {
      console.error('Error updating attribute:', error);
      toast.error('Failed to update attribute');
    },
  });
}

// Hook to delete a product attribute
export function useDeleteProductAttribute() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => productAttributeService.deleteProductAttribute(id),
    onSuccess: (_, id) => {
      // Invalidate specific attribute and all attributes
      queryClient.invalidateQueries({ queryKey: productAttributeKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: productAttributeKeys.all });

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
            <AlertTitle>Attribute deleted successfully.</AlertTitle>
          </Alert>
        ),
        {
          duration: 5000,
        },
      );
    },
    onError: (error) => {
      console.error('Error deleting attribute:', error);
      toast.error('Failed to delete attribute');
    },
  });
}
