'use client';

import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Package,
  User,
  MapPin,
  Truck,
  Clock,
  Calendar,
  Building,
  Hash,
  CreditCard,
  History,
  ChevronRight,
  FileText,
  Receipt,
} from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Card, CardHeader, CardContent } from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';
import { Separator } from '@/shared/components/ui/separator';
import { ScrollArea } from '@/shared/components/ui/scroll-area';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select';
import { useDocumentTitle } from '@/shared/hooks/use-document-title';
import { formatDate, timeAgo } from '@/shared/lib/helpers';
import { useOrder, useOrderStatusHistory, useUpdateOrderStatus } from '@/modules/orders/hooks/use-orders';
import { OrderStatusBadge, OrderQRCodeCard, OrderPackingSlip, OrderInvoice } from '@/modules/orders/components';
import { ORDER_STATUS_FLOW, ORDER_STATUS_LABELS, OrderStatus } from '@/modules/orders/types';

export function OrderDetailPage() {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();

  const [showPackingSlip, setShowPackingSlip] = useState(false);
  const [showInvoice, setShowInvoice] = useState(false);

  const { data: order, isLoading, error } = useOrder(orderId || '');
  const { data: statusHistory } = useOrderStatusHistory(orderId || '');
  const updateStatusMutation = useUpdateOrderStatus();

  useDocumentTitle(order ? `Order ${order.orderNumber}` : 'Order Details');

  const handleBack = () => {
    navigate('/orders');
  };

  const handleStatusChange = (newStatus: string) => {
    if (orderId) {
      updateStatusMutation.mutate({
        id: orderId,
        status: newStatus as OrderStatus,
      });
    }
  };

  if (isLoading) {
    return (
      <div className="container-fluid flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="container-fluid space-y-5">
        <Button variant="outline" onClick={handleBack}>
          <ArrowLeft className="size-4 mr-2" />
          Back to Orders
        </Button>
        <Card>
          <CardContent className="flex items-center justify-center h-48">
            <span className="text-muted-foreground">
              {error?.message || 'Order not found'}
            </span>
          </CardContent>
        </Card>
      </div>
    );
  }

  const validTransitions = ORDER_STATUS_FLOW[order.status];
  const shippingAddress = [
    order.shippingAddress1,
    order.shippingAddress2,
    order.shippingCity,
    order.shippingState,
    order.shippingPostalCode,
    order.shippingCountry,
  ]
    .filter(Boolean)
    .join(', ');

  return (
    <div className="container-fluid space-y-5 lg:space-y-7">
      {/* Header */}
      <div className="flex items-center flex-wrap gap-4 justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" onClick={handleBack}>
            <ArrowLeft className="size-4" />
          </Button>
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-bold text-foreground">{order.orderNumber}</h1>
              <OrderStatusBadge status={order.status} size="md" />
            </div>
            <span className="text-sm text-muted-foreground">
              Created {timeAgo(order.createdAt)}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Packing Slip & Invoice Buttons */}
          <Button variant="outline" size="sm" onClick={() => setShowPackingSlip(true)}>
            <FileText className="size-4 mr-2" />
            Packing Slip
          </Button>
          <Button variant="outline" size="sm" onClick={() => setShowInvoice(true)}>
            <Receipt className="size-4 mr-2" />
            Invoice
          </Button>

          {/* Status Change */}
          {validTransitions.length > 0 && (
            <>
              <span className="text-sm text-muted-foreground">Move to:</span>
              <Select onValueChange={handleStatusChange} disabled={updateStatusMutation.isPending}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  {validTransitions.map((status) => (
                    <SelectItem key={status} value={status}>
                      {ORDER_STATUS_LABELS[status]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Main Content */}

        {/* Customer Info */}
          <Card>
            <CardHeader className="py-4">
              <div className="flex items-center gap-2">
                <User className="size-5 text-muted-foreground" />
                <h2 className="text-lg font-semibold">Customer</h2>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <span className="text-sm text-muted-foreground">Name</span>
                <p className="font-medium">{order.shippingName || 'N/A'}</p>
              </div>
              {order.customerUser?.email && (
                <div>
                  <span className="text-sm text-muted-foreground">Email</span>
                  <p className="font-medium">{order.customerUser.email}</p>
                </div>
              )}
              {order.shippingPhone && (
                <div>
                  <span className="text-sm text-muted-foreground">Phone</span>
                  <p className="font-medium">{order.shippingPhone}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Shipping Address */}
          <Card>
            <CardHeader className="py-4">
              <div className="flex items-center gap-2">
                <MapPin className="size-5 text-muted-foreground" />
                <h2 className="text-lg font-semibold">Shipping Address</h2>
              </div>
            </CardHeader>
            <CardContent>
              {shippingAddress ? (
                <p className="text-sm">{shippingAddress}</p>
              ) : (
                <p className="text-sm text-muted-foreground">No shipping address</p>
              )}
            </CardContent>
          </Card>

          {/* Notes */}
          {order.notes && (
            <Card>
              <CardHeader className="py-4">
                <h2 className="text-lg font-semibold">Notes</h2>
              </CardHeader>
              <CardContent>
                <p className="text-sm whitespace-pre-wrap">{order.notes}</p>
              </CardContent>
            </Card>
          )}


        <div className="lg:col-span-2 space-y-5">
          {/* Order Items */}
          <Card>
            <CardHeader className="py-4">
              <div className="flex items-center gap-2">
                <Package className="size-5 text-muted-foreground" />
                <h2 className="text-lg font-semibold">Order Items</h2>
                <Badge variant="secondary" size="sm" className="rounded-full">
                  {order.items?.length || 0} items
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="max-h-[400px]">
                <div className="divide-y">
                  {order.items?.map((item) => (
                    <div key={item.id} className="flex items-center gap-4 p-4">
                      <div className="flex items-center justify-center rounded-lg bg-accent/50 h-16 w-16 shrink-0">
                        {item.productVariant?.product?.imageUrl ? (
                          <img
                            src={item.productVariant.product.imageUrl}
                            alt={item.name || 'Product'}
                            className="h-16 w-16 rounded-lg object-cover"
                          />
                        ) : (
                          <Package className="size-6 text-muted-foreground" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-foreground truncate">
                            {item.name || item.productVariant?.product?.name || 'Unknown Product'}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          {item.sku && (
                            <span className="flex items-center gap-1">
                              <Hash className="size-3" />
                              {item.sku}
                            </span>
                          )}
                          {item.attributes && Object.keys(item.attributes).length > 0 && (
                            <span>
                              {Object.entries(item.attributes)
                                .map(([key, value]) => `${key}: ${value}`)
                                .join(' | ')}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">${Number(item.totalPrice).toFixed(2)}</div>
                        <div className="text-sm text-muted-foreground">
                          ${Number(item.unitPrice).toFixed(2)} x {item.quantity}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Status History */}
          <Card>
            <CardHeader className="py-4">
              <div className="flex items-center gap-2">
                <History className="size-5 text-muted-foreground" />
                <h2 className="text-lg font-semibold">Status History</h2>
              </div>
            </CardHeader>
            <CardContent>
              {statusHistory && statusHistory.length > 0 ? (
                <div className="space-y-4">
                  {statusHistory.map((history, index) => (
                    <div key={history.id} className="flex items-start gap-3">
                      <div className="flex flex-col items-center">
                        <div className="flex items-center justify-center rounded-full bg-primary/10 h-8 w-8">
                          <ChevronRight className="size-4 text-primary" />
                        </div>
                        {index < statusHistory.length - 1 && (
                          <div className="w-0.5 h-8 bg-border mt-1" />
                        )}
                      </div>
                      <div className="flex-1 pb-4">
                        <div className="flex items-center gap-2">
                          <OrderStatusBadge status={history.fromStatus} size="sm" />
                          <ChevronRight className="size-4 text-muted-foreground" />
                          <OrderStatusBadge status={history.toStatus} size="sm" />
                        </div>
                        {history.note && (
                          <p className="text-sm text-muted-foreground mt-1">{history.note}</p>
                        )}
                        <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                          <Clock className="size-3" />
                          {formatDate(new Date(history.createdAt))}
                          {history.changedByUser && (
                            <span>by {history.changedByUser.email}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No status changes yet</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-5">
          {/* QR Code Card */}
          <OrderQRCodeCard order={order} />

          {/* Order Summary */}
          <Card>
            <CardHeader className="py-4">
              <div className="flex items-center gap-2">
                <CreditCard className="size-5 text-muted-foreground" />
                <h2 className="text-lg font-semibold">Order Summary</h2>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span>${Number(order.subtotal).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Tax</span>
                <span>${Number(order.taxTotal).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Shipping</span>
                <span>${Number(order.shippingTotal).toFixed(2)}</span>
              </div>
              <Separator />
              <div className="flex justify-between font-semibold">
                <span>Total</span>
                <span>
                  ${Number(order.total || 0).toFixed(2)} {order.currency || 'USD'}
                </span>
              </div>
            </CardContent>
          </Card>


          {/* Shipping Info */}
          {(order.carrier || order.trackingNumber) && (
            <Card>
              <CardHeader className="py-4">
                <div className="flex items-center gap-2">
                  <Truck className="size-5 text-muted-foreground" />
                  <h2 className="text-lg font-semibold">Shipping Info</h2>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {order.carrier && (
                  <div>
                    <span className="text-sm text-muted-foreground">Carrier</span>
                    <p className="font-medium">{order.carrier}</p>
                  </div>
                )}
                {order.trackingNumber && (
                  <div>
                    <span className="text-sm text-muted-foreground">Tracking Number</span>
                    <p className="font-medium">{order.trackingNumber}</p>
                  </div>
                )}
                {order.shippedAt && (
                  <div>
                    <span className="text-sm text-muted-foreground">Shipped At</span>
                    <p className="font-medium">{formatDate(new Date(order.shippedAt))}</p>
                  </div>
                )}
                {order.deliveredAt && (
                  <div>
                    <span className="text-sm text-muted-foreground">Delivered At</span>
                    <p className="font-medium">{formatDate(new Date(order.deliveredAt))}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Club Info */}
          {order.club && (
            <Card>
              <CardHeader className="py-4">
                <div className="flex items-center gap-2">
                  <Building className="size-5 text-muted-foreground" />
                  <h2 className="text-lg font-semibold">Club</h2>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3">
                  {order.club.logoUrl ? (
                    <img
                      src={order.club.logoUrl}
                      alt={order.club.name}
                      className="h-10 w-10 rounded-full object-cover"
                    />
                  ) : (
                    <div className="flex items-center justify-center rounded-full bg-accent/50 h-10 w-10">
                      <Building className="size-5 text-muted-foreground" />
                    </div>
                  )}
                  <span className="font-medium">{order.club.name}</span>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Dates
          <Card>
            <CardHeader className="py-4">
              <div className="flex items-center gap-2">
                <Calendar className="size-5 text-muted-foreground" />
                <h2 className="text-lg font-semibold">Dates</h2>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <span className="text-sm text-muted-foreground">Created</span>
                <p className="font-medium">{formatDate(new Date(order.createdAt))}</p>
              </div>
              <div>
                <span className="text-sm text-muted-foreground">Last Updated</span>
                <p className="font-medium">{formatDate(new Date(order.updatedAt))}</p>
              </div>
              {order.printedAt && (
                <div>
                  <span className="text-sm text-muted-foreground">Printed</span>
                  <p className="font-medium">{formatDate(new Date(order.printedAt))}</p>
                </div>
              )}
              {order.pickedAt && (
                <div>
                  <span className="text-sm text-muted-foreground">Picked</span>
                  <p className="font-medium">{formatDate(new Date(order.pickedAt))}</p>
                </div>
              )}
              {order.processedAt && (
                <div>
                  <span className="text-sm text-muted-foreground">Processed</span>
                  <p className="font-medium">{formatDate(new Date(order.processedAt))}</p>
                </div>
              )}
            </CardContent>
          </Card> */}

        </div>
      </div>

      {/* Packing Slip Sheet */}
      <OrderPackingSlip order={order} open={showPackingSlip} onOpenChange={setShowPackingSlip} />

      {/* Invoice Sheet */}
      <OrderInvoice order={order} open={showInvoice} onOpenChange={setShowInvoice} />
    </div>
  );
}
