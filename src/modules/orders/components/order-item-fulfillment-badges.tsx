import type { OrderItem } from '../types';
import { getItemFulfillment } from '../lib/item-fulfillment';
import { cn } from '@/shared/lib/utils';

interface OrderItemFulfillmentBadgesProps {
  item: Pick<
    OrderItem,
    | 'quantity'
    | 'refundedQuantity'
    | 'missingQuantity'
    | 'shippedQuantity'
    | 'deliveredQuantity'
  >;
  className?: string;
}

/**
 * Compact per-item fulfillment status lines (delivered / in transit /
 * missing / refunded). Zero buckets are hidden; renders nothing when the
 * item has no shipping, missing, or refund activity.
 */
export function OrderItemFulfillmentBadges({ item, className }: OrderItemFulfillmentBadgesProps) {
  const f = getItemFulfillment(item);

  const lines: Array<{ key: string; className: string; text: string }> = [];

  if (f.delivered > 0) {
    lines.push({
      key: 'delivered',
      className: 'text-green-600',
      text: f.delivered >= f.quantity ? 'Delivered' : `${f.delivered} of ${f.quantity} delivered`,
    });
  }
  if (f.inTransit > 0) {
    lines.push({
      key: 'in-transit',
      className: 'text-blue-600',
      text: f.inTransit >= f.quantity ? 'In transit' : `${f.inTransit} of ${f.quantity} in transit`,
    });
  }
  if (f.missing > 0) {
    lines.push({
      key: 'missing',
      className: 'text-orange-600',
      text: f.missing >= f.quantity ? 'All missing' : `${f.missing} of ${f.quantity} missing`,
    });
  }
  if (f.refunded > 0) {
    lines.push({
      key: 'refunded',
      className: 'text-destructive',
      text: f.refunded >= f.quantity ? 'Fully refunded' : `${f.refunded} of ${f.quantity} refunded`,
    });
  }

  if (lines.length === 0) return null;

  return (
    <div className={className}>
      {lines.map((line) => (
        <p key={line.key} className={cn('text-xs font-medium', line.className)}>
          {line.text}
        </p>
      ))}
    </div>
  );
}
