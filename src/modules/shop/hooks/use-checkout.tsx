import { useMutation, useQueryClient } from '@tanstack/react-query';
import { checkoutService } from '@/modules/shop/services/checkout.service';
import { CheckoutRequest, ConfirmPaymentRequest } from '@/modules/shop/types/checkout.types';
import { orderKeys } from '@/modules/orders/hooks/use-orders';
import { toast } from 'sonner';
import { Alert, AlertIcon, AlertTitle } from '@/shared/components/ui/alert';
import { Info } from 'lucide-react';

// Hook to create an order via shop checkout
export function useCheckout() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CheckoutRequest) => checkoutService.checkout(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: orderKeys.all });
      toast.custom(
        (t) => (
          <Alert variant="mono" icon="success" close={true} onClose={() => toast.dismiss(t)}>
            <AlertIcon>
              <Info />
            </AlertIcon>
            <AlertTitle>Order created successfully. Stock reserved.</AlertTitle>
          </Alert>
        ),
        { duration: 5000 }
      );
    },
    onError: (error: Error & { response?: { data?: { message?: string } } }) => {
      console.error('Error during checkout:', error);
      toast.error(error?.response?.data?.message || 'Failed to create order');
    },
  });
}

// Hook to confirm payment after Square checkout
export function useConfirmPayment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: ConfirmPaymentRequest) => checkoutService.confirmPayment(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: orderKeys.detail(variables.orderId) });
      queryClient.invalidateQueries({ queryKey: orderKeys.all });
      queryClient.invalidateQueries({ queryKey: orderKeys.statistics() });
      toast.custom(
        (t) => (
          <Alert variant="mono" icon="success" close={true} onClose={() => toast.dismiss(t)}>
            <AlertIcon>
              <Info />
            </AlertIcon>
            <AlertTitle>Payment confirmed. Your order is being processed.</AlertTitle>
          </Alert>
        ),
        { duration: 5000 }
      );
    },
    onError: (error: Error & { response?: { data?: { message?: string } } }) => {
      console.error('Error confirming payment:', error);
      toast.error(error?.response?.data?.message || 'Failed to confirm payment');
    },
  });
}
