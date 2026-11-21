'use client';

import { Card, CardHeader, CardContent } from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';
import { Separator } from '@/shared/components/ui/separator';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/shared/components/ui/tooltip';
import { AlertTriangle, CreditCard, Clock } from 'lucide-react';
import { formatDateTime } from '@/shared/lib/helpers';
import type {
  Order,
  PaymentAttempt,
  PaymentAttemptStatus,
  RefundAttempt,
  RefundAttemptStatus,
} from '@/modules/orders/types';
import {
  formatCents,
  isDuplicateChargeAttempt,
  isRefundInFlight,
  normalizePaymentStatus,
  shortenId,
} from '@/modules/orders/lib/order-exceptions';
import { PaymentStatusBadge } from './payment-status-badge';

type BadgeVariant = 'secondary' | 'info' | 'warning' | 'success' | 'destructive';

const PAYMENT_ATTEMPT_STATUS_CONFIG: Record<PaymentAttemptStatus, { label: string; variant: BadgeVariant }> = {
  CREATED: { label: 'Created', variant: 'secondary' },
  PROCESSING: { label: 'Processing', variant: 'info' },
  PAID: { label: 'Paid', variant: 'success' },
  FAILED: { label: 'Failed', variant: 'destructive' },
  SUPERSEDED: { label: 'Superseded', variant: 'secondary' },
  NEEDS_REVIEW: { label: 'Needs Review', variant: 'destructive' },
};

const REFUND_ATTEMPT_STATUS_CONFIG: Record<RefundAttemptStatus, { label: string; variant: BadgeVariant }> = {
  PENDING: { label: 'Pending', variant: 'info' },
  COMPLETED: { label: 'Completed', variant: 'success' },
  FAILED: { label: 'Failed', variant: 'destructive' },
  UNKNOWN: { label: 'Being Confirmed', variant: 'warning' },
};

const FALLBACK_STATUS = { label: 'Unknown', variant: 'secondary' as const };

/** A Square id shortened for display, with the full value in a tooltip. */
function SquareId({ label, id }: { label: string; id: string | null }) {
  if (!id) return null;
  return (
    <span className="flex items-center gap-1 text-xs text-muted-foreground">
      {label}:
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <span className="font-mono text-foreground cursor-default">{shortenId(id)}</span>
          </TooltipTrigger>
          <TooltipContent>
            <span className="font-mono">{id}</span>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </span>
  );
}

function PaymentAttemptRow({ attempt }: { attempt: PaymentAttempt }) {
  const config = PAYMENT_ATTEMPT_STATUS_CONFIG[attempt.status] ?? FALLBACK_STATUS;
  const duplicate = isDuplicateChargeAttempt(attempt);
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-1.5">
          <Badge variant={config.variant} appearance="light" size="sm" className="rounded-full">
            {config.label}
          </Badge>
          <Badge variant="secondary" appearance="light" size="sm" className="rounded-full">
            {attempt.method === 'LINK' ? 'Payment Link' : 'Card'}
          </Badge>
          {duplicate && (
            <Badge variant="destructive" size="sm" className="rounded-full">
              Duplicate Charge
            </Badge>
          )}
        </div>
        <span className="text-sm font-medium">{formatCents(attempt.amountCents, attempt.currency)}</span>
      </div>
      <div className="flex items-center gap-x-4 gap-y-1 flex-wrap">
        <SquareId label="Payment" id={attempt.squarePaymentId} />
        <SquareId label="Square order" id={attempt.squareOrderId} />
        <span className="flex items-center gap-1 text-xs text-muted-foreground">
          <Clock className="size-3" />
          {formatDateTime(attempt.updatedAt || attempt.createdAt)}
        </span>
      </div>
      {attempt.lastError && (
        <p className="text-xs text-destructive break-words">{attempt.lastError}</p>
      )}
    </div>
  );
}

function RefundAttemptRow({ attempt }: { attempt: RefundAttempt }) {
  const config = REFUND_ATTEMPT_STATUS_CONFIG[attempt.status] ?? FALLBACK_STATUS;
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-1.5">
          <Badge variant={config.variant} appearance="light" size="sm" className="rounded-full">
            {config.label}
          </Badge>
          {attempt.squareStatus && (
            <span className="text-xs text-muted-foreground">Square: {attempt.squareStatus}</span>
          )}
        </div>
        <span className="text-sm font-medium">{formatCents(attempt.amountCents, attempt.currency)}</span>
      </div>
      <div className="flex items-center gap-x-4 gap-y-1 flex-wrap">
        <SquareId label="Refund" id={attempt.squareRefundId} />
        <span className="flex items-center gap-1 text-xs text-muted-foreground">
          <Clock className="size-3" />
          {formatDateTime(attempt.createdAt)}
        </span>
      </div>
      {attempt.reason && (
        <p className="text-xs text-muted-foreground break-words">Reason: {attempt.reason}</p>
      )}
      {isRefundInFlight(attempt) && (
        <p className="text-xs text-muted-foreground">
          Waiting for Square to confirm. This updates automatically — do not refund again.
        </p>
      )}
      {attempt.lastError && (
        <p className="text-xs text-destructive break-words">{attempt.lastError}</p>
      )}
    </div>
  );
}

interface OrderPaymentPanelProps {
  order: Order;
}

/** "Payment & Refunds" card: payment/inventory status plus every Square payment and refund attempt. */
export function OrderPaymentPanel({ order }: OrderPaymentPanelProps) {
  const paymentAttempts = order.paymentAttempts ?? [];
  const refundAttempts = order.refundAttempts ?? [];
  const hasStatus = !!normalizePaymentStatus(order.paymentStatus) || !!order.inventoryStatus;

  return (
    <Card>
      <CardHeader className="py-4">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-2">
            <CreditCard className="size-5 text-muted-foreground" />
            <h2 className="text-lg font-semibold">Payment &amp; Refunds</h2>
          </div>
          {hasStatus && (
            <div className="flex items-center gap-1.5">
              <PaymentStatusBadge status={order.paymentStatus} />

            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {order.inventoryStatus === 'FAILED' && order.inventoryError && (
          <div className="flex items-start gap-2 text-sm text-destructive">
            <AlertTriangle className="size-4 mt-0.5 shrink-0" />
            <span className="break-words">Stock reservation error: {order.inventoryError}</span>
          </div>
        )}

        <div className="space-y-3">
          <h3 className="text-sm font-semibold">Payment attempts</h3>
          {paymentAttempts.length === 0 ? (
            <p className="text-sm text-muted-foreground">No payment attempts recorded.</p>
          ) : (
            paymentAttempts.map((attempt, index) => (
              <div key={attempt.id}>
                {index > 0 && <Separator className="mb-3" />}
                <PaymentAttemptRow attempt={attempt} />
              </div>
            ))
          )}
        </div>

        <Separator />

        <div className="space-y-3">
          <h3 className="text-sm font-semibold">Refund attempts</h3>
          {refundAttempts.length === 0 ? (
            <p className="text-sm text-muted-foreground">No refunds.</p>
          ) : (
            refundAttempts.map((attempt, index) => (
              <div key={attempt.id}>
                {index > 0 && <Separator className="mb-3" />}
                <RefundAttemptRow attempt={attempt} />
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}

interface OrderExceptionsBannerProps {
  order: Order;
}

/**
 * Prominent warnings for the order-detail page: duplicate charges, payments
 * needing review, failed/oversold stock reservations, failed confirmation
 * e-mails, and refunds still being confirmed by Square.
 */
export function OrderExceptionsBanner({ order }: OrderExceptionsBannerProps) {
  const duplicateCharges = (order.paymentAttempts ?? []).filter(isDuplicateChargeAttempt);
  const reviewAttempts = (order.paymentAttempts ?? []).filter(
    (attempt) => attempt.status === 'NEEDS_REVIEW' && !isDuplicateChargeAttempt(attempt),
  );
  const paymentNeedsReview =
    normalizePaymentStatus(order.paymentStatus) === 'NEEDS_REVIEW' || reviewAttempts.length > 0;
  const refundsInFlight = (order.refundAttempts ?? []).filter(isRefundInFlight);

  const problems: { key: string; title: string; detail?: string }[] = [];

  duplicateCharges.forEach((attempt) => {
    problems.push({
      key: `dup-${attempt.id}`,
      title: `Duplicate charge of ${formatCents(attempt.amountCents, attempt.currency)} — refund it from the Square Dashboard`,
      detail: [
        attempt.squarePaymentId ? `Square payment ${attempt.squarePaymentId}` : null,
        attempt.lastError,
      ]
        .filter(Boolean)
        .join(' · '),
    });
  });

  if (paymentNeedsReview && (duplicateCharges.length === 0 || reviewAttempts.length > 0)) {
    problems.push({
      key: 'payment-review',
      title: 'Payment needs review — check this order in the Square Dashboard',
      detail: reviewAttempts.map((attempt) => attempt.lastError).filter(Boolean).join(' · ') || undefined,
    });
  }

  // Only problems someone has to act on. Oversold stock is handled by the
  // existing Missing-items workflow (its own banner), and the confirmation
  // e-mail lives in the Customer card — repeating them here was noise.
  if (order.inventoryStatus === 'FAILED') {
    problems.push({
      key: 'inventory-failed',
      title: 'Stock was not reserved for this paid order — it retries automatically',
      detail: order.inventoryError || undefined,
    });
  }

  if (problems.length === 0 && refundsInFlight.length === 0) return null;

  return (
    <div className="space-y-3">
      {problems.length > 0 && (
        <div className="flex items-start gap-3 rounded-lg border border-red-300 bg-red-50 dark:border-red-800 dark:bg-red-950/30 p-4">
          <AlertTriangle className="size-5 text-red-600 dark:text-red-400 mt-0.5 shrink-0" />
          <div className="flex-1 space-y-2">
            <p className="text-sm font-semibold text-red-800 dark:text-red-300">
              This order needs attention
            </p>
            <ul className="space-y-1.5">
              {problems.map((problem) => (
                <li key={problem.key} className="text-sm text-red-700 dark:text-red-400">
                  <span className="font-medium">{problem.title}</span>
                  {problem.detail && (
                    <span className="block text-xs text-red-600 dark:text-red-500 break-words">
                      {problem.detail}
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {refundsInFlight.length > 0 && (
        <div className="flex items-start gap-3 rounded-lg border border-blue-300 bg-blue-50 dark:border-blue-800 dark:bg-blue-950/30 p-4">
          <Clock className="size-5 text-blue-600 dark:text-blue-400 mt-0.5 shrink-0" />
          <div className="flex-1 space-y-1">
            <p className="text-sm font-semibold text-blue-800 dark:text-blue-300">
              A refund is being confirmed with Square
            </p>
            <p className="text-xs text-blue-600 dark:text-blue-500">
              {refundsInFlight
                .map((attempt) => formatCents(attempt.amountCents, attempt.currency))
                .join(', ')}{' '}
              — this order updates automatically once Square answers. Do not refund again.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
