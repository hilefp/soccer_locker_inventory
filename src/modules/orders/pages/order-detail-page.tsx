'use client';

import { useState, useCallback, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Package,
  User,
  MapPin,
  Truck,
  Clock,
  Building,
  Hash,
  History,
  ChevronRight,
  FileText,
  Receipt,
  Pencil,
  X,
  Check,
  RotateCcw,
  HelpCircle,
} from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Card, CardHeader, CardContent } from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';
import { Separator } from '@/shared/components/ui/separator';
import { ScrollArea } from '@/shared/components/ui/scroll-area';
import { Input } from '@/shared/components/ui/input';
import { Checkbox } from '@/shared/components/ui/checkbox';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/shared/components/ui/tooltip';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select';
import { useDocumentTitle } from '@/shared/hooks/use-document-title';
import { formatDate, timeAgo } from '@/shared/lib/helpers';
import {
  useOrder,
  useOrderStatusHistory,
  useUpdateOrderStatus,
  useUpdateOrder,
  useUpdateShipping,
  useRefundOrder,
} from '@/modules/orders/hooks/use-orders';
import {
  OrderStatusBadge,
  OrderQRCodeCard,
  OrderPackingSlip,
  OrderInvoice,
  OrderNotesPanel,
} from '@/modules/orders/components';
import { ORDER_STATUS_LABELS, OrderStatus } from '@/modules/orders/types';
import type { OrderItem } from '@/modules/orders/types';
import { useAuthStore } from '@/shared/stores/auth-store';

interface RefundItemState {
  selected: boolean;
  quantity: number;
  refundTotal: number;
  refundTax: number;
}

export function OrderDetailPage() {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();

  const [showPackingSlip, setShowPackingSlip] = useState(false);
  const [showInvoice, setShowInvoice] = useState(false);

  // Inline edit state — customer
  const [editingCustomer, setEditingCustomer] = useState(false);
  const [customerDraft, setCustomerDraft] = useState({ shippingName: '', shippingPhone: '' });

  // Inline edit state — address
  const [editingAddress, setEditingAddress] = useState(false);
  const [addressDraft, setAddressDraft] = useState({
    shippingAddress1: '',
    shippingAddress2: '',
    shippingCity: '',
    shippingState: '',
    shippingPostalCode: '',
    shippingCountry: '',
  });

  const { user } = useAuthStore();

  // Refund state
  const [isRefunding, setIsRefunding] = useState(false);
  const [refundShipping, setRefundShipping] = useState(false);
  const [restockItems, setRestockItems] = useState(true);
  const [refundReason, setRefundReason] = useState('');
  const [refundItemStates, setRefundItemStates] = useState<Record<string, RefundItemState>>({});

  const { data: order, isLoading, error } = useOrder(orderId || '');
  const { data: statusHistory } = useOrderStatusHistory(orderId || '');
  const updateStatusMutation = useUpdateOrderStatus();
  const updateOrderMutation = useUpdateOrder();
  const updateShippingMutation = useUpdateShipping();
  const refundMutation = useRefundOrder();

  useDocumentTitle(order ? `Order ${order.orderNumber}` : 'Order Details');

  const handleBack = () => navigate('/orders');

  const handleStatusChange = (newStatus: string) => {
    if (!orderId || !order) return;
    updateStatusMutation.mutate({
      id: orderId,
      status: newStatus as OrderStatus,
      note: `Status changed from ${ORDER_STATUS_LABELS[order.status]} to ${ORDER_STATUS_LABELS[newStatus as OrderStatus]}`,
      changedByUserId: user?.id,
    });
  };

  // Customer edit helpers
  const startEditCustomer = () => {
    setCustomerDraft({
      shippingName: order?.shippingName || '',
      shippingPhone: order?.shippingPhone || '',
    });
    setEditingCustomer(true);
  };

  const saveCustomer = () => {
    if (!orderId) return;
    updateOrderMutation.mutate(
      { id: orderId, data: customerDraft },
      { onSuccess: () => setEditingCustomer(false) }
    );
  };

  // Address edit helpers
  const startEditAddress = () => {
    setAddressDraft({
      shippingAddress1: order?.shippingAddress1 || '',
      shippingAddress2: order?.shippingAddress2 || '',
      shippingCity: order?.shippingCity || '',
      shippingState: order?.shippingState || '',
      shippingPostalCode: order?.shippingPostalCode || '',
      shippingCountry: order?.shippingCountry || '',
    });
    setEditingAddress(true);
  };

  const saveAddress = () => {
    if (!orderId) return;
    updateShippingMutation.mutate(
      { id: orderId, data: addressDraft },
      { onSuccess: () => setEditingAddress(false) }
    );
  };

  // Refund helpers
  const initRefundStates = () => {
    const states: Record<string, RefundItemState> = {};
    order?.items?.forEach((item) => {
      states[item.id] = { selected: false, quantity: 0, refundTotal: 0, refundTax: 0 };
    });
    return states;
  };

  const calculateItemRefund = useCallback((item: OrderItem, qty: number) => {
    const remainingQty = item.quantity - (item.refundedQuantity || 0);
    const clampedQty = Math.max(0, Math.min(qty, remainingQty));
    const refundTotal = clampedQty * Number(item.unitPrice);
    const orderSubtotal = Number(order?.subtotal ?? 0);
    const orderTaxTotal = Number(order?.taxTotal ?? 0);
    // Proportionally allocate the order's actual tax to this item
    const refundTax = orderSubtotal > 0
      ? parseFloat(((refundTotal / orderSubtotal) * orderTaxTotal).toFixed(4))
      : 0;
    return { quantity: clampedQty, refundTotal, refundTax };
  }, [order?.subtotal, order?.taxTotal]);

  const handleStartRefund = () => {
    setRefundItemStates(initRefundStates());
    setRefundShipping(false);
    setRestockItems(true);
    setRefundReason('');
    setIsRefunding(true);
  };

  const handleCancelRefund = () => {
    setIsRefunding(false);
  };

  const handleToggleRefundItem = (itemId: string, checked: boolean) => {
    const item = order?.items?.find((i) => i.id === itemId);
    if (!item) return;
    setRefundItemStates((prev) => {
      if (checked) {
        const remainingQty = item.quantity - (item.refundedQuantity || 0);
        const calc = calculateItemRefund(item, remainingQty);
        return { ...prev, [itemId]: { selected: true, ...calc } };
      }
      return { ...prev, [itemId]: { selected: false, quantity: 0, refundTotal: 0, refundTax: 0 } };
    });
  };

  const handleRefundQtyChange = (itemId: string, qty: number) => {
    const item = order?.items?.find((i) => i.id === itemId);
    if (!item) return;
    setRefundItemStates((prev) => {
      const calc = calculateItemRefund(item, qty);
      return { ...prev, [itemId]: { ...prev[itemId], ...calc } };
    });
  };

  const refundTotals = useMemo(() => {
    let totalItemRefund = 0;
    let totalTaxRefund = 0;
    Object.values(refundItemStates).forEach((s) => {
      if (s.selected) {
        totalItemRefund += s.refundTotal;
        totalTaxRefund += s.refundTax;
      }
    });
    const shippingRefund = refundShipping ? Number(order?.shippingTotal ?? 0) : 0;
    const amountAlreadyRefunded = Number(order?.totalRefunded ?? 0);
    const totalAvailable = Number(order?.total ?? 0) - amountAlreadyRefunded;
    const totalRefund = totalItemRefund + totalTaxRefund + shippingRefund;
    return { totalItemRefund, totalTaxRefund, shippingRefund, totalRefund, amountAlreadyRefunded, totalAvailable };
  }, [refundItemStates, refundShipping, order?.shippingTotal, order?.total, order?.totalRefunded]);

  const handleSubmitRefund = () => {
    if (!orderId || refundTotals.totalRefund <= 0) return;
    const items = Object.entries(refundItemStates)
      .filter(([, s]) => s.selected && s.quantity > 0)
      .map(([orderItemId, s]) => ({ orderItemId, quantity: s.quantity }));

    refundMutation.mutate(
      {
        id: orderId,
        data: {
          items: items.length > 0 ? items : undefined,
          refundShipping: refundShipping || undefined,
          reason: refundReason.trim() || undefined,
          restockItems: restockItems || undefined,
        },
      },
      { onSuccess: () => setIsRefunding(false) }
    );
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
          <Button variant="outline" size="sm" onClick={() => setShowPackingSlip(true)}>
            <FileText className="size-4 mr-2" />
            Packing Slip
          </Button>
          <Button variant="outline" size="sm" onClick={() => setShowInvoice(true)}>
            <Receipt className="size-4 mr-2" />
            Invoice
          </Button>
          {!isRefunding && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleStartRefund}
              className="text-destructive hover:text-destructive"
            >
              <RotateCcw className="size-4 mr-2" />
              Refund Order
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* Customer Info */}
        <Card>
          <CardHeader className="py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <User className="size-5 text-muted-foreground" />
                <h2 className="text-lg font-semibold">Customer</h2>
              </div>
              {!editingCustomer ? (
                <Button variant="ghost" size="sm" onClick={startEditCustomer} className="h-7 px-2">
                  <Pencil className="size-3.5" />
                </Button>
              ) : (
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={saveCustomer}
                    disabled={updateOrderMutation.isPending}
                    className="h-7 px-2 text-green-600 hover:text-green-700"
                  >
                    <Check className="size-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setEditingCustomer(false)}
                    className="h-7 px-2"
                  >
                    <X className="size-3.5" />
                  </Button>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {editingCustomer ? (
              <>
                <div className="space-y-1">
                  <label className="text-xs text-muted-foreground">Name</label>
                  <Input
                    value={customerDraft.shippingName}
                    onChange={(e) =>
                      setCustomerDraft((d) => ({ ...d, shippingName: e.target.value }))
                    }
                    className="h-8 text-sm"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-muted-foreground">Phone</label>
                  <Input
                    value={customerDraft.shippingPhone}
                    onChange={(e) =>
                      setCustomerDraft((d) => ({ ...d, shippingPhone: e.target.value }))
                    }
                    className="h-8 text-sm"
                  />
                </div>
              </>
            ) : (
              <>
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
              </>
            )}
          </CardContent>
        </Card>

        {/* Shipping Address */}
        <Card>
          <CardHeader className="py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MapPin className="size-5 text-muted-foreground" />
                <h2 className="text-lg font-semibold">Shipping Address</h2>
              </div>
              {!editingAddress ? (
                <Button variant="ghost" size="sm" onClick={startEditAddress} className="h-7 px-2">
                  <Pencil className="size-3.5" />
                </Button>
              ) : (
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={saveAddress}
                    disabled={updateShippingMutation.isPending}
                    className="h-7 px-2 text-green-600 hover:text-green-700"
                  >
                    <Check className="size-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setEditingAddress(false)}
                    className="h-7 px-2"
                  >
                    <X className="size-3.5" />
                  </Button>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {editingAddress ? (
              <div className="space-y-2">
                {(
                  [
                    ['Address line 1', 'shippingAddress1'],
                    ['Address line 2', 'shippingAddress2'],
                    ['City', 'shippingCity'],
                    ['State', 'shippingState'],
                    ['Postal code', 'shippingPostalCode'],
                    ['Country', 'shippingCountry'],
                  ] as const
                ).map(([label, key]) => (
                  <div key={key} className="space-y-0.5">
                    <label className="text-xs text-muted-foreground">{label}</label>
                    <Input
                      value={addressDraft[key]}
                      onChange={(e) =>
                        setAddressDraft((d) => ({ ...d, [key]: e.target.value }))
                      }
                      className="h-8 text-sm"
                    />
                  </div>
                ))}
              </div>
            ) : shippingAddress ? (
              <p className="text-sm">{shippingAddress}</p>
            ) : (
              <p className="text-sm text-muted-foreground">No shipping address</p>
            )}
          </CardContent>
        </Card>

        {/* Notes (static customer note) */}
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

        {/* Order Items */}
        <div className="lg:col-span-2 space-y-5">
          <Card>
            <CardHeader className="py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Package className="size-5 text-muted-foreground" />
                  <h2 className="text-lg font-semibold">Order Items</h2>
                  <Badge variant="secondary" size="sm" className="rounded-full">
                    {order.items?.length || 0} items
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {/* Column headers in refund mode */}
              {isRefunding && (
                <div className="grid grid-cols-[auto_1fr_80px_80px_90px_90px] gap-2 items-center px-4 py-2 bg-muted/50 text-xs font-medium text-muted-foreground border-b">
                  <span className="w-5" />
                  <span>Product</span>
                  <span className="text-center">Qty</span>
                  <span className="text-right">Price</span>
                  <span className="text-right">Total</span>
                  <span className="text-right">FL Tax</span>
                </div>
              )}

              <ScrollArea className="max-h-[400px]">
                <div className="divide-y">
                  {order.items?.map((item) => {
                    const rs = refundItemStates[item.id];

                    return (
                      <div key={item.id} className="p-4">
                        {isRefunding ? (
                          <>
                            {/* Refund mode row */}
                            <div className={`grid grid-cols-[auto_1fr_80px_80px_90px_90px] gap-2 items-center ${item.refundedQuantity >= item.quantity ? 'opacity-50' : ''}`}>
                              <Checkbox
                                checked={rs?.selected ?? false}
                                disabled={item.refundedQuantity >= item.quantity}
                                onCheckedChange={(checked) =>
                                  handleToggleRefundItem(item.id, checked === true)
                                }
                              />
                              <div className="flex items-center gap-3 min-w-0">
                                <div className="flex items-center justify-center rounded-lg bg-accent/50 h-12 w-12 shrink-0">
                                  {item.productVariant?.product?.imageUrl ? (
                                    <img
                                      src={item.productVariant.product.imageUrl}
                                      alt={item.name || 'Product'}
                                      className="h-12 w-12 rounded-lg object-cover"
                                    />
                                  ) : (
                                    <Package className="size-5 text-muted-foreground" />
                                  )}
                                </div>
                                <div className="min-w-0">
                                  <p className="text-sm font-medium truncate">
                                    {item.name || item.productVariant?.product?.name || 'Unknown'}
                                  </p>
                                  {item.sku && (
                                    <p className="text-xs text-muted-foreground">{item.sku}</p>
                                  )}
                                  {item.refundedQuantity > 0 && (
                                    <p className="text-xs text-destructive font-medium">
                                      {item.refundedQuantity >= item.quantity
                                        ? 'Fully refunded'
                                        : `${item.refundedQuantity} of ${item.quantity} refunded`}
                                    </p>
                                  )}
                                </div>
                              </div>
                              <div className="text-center text-sm text-muted-foreground">
                                &times; {item.quantity}
                              </div>
                              <div className="text-right text-sm">
                                ${Number(item.unitPrice).toFixed(2)}
                              </div>
                              <div className="text-right text-sm font-medium">
                                ${Number(item.totalPrice).toFixed(2)}
                              </div>
                              <div className="text-right text-sm text-muted-foreground">
                                ${(Number(order.subtotal) > 0
                                  ? (Number(item.totalPrice) / Number(order.subtotal)) * Number(order.taxTotal)
                                  : 0
                                ).toFixed(2)}
                              </div>
                            </div>

                            {/* Editable refund row when checked */}
                            {rs?.selected && (
                              <div className="grid grid-cols-[auto_1fr_80px_80px_90px_90px] gap-2 items-center mt-2">
                                <span className="w-5" />
                                <span />
                                <Input
                                  type="number"
                                  min={0}
                                  max={item.quantity - (item.refundedQuantity || 0)}
                                  value={rs.quantity}
                                  onChange={(e) =>
                                    handleRefundQtyChange(item.id, parseInt(e.target.value) || 0)
                                  }
                                  className="h-8 text-sm text-center"
                                />
                                <span />
                                <Input
                                  type="text"
                                  value={rs.refundTotal.toFixed(2)}
                                  readOnly
                                  className="h-8 text-sm text-right bg-muted/30"
                                  tabIndex={-1}
                                />
                                <Input
                                  type="text"
                                  value={rs.refundTax.toFixed(4)}
                                  readOnly
                                  className="h-8 text-sm text-right bg-muted/30"
                                  tabIndex={-1}
                                />
                              </div>
                            )}
                          </>
                        ) : (
                          /* Normal display mode */
                          <div className={`flex items-center gap-4 ${item.refundedQuantity >= item.quantity ? 'opacity-60' : ''}`}>
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
                              {item.refundedQuantity > 0 && (
                                <p className="text-xs text-destructive font-medium mt-0.5">
                                  {item.refundedQuantity >= item.quantity
                                    ? 'Fully refunded'
                                    : `${item.refundedQuantity} of ${item.quantity} refunded`}
                                </p>
                              )}
                            </div>
                            <div className="text-right">
                              <div className="font-medium">${Number(item.totalPrice).toFixed(2)}</div>
                              <div className="text-sm text-muted-foreground">
                                ${Number(item.unitPrice).toFixed(2)} x {item.quantity}
                              </div>
                              {item.refundedQuantity > 0 && (
                                <div className="text-sm text-destructive font-medium">
                                  -{item.refundedQuantity} (-${(item.refundedQuantity * Number(item.unitPrice)).toFixed(2)})
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}

                  {/* Shipping row in refund mode */}
                  {isRefunding && Number(order.shippingTotal) > 0 && (
                    <div className="p-4">
                      <div className={`grid grid-cols-[auto_1fr_80px_80px_90px_90px] gap-2 items-center ${order.shippingRefunded ? 'opacity-50' : ''}`}>
                        <Checkbox
                          checked={refundShipping}
                          disabled={order.shippingRefunded}
                          onCheckedChange={(checked) => setRefundShipping(checked === true)}
                        />
                        <div className="flex items-center gap-3">
                          <div className="flex items-center justify-center rounded-lg bg-accent/50 h-12 w-12 shrink-0">
                            <Truck className="size-5 text-muted-foreground" />
                          </div>
                          <div>
                            <p className="text-sm font-medium">Shipping</p>
                            {order.shippingRefunded && (
                              <p className="text-xs text-destructive font-medium">Already refunded</p>
                            )}
                          </div>
                        </div>
                        <span />
                        <span />
                        <div className="text-right text-sm font-medium">
                          ${Number(order.shippingTotal).toFixed(2)}
                        </div>
                        <div className="text-right text-sm text-muted-foreground">&ndash;</div>
                      </div>
                      {refundShipping && (
                        <div className="grid grid-cols-[auto_1fr_80px_80px_90px_90px] gap-2 items-center mt-2">
                          <span className="w-5" />
                          <span />
                          <span />
                          <span />
                          <Input
                            type="text"
                            value={Number(order.shippingTotal).toFixed(2)}
                            readOnly
                            className="h-8 text-sm text-right bg-muted/30"
                            tabIndex={-1}
                          />
                          <Input
                            type="text"
                            value="0"
                            readOnly
                            className="h-8 text-sm text-right bg-muted/30"
                            tabIndex={-1}
                          />
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </ScrollArea>
              <Separator />
              <div className="px-4 py-3 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>${Number(order.subtotal).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Tax</span>
                  <span>${Number(order.taxTotal).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">
                    Shipping
                    {order.shippingRefunded && (
                      <span className="text-destructive ml-1">(Refunded)</span>
                    )}
                  </span>
                  <div className="text-right">
                    <span>${Number(order.shippingTotal).toFixed(2)}</span>
                    {order.shippingRefunded && (
                      <div className="text-destructive text-xs font-medium">
                       -${Number(order.shippingTotal).toFixed(2)}
                      </div>
                    )}
                  </div>
                </div>
                <Separator />
                <div className="flex justify-between font-semibold">
                  <span>Total</span>
                  <span>${Number(order.total || 0).toFixed(2)} {order.currency || 'USD'}</span>
                </div>
                {Number(order.totalRefunded) > 0 && (
                  <div className="flex justify-between text-sm text-destructive font-medium">
                    <span>Total Refunded</span>
                    <span>-${Number(order.totalRefunded).toFixed(2)}</span>
                  </div>
                )}

                {/* Refund summary */}
                {isRefunding && (
                  <div className="space-y-3 pt-3">
                    <Separator />
                    <div className="flex items-center justify-between text-sm">
                      <span>Restock refunded items:</span>
                      <Checkbox
                        checked={restockItems}
                        onCheckedChange={(checked) => setRestockItems(checked === true)}
                      />
                    </div>
                    <Separator />
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Amount already refunded:</span>
                      <span className="font-medium">-${refundTotals.amountAlreadyRefunded.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Total available to refund:</span>
                      <span className="font-medium">${refundTotals.totalAvailable.toFixed(2)}</span>
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span className="flex items-center gap-1.5 text-sm font-medium">
                              <HelpCircle className="size-3.5 text-muted-foreground" />
                              Refund amount:
                            </span>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Items + tax + shipping (if selected)</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                      <span className="text-lg font-bold">
                        ${Math.min(refundTotals.totalRefund, refundTotals.totalAvailable).toFixed(2)}
                      </span>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-sm text-muted-foreground">Reason for refund (optional):</label>
                      <Input
                        value={refundReason}
                        onChange={(e) => setRefundReason(e.target.value)}
                        placeholder="Enter reason..."
                        className="h-9 text-sm"
                      />
                    </div>
                    <div className="flex items-center gap-2 justify-end pt-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleCancelRefund}
                        disabled={refundMutation.isPending}
                      >
                        Cancel
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-destructive hover:text-destructive"
                        onClick={handleSubmitRefund}
                        disabled={
                          refundMutation.isPending ||
                          refundTotals.totalRefund <= 0 ||
                          parseFloat(refundTotals.totalRefund.toFixed(2)) > parseFloat(refundTotals.totalAvailable.toFixed(2))
                        }
                      >
                        {refundMutation.isPending ? (
                          <>
                            <div className="animate-spin rounded-full h-3.5 w-3.5 border-b-2 border-white mr-2 " />
                            Processing...
                          </>
                        ) : (
                          <>
                            <RotateCcw className="size-4 mr-2" />
                            Process Refund (${Math.min(refundTotals.totalRefund, refundTotals.totalAvailable).toFixed(2)})
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Status History */}
          <Card>
            <CardHeader className="py-4">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <History className="size-5 text-muted-foreground" />
                  <h2 className="text-lg font-semibold">Status History</h2>
                </div>
                <Select
                  value={order.status}
                  onValueChange={handleStatusChange}
                  disabled={updateStatusMutation.isPending}
                >
                  <SelectTrigger className="w-40 h-8 text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {(Object.keys(ORDER_STATUS_LABELS) as OrderStatus[]).map((status) => (
                      <SelectItem key={status} value={status}>
                        {ORDER_STATUS_LABELS[status]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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

          {/* Order Notes Panel */}
          <OrderNotesPanel orderId={order.id} />


          {/* Club Info */}
          {/* {order.club && (
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
          )} */}
        </div>
      </div>

      {/* Packing Slip Sheet */}
      <OrderPackingSlip order={order} open={showPackingSlip} onOpenChange={setShowPackingSlip} />

      {/* Invoice Sheet */}
      <OrderInvoice order={order} open={showInvoice} onOpenChange={setShowInvoice} />
    </div>
  );
}
