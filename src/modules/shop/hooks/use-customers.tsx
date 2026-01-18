import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { customerService } from '@/modules/shop/services/customer.service';
import { CustomerFilterParams, CustomerStatus } from '@/modules/shop/types/customer.type';
import { toast } from 'sonner';
import { Alert, AlertIcon, AlertTitle } from '@/shared/components/ui/alert';
import { Info } from 'lucide-react';

// Query keys
export const customerKeys = {
  all: ['customers'] as const,
  list: (filters?: CustomerFilterParams) => [...customerKeys.all, 'list', filters] as const,
  detail: (id: string) => [...customerKeys.all, id] as const,
};

// Hook to fetch customers with pagination and filters
export function useCustomers(params?: CustomerFilterParams) {
  return useQuery({
    queryKey: customerKeys.list(params),
    queryFn: () => customerService.getCustomers(params),
    staleTime: 1000 * 60 * 5,
  });
}

// Hook to fetch a single customer
export function useCustomer(id: string) {
  return useQuery({
    queryKey: customerKeys.detail(id),
    queryFn: () => customerService.getCustomer(id),
    enabled: !!id,
    staleTime: 1000 * 60 * 5,
  });
}

// Hook to update customer status
export function useUpdateCustomerStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: CustomerStatus }) =>
      customerService.updateCustomerStatus(id, status),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: customerKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: customerKeys.all });

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
            <AlertTitle>Customer status updated successfully.</AlertTitle>
          </Alert>
        ),
        {
          duration: 5000,
        },
      );
    },
    onError: (error) => {
      console.error('Error updating customer status:', error);
      toast.error('Failed to update customer status');
    },
  });
}

// Hook to activate customer
export function useActivateCustomer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => customerService.activateCustomer(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: customerKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: customerKeys.all });

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
            <AlertTitle>Customer activated successfully.</AlertTitle>
          </Alert>
        ),
        {
          duration: 5000,
        },
      );
    },
    onError: (error) => {
      console.error('Error activating customer:', error);
      toast.error('Failed to activate customer');
    },
  });
}

// Hook to deactivate customer
export function useDeactivateCustomer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => customerService.deactivateCustomer(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: customerKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: customerKeys.all });

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
            <AlertTitle>Customer deactivated successfully.</AlertTitle>
          </Alert>
        ),
        {
          duration: 5000,
        },
      );
    },
    onError: (error) => {
      console.error('Error deactivating customer:', error);
      toast.error('Failed to deactivate customer');
    },
  });
}

// Hook to suspend customer
export function useSuspendCustomer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => customerService.suspendCustomer(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: customerKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: customerKeys.all });

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
            <AlertTitle>Customer suspended successfully.</AlertTitle>
          </Alert>
        ),
        {
          duration: 5000,
        },
      );
    },
    onError: (error) => {
      console.error('Error suspending customer:', error);
      toast.error('Failed to suspend customer');
    },
  });
}
