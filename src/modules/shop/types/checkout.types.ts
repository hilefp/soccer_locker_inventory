import { Order } from '@/modules/orders/types';

// Checkout Shipping Address
export interface CheckoutShippingAddress {
  name: string;
  phone: string;
  address1: string;
  address2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

// Checkout Request (Shop)
export interface CheckoutRequest {
  clubId: string;
  shippingAddress: CheckoutShippingAddress;
}

// Checkout Response (Shop)
export interface CheckoutResponse {
  order: Order;
  checkoutUrl: string;
}

// Confirm Payment Request
export interface ConfirmPaymentRequest {
  orderId: string;
  checkoutId: string;
}

// Confirm Payment Response
export interface ConfirmPaymentResponse {
  success: boolean;
  order: {
    id: string;
    orderNumber: string;
    status: string;
    paymentStatus: string;
    total: number;
  };
  message: string;
}
