import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { productCategoryService } from '@/modules/products/services/product-category.service';
import { productCategoryRequest } from '@/modules/products/types/product-category.type';
import { toast } from 'sonner';
import { Alert, AlertIcon, AlertTitle } from '@/shared/components/ui/alert';
import { Info } from 'lucide-react';

export const productCategoryKeys = {
  all: ['product-categories'] as const,
  detail: (id: string) => [...productCategoryKeys.all, id] as const,
};

export function useProductCategories() {
  return useQuery({
    queryKey: productCategoryKeys.all,
    queryFn: () => productCategoryService.getProductCategories(),
    staleTime: 1000 * 60 * 5, 
  });
}

export function useCreateProductCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: productCategoryRequest) =>
      productCategoryService.createProductCategory(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productCategoryKeys.all });

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
            <AlertTitle>Category created successfully.</AlertTitle>
          </Alert>
        ),
        {
          duration: 5000,
        },
      );
    },
    onError: (error) => {
      console.error('Error creating category:', error);
      toast.error('Failed to create category');
    },
  });
}

// Hook to update a product category
export function useUpdateProductCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: productCategoryRequest }) =>
      productCategoryService.updateProductCategory(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: productCategoryKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: productCategoryKeys.all });

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
            <AlertTitle>Category updated successfully.</AlertTitle>
          </Alert>
        ),
        {
          duration: 5000,
        },
      );
    },
    onError: (error) => {
      console.error('Error updating category:', error);
      toast.error('Failed to update category');
    },
  });
}

export function useDeleteProductCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => productCategoryService.deleteProductCategory(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: productCategoryKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: productCategoryKeys.all });

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
            <AlertTitle>Category deleted successfully.</AlertTitle>
          </Alert>
        ),
        {
          duration: 5000,
        },
      );
    },
    onError: (error) => {
      console.error('Error deleting category:', error);
      toast.error('Failed to delete category');
    },
  });
}
