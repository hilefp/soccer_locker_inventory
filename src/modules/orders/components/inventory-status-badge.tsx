'use client';

import { Badge } from '@/shared/components/ui/badge';
import type { InventoryStatus } from '@/modules/orders/types';

type BadgeVariant = 'success' | 'warning' | 'destructive' | 'secondary' | 'primary' | 'info';

const INVENTORY_STATUS_CONFIG: Record<InventoryStatus, { label: string; variant: BadgeVariant }> = {
  PENDING: { label: 'Stock Pending', variant: 'secondary' },
  RESERVED: { label: 'Stock Reserved', variant: 'success' },
  OVERSOLD: { label: 'Oversold', variant: 'warning' },
  FAILED: { label: 'Stock Reservation Failed', variant: 'destructive' },
  RELEASED: { label: 'Stock Released', variant: 'secondary' },
};

interface InventoryStatusBadgeProps {
  status: InventoryStatus | null | undefined;
  size?: 'sm' | 'md' | 'lg';
  appearance?: 'default' | 'light' | 'outline' | 'ghost';
}

/** Stock reservation status of an order. null (legacy order) renders nothing. */
export function InventoryStatusBadge({ status, size = 'sm', appearance = 'light' }: InventoryStatusBadgeProps) {
  const config = status ? INVENTORY_STATUS_CONFIG[status] : undefined;
  if (!config) return null;

  return (
    <Badge variant={config.variant} appearance={appearance} size={size} className="rounded-full">
      {config.label}
    </Badge>
  );
}
