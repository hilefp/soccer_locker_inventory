'use client';

import { Badge } from '@/shared/components/ui/badge';
import { OrderStatus, ORDER_STATUS_LABELS } from '@/modules/orders/types';

type BadgeVariant = 'success' | 'warning' | 'destructive' | 'secondary' | 'primary' | 'info';

const getStatusBadgeVariant = (status: OrderStatus): BadgeVariant => {
  switch (status) {
    case 'NEW':
      return 'info';
    case 'PRINT':
      return 'secondary';
    case 'PICKING_UP':
      return 'warning';
    case 'PROCESSING':
      return 'primary';
    case 'SHIPPING':
      return 'info';
    case 'DELIVERED':
      return 'success';
    case 'MISSING':
      return 'destructive';
    case 'REFUND':
      return 'destructive';
    default:
      return 'secondary';
  }
};

interface OrderStatusBadgeProps {
  status: OrderStatus;
  size?: 'sm' | 'md' | 'lg';
  appearance?: 'default' | 'light' | 'outline' | 'ghost';
}

export function OrderStatusBadge({
  status,
  size = 'sm',
  appearance = 'light',
}: OrderStatusBadgeProps) {
  return (
    <Badge
      variant={getStatusBadgeVariant(status)}
      appearance={appearance}
      size={size}
      className="rounded-full"
    >
      {ORDER_STATUS_LABELS[status]}
    </Badge>
  );
}
