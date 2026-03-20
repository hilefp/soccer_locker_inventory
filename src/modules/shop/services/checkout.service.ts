import { apiClient } from '@/shared/lib/api-client';
import {
  CheckoutRequest,
  CheckoutResponse,
  ConfirmPaymentRequest,
  ConfirmPaymentResponse,
} from '@/modules/shop/types/checkout.types';

const BASE_URL = '/shop/checkout';

export const checkoutService = {
  /**
   * Create order via shop checkout (reserves stock)
   */
  async checkout(data: CheckoutRequest): Promise<CheckoutResponse> {
    const response = await apiClient.post<CheckoutResponse>(BASE_URL, data);
    return response.data;
  },

  /**
   * Confirm payment after Square checkout
   */
  async confirmPayment(data: ConfirmPaymentRequest): Promise<ConfirmPaymentResponse> {
    const response = await apiClient.post<ConfirmPaymentResponse>(`${BASE_URL}/confirm`, data);
    return response.data;
  },
};
