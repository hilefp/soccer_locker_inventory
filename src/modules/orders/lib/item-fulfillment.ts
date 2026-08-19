import type { OrderItem } from '../types';

export interface ItemFulfillment {
  quantity: number;
  // Units confirmed delivered (from DELIVERED shipments)
  delivered: number;
  // Units shipped but not yet delivered
  inTransit: number;
  // Units marked as missing (awaiting inventory)
  missing: number;
  // Units refunded
  refunded: number;
  // Units not yet shipped, missing, or refunded
  pending: number;
}

/**
 * Derives per-item fulfillment buckets from the order item counters.
 * Contract: shippedQuantity is cumulative and includes delivered units;
 * deliveredQuantity is only present on the order detail endpoint.
 */
export function getItemFulfillment(
  item: Pick<
    OrderItem,
    | 'quantity'
    | 'refundedQuantity'
    | 'missingQuantity'
    | 'shippedQuantity'
    | 'deliveredQuantity'
  >,
): ItemFulfillment {
  const quantity = item.quantity || 0;
  const refunded = item.refundedQuantity || 0;
  const missing = item.missingQuantity || 0;
  const shipped = item.shippedQuantity || 0;
  const delivered = Math.min(item.deliveredQuantity || 0, shipped);

  return {
    quantity,
    delivered,
    inTransit: Math.max(0, shipped - delivered),
    missing,
    refunded,
    pending: Math.max(0, quantity - shipped - missing - refunded),
  };
}
