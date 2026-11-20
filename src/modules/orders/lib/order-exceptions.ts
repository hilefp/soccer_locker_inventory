import type {
  LegacyPaymentStatus,
  Order,
  PaymentAttempt,
  PaymentStatus,
  RefundAttempt,
} from '@/modules/orders/types';

const LEGACY_PAYMENT_STATUS_MAP: Record<LegacyPaymentStatus, PaymentStatus> = {
  COMPLETED: 'PAID',
  ATTEMPTING: 'PROCESSING',
  DECLINED: 'FAILED',
};

/** Maps legacy payment status values onto the current ones. null = legacy/unknown. */
export function normalizePaymentStatus(
  status: PaymentStatus | LegacyPaymentStatus | string | null | undefined,
): PaymentStatus | null {
  if (!status) return null;
  if (status in LEGACY_PAYMENT_STATUS_MAP) {
    return LEGACY_PAYMENT_STATUS_MAP[status as LegacyPaymentStatus];
  }
  return status as PaymentStatus;
}

/** A second real Square charge for the same order; staff must refund it from the Square Dashboard. */
export function isDuplicateChargeAttempt(attempt: PaymentAttempt): boolean {
  return attempt.status === 'NEEDS_REVIEW' && !!attempt.lastError?.startsWith('DUPLICATE CHARGE');
}

/** A refund Square has not confirmed yet — staff must not refund again while it resolves. */
export function isRefundInFlight(attempt: RefundAttempt): boolean {
  return attempt.status === 'PENDING' || attempt.status === 'UNKNOWN';
}

export function hasRefundInFlight(order: Pick<Order, 'refundAttempts'> | undefined): boolean {
  return !!order?.refundAttempts?.some(isRefundInFlight);
}

/** Automatic e-mail retries the backend makes before giving up. */
export const EMAIL_MAX_ATTEMPTS = 5;

/** A confirmation e-mail the backend has stopped retrying — needs a manual resend. */
export function isEmailGivenUp(
  order: Pick<Order, 'confirmationEmailStatus' | 'confirmationEmailAttempts'>,
): boolean {
  return (
    order.confirmationEmailStatus === 'FAILED' &&
    (order.confirmationEmailAttempts ?? 0) >= EMAIL_MAX_ATTEMPTS
  );
}

/**
 * Short labels for what on an order needs someone to act. Mirrors the
 * backend's `hasException=true` filter: payment NEEDS_REVIEW, stock
 * reservation FAILED, or a confirmation e-mail that exhausted its retries.
 * Oversold is NOT an exception: selling without stock is allowed by policy
 * and handled by the Missing-items workflow.
 */
export function getOrderExceptions(
  order: Pick<
    Order,
    'paymentStatus' | 'inventoryStatus' | 'confirmationEmailStatus' | 'confirmationEmailAttempts'
  >,
): string[] {
  const exceptions: string[] = [];
  if (normalizePaymentStatus(order.paymentStatus) === 'NEEDS_REVIEW') {
    exceptions.push('Payment needs review');
  }
  if (order.inventoryStatus === 'FAILED') exceptions.push('Stock not reserved');
  if (isEmailGivenUp(order)) exceptions.push('Confirmation e-mail not sent');
  return exceptions;
}

/** Formats an integer amount in cents, e.g. 12345 + 'USD' -> "$123.45 USD". */
export function formatCents(amountCents: number, currency?: string | null): string {
  const amount = (Number(amountCents) || 0) / 100;
  return `$${amount.toFixed(2)} ${currency || 'USD'}`;
}

/** Shortens a long external id (Square ids) for display: "abcd…wxyz". */
export function shortenId(id: string | null | undefined, keep = 6): string {
  if (!id) return '—';
  if (id.length <= keep * 2 + 1) return id;
  return `${id.slice(0, keep)}…${id.slice(-keep)}`;
}
