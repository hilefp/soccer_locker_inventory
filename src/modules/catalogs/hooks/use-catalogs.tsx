import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { catalogService } from '@/modules/catalogs/services/catalog.service';
import { CreateCatalogDto, UpdateCatalogDto } from '@/modules/catalogs/types/catalog.types';
import { toast } from 'sonner';
import { Alert, AlertIcon, AlertTitle } from '@/shared/components/ui/alert';
import { Info } from 'lucide-react';

export const catalogKeys = {
  all: ['catalogs'] as const,
  detail: (id: string) => [...catalogKeys.all, id] as const,
};

export function useCatalogs(includeInactive = false) {
  return useQuery({
    queryKey: [...catalogKeys.all, { includeInactive }],
    queryFn: () => catalogService.getCatalogs(includeInactive),
    staleTime: 1000 * 60 * 5,
  });
}

export function useCreateCatalog() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateCatalogDto) => catalogService.createCatalog(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: catalogKeys.all });

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
            <AlertTitle>Catalog created successfully.</AlertTitle>
          </Alert>
        ),
        { duration: 5000 },
      );
    },
    onError: (error) => {
      console.error('Error creating catalog:', error);
      toast.error('Failed to create catalog');
    },
  });
}

export function useUpdateCatalog() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateCatalogDto }) =>
      catalogService.updateCatalog(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: catalogKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: catalogKeys.all });

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
            <AlertTitle>Catalog updated successfully.</AlertTitle>
          </Alert>
        ),
        { duration: 5000 },
      );
    },
    onError: (error) => {
      console.error('Error updating catalog:', error);
      toast.error('Failed to update catalog');
    },
  });
}

export function useDeleteCatalog() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => catalogService.deleteCatalog(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: catalogKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: catalogKeys.all });

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
            <AlertTitle>Catalog deleted successfully.</AlertTitle>
          </Alert>
        ),
        { duration: 5000 },
      );
    },
    onError: (error) => {
      console.error('Error deleting catalog:', error);
      toast.error('Failed to delete catalog');
    },
  });
}
