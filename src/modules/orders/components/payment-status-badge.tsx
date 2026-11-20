'use client';

import { Badge } from '@/shared/components/ui/badge';
import type { LegacyPaymentStatus, PaymentStatus } from '@/modules/orders/types';
import { normalizePaymentStatus } from '@/modules/orders/lib/order-exceptions';

type BadgeVariant = 'success' | 'warning' | 'destructive' | 'secondary' | 'primary' | 'info';

const PAYMENT_STATUS_CONFIG: Record<PaymentStatus, { label: string; variant: BadgeVariant }> = {
  PENDING: { label: 'Payment Pending', variant: 'secondary' },
  PROCESSING: { label: 'Payment Processing', variant: 'info' },
  PAID: { label: 'Paid', variant: 'success' },
  FAILED: { label: 'Payment Failed', variant: 'destructive' },
  NEEDS_REVIEW: { label: 'Payment Needs Review', variant: 'destructive' },
  REFUNDED: { label: 'Refunded', variant: 'warning' },
};

interface PaymentStatusBadgeProps {
  status: PaymentStatus | LegacyPaymentStatus | null | undefined;
  size?: 'sm' | 'md' | 'lg';
  appearance?: 'default' | 'light' | 'outline' | 'ghost';
}

/** Payment status of an order. Legacy values are normalized; null/unknown renders nothing. */
export function PaymentStatusBadge({ status, size = 'sm', appearance = 'light' }: PaymentStatusBadgeProps) {
  const normalized = normalizePaymentStatus(status);
  const config = normalized ? PAYMENT_STATUS_CONFIG[normalized] : undefined;
  if (!config) return null;

  return (
    <Badge variant={config.variant} appearance={appearance} size={size} className="rounded-full">
      {config.label}
    </Badge>
  );
}
