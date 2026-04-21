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
import { Truck, Package, ExternalLink, Clock, CheckCircle, AlertTriangle, Tag } from 'lucide-react';
import { useOrderShipments } from '@/modules/orders/hooks/use-orders';
import { formatDateTime } from '@/shared/lib/helpers';
import type { ShipmentStatus } from '@/modules/orders/types';

interface OrderShipmentsPanelProps {
  orderId: string;
}

const SHIPMENT_STATUS_CONFIG: Record<ShipmentStatus, { label: string; variant: 'secondary' | 'info' | 'warning' | 'success' | 'destructive' }> = {
  PENDING: { label: 'Pending', variant: 'secondary' },
  LABEL_CREATED: { label: 'Label Created', variant: 'info' },
  IN_TRANSIT: { label: 'In Transit', variant: 'warning' },
  DELIVERED: { label: 'Delivered', variant: 'success' },
  FAILED: { label: 'Failed', variant: 'destructive' },
};

export function OrderShipmentsPanel({ orderId }: OrderShipmentsPanelProps) {
  const { data: shipments, isLoading } = useOrderShipments(orderId);

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="py-4">
          <div className="flex items-center gap-2">
            <Truck className="size-5 text-muted-foreground" />
            <h2 className="text-lg font-semibold">Shipments</h2>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-4">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!shipments || shipments.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader className="py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Truck className="size-5 text-muted-foreground" />
            <h2 className="text-lg font-semibold">Shipments</h2>
          </div>
          <Badge variant="secondary" size="sm" className="rounded-full">
            {shipments.length}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {shipments.map((shipment, index) => {
          const statusConfig = SHIPMENT_STATUS_CONFIG[shipment.status];
          return (
            <div key={shipment.id}>
              {index > 0 && <Separator className="mb-4" />}
              <div className="space-y-3">
                {/* Shipment header */}
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold">
                    Shipment #{shipment.shipmentNumber}
                  </span>
                  <Badge variant={statusConfig.variant} size="sm" appearance="light" className="rounded-full">
                    {statusConfig.label}
                  </Badge>
                </div>

                {/* Tracking info */}
                {shipment.trackingNumber && (
                  <div className="flex items-center gap-2 text-sm">
                    <Tag className="size-3.5 text-muted-foreground shrink-0" />
                    <span className="text-muted-foreground">Tracking:</span>
                    {shipment.trackingUrl ? (
                      <a
                        href={shipment.trackingUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline flex items-center gap-1"
                      >
                        {shipment.trackingNumber}
                        <ExternalLink className="size-3" />
                      </a>
                    ) : (
                      <span className="font-medium">{shipment.trackingNumber}</span>
                    )}
                  </div>
                )}

                {/* Carrier */}
                {shipment.carrier && (
                  <div className="flex items-center gap-2 text-sm">
                    <Truck className="size-3.5 text-muted-foreground shrink-0" />
                    <span className="text-muted-foreground">Carrier:</span>
                    <span className="font-medium capitalize">{shipment.carrier}</span>
                  </div>
                )}

                {/* Label URL */}
                {shipment.labelUrl && (
                  <div className="flex items-center gap-2 text-sm">
                    <ExternalLink className="size-3.5 text-muted-foreground shrink-0" />
                    <a
                      href={shipment.labelUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                    >
                      View Shipping Label
                    </a>
                  </div>
                )}

                {/* Items in shipment */}
                {shipment.items && shipment.items.length > 0 && (
                  <div className="space-y-1.5">
                    <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                      Items
                    </span>
                    {shipment.items.map((shipmentItem) => {
                      const orderItem = shipmentItem.orderItem;
                      const itemName = orderItem?.name
                        || orderItem?.productVariant?.product?.name
                        || 'Unknown Item';
                      return (
                        <div key={shipmentItem.id} className="flex items-center gap-2 text-sm">
                          <Package className="size-3.5 text-muted-foreground shrink-0" />
                          <span className="truncate">{itemName}</span>
                          <span className="text-muted-foreground shrink-0">x{shipmentItem.quantity}</span>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Timestamps */}
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  {shipment.shippedAt && (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger className="flex items-center gap-1">
                          <Truck className="size-3" />
                          Shipped {formatDateTime(new Date(shipment.shippedAt))}
                        </TooltipTrigger>
                        <TooltipContent>Shipped date</TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  )}
                  {shipment.deliveredAt && (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger className="flex items-center gap-1">
                          <CheckCircle className="size-3" />
                          Delivered {formatDateTime(new Date(shipment.deliveredAt))}
                        </TooltipTrigger>
                        <TooltipContent>Delivery date</TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  )}
                </div>

                {/* Stock deduction indicator */}
                {shipment.status === 'DELIVERED' && (
                  <div className="flex items-center gap-1.5 text-xs">
                    {shipment.stockDeducted ? (
                      <span className="flex items-center gap-1 text-green-600">
                        <CheckCircle className="size-3" />
                        Stock deducted
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-orange-600">
                        <AlertTriangle className="size-3" />
                        Stock pending deduction
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
