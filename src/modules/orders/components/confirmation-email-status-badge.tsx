'use client';

import { Badge } from '@/shared/components/ui/badge';
import type { ConfirmationEmailStatus } from '@/modules/orders/types';

type BadgeVariant = 'success' | 'warning' | 'destructive' | 'secondary' | 'primary' | 'info';

const CONFIRMATION_EMAIL_STATUS_CONFIG: Record<ConfirmationEmailStatus, { label: string; variant: BadgeVariant }> = {
  PENDING: { label: 'Pending', variant: 'secondary' },
  SENDING: { label: 'Sending', variant: 'info' },
  SENT: { label: 'Sent', variant: 'success' },
  FAILED: { label: 'Failed', variant: 'destructive' },
};

interface ConfirmationEmailStatusBadgeProps {
  status: ConfirmationEmailStatus | null | undefined;
  size?: 'sm' | 'md' | 'lg';
}

/** Order confirmation e-mail delivery status. null (legacy order) renders nothing. */
export function ConfirmationEmailStatusBadge({ status, size = 'sm' }: ConfirmationEmailStatusBadgeProps) {
  const config = status ? CONFIRMATION_EMAIL_STATUS_CONFIG[status] : undefined;
  if (!config) return null;

  return (
    <Badge variant={config.variant} appearance="light" size={size} className="rounded-full">
      {config.label}
    </Badge>
  );
}
