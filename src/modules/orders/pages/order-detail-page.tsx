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
  History,
  ChevronRight,
  FileText,
  Receipt,
  Pencil,
  X,
  Check,
  RotateCcw,
  HelpCircle,
  AlertTriangle,
  Info,
  ArrowLeftRight,
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogBody,
} from '@/shared/components/ui/dialog';
import { useDocumentTitle } from '@/shared/hooks/use-document-title';
import { formatDate, formatDateTime, timeAgo } from '@/shared/lib/helpers';
import {
  useOrder,
  useOrderStatusHistory,
  useUpdateOrderStatus,
  useUpdateOrder,
  useUpdateShipping,
  useRefundOrder,
  useMarkMissing,
  useResolveMissing,
  useSwapOrderItemVariant,
} from '@/modules/orders/hooks/use-orders';
import {
  OrderStatusBadge,
  OrderQRCodeCard,
  OrderPackingSlip,
  OrderInvoice,
  OrderNotesPanel,
  OrderShipmentsPanel,
} from '@/modules/orders/components';
import { ORDER_STATUS_LABELS, OrderStatus } from '@/modules/orders/types';
import type { OrderItem } from '@/modules/orders/types';
import { useAuthStore } from '@/shared/stores/auth-store';
import { extractSize } from '@/modules/orders/lib/extract-size';
import { useProduct } from '@/modules/products/hooks/use-products';

interface RefundItemState {
  selected: boolean;
  quantity: number;
  refundTotal: number;
  refundTax: number;
}

interface RefundPackageState {
  selected: boolean;
  amount: number | '';
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
  const [refundRushFee, setRefundRushFee] = useState(false);

  const [refundReason, setRefundReason] = useState('');
  const [refundItemStates, setRefundItemStates] = useState<Record<string, RefundItemState>>({});
  const [refundPackageStates, setRefundPackageStates] = useState<Record<string, RefundPackageState>>({});

  const { data: order, isLoading, error } = useOrder(orderId || '');
  const { data: statusHistory } = useOrderStatusHistory(orderId || '');
  const updateStatusMutation = useUpdateOrderStatus();
  const updateOrderMutation = useUpdateOrder();
  const updateShippingMutation = useUpdateShipping();
  const refundMutation = useRefundOrder();
  const markMissingMutation = useMarkMissing();
  const resolveMissingMutation = useResolveMissing();
  const swapVariantMutation = useSwapOrderItemVariant();

  // Swap variant state
  const [swapItem, setSwapItem] = useState<OrderItem | null>(null);
  const [selectedVariantId, setSelectedVariantId] = useState<string>('');
  const swapProductId = swapItem?.productVariant?.product?.id || '';
  const { data: swapProduct, isLoading: isLoadingVariants } = useProduct(swapProductId);
  const siblingVariants = swapProduct?.variants;
  const canSwapVariant = order && !['DELIVERED', 'REFUND', 'FAILED'].includes(order.status);

  const handleOpenSwap = (item: OrderItem) => {
    setSwapItem(item);
    setSelectedVariantId('');
  };

  const handleConfirmSwap = () => {
    if (!orderId || !swapItem || !selectedVariantId) return;
    swapVariantMutation.mutate(
      { orderId, itemId: swapItem.id, newProductVariantId: selectedVariantId },
      { onSuccess: () => setSwapItem(null) }
    );
  };

  // Missing products state
  const [isMissingMode, setIsMissingMode] = useState(false);
  const [missingItemStates, setMissingItemStates] = useState<Record<string, { selected: boolean; quantity: number }>>({});
  const [missingReason, setMissingReason] = useState('');

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
    const pkgStates: Record<string, RefundPackageState> = {};
    order?.items?.forEach((item) => {
      states[item.id] = { selected: false, quantity: 0, refundTotal: 0, refundTax: 0 };
      if (item.packageInstanceId && !pkgStates[item.packageInstanceId]) {
        pkgStates[item.packageInstanceId] = { selected: false, amount: '' };
      }
    });
    setRefundPackageStates(pkgStates);
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
    setRefundRushFee(false);
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

  const handleToggleRefundPackage = (packageInstanceId: string, checked: boolean, packagePrice: number) => {
    setRefundPackageStates((prev) => ({
      ...prev,
      [packageInstanceId]: { ...prev[packageInstanceId], selected: checked, amount: checked ? packagePrice : '' },
    }));
    // Auto-select / deselect all items belonging to this package
    const pkgItems = order?.items?.filter((i) => i.packageInstanceId === packageInstanceId) ?? [];
    setRefundItemStates((prev) => {
      const next = { ...prev };
      pkgItems.forEach((item) => {
        if (checked) {
          const remaining = item.quantity - (item.refundedQuantity || 0);
          next[item.id] = { selected: remaining > 0, quantity: remaining, refundTotal: 0, refundTax: 0 };
        } else {
          next[item.id] = { selected: false, quantity: 0, refundTotal: 0, refundTax: 0 };
        }
      });
      return next;
    });
  };

  const handleRefundPackageAmountChange = (packageInstanceId: string, value: string) => {
    const amount: number | '' = value === '' ? '' : Math.max(0, parseFloat(value) || 0);
    setRefundPackageStates((prev) => ({
      ...prev,
      [packageInstanceId]: { ...prev[packageInstanceId], amount },
    }));
  };

  type GroupedItem =
    | { type: 'standalone'; item: OrderItem }
    | {
        type: 'package';
        packageInstanceId: string;
        packageName: string;
        packagePrice: number;
        packageImageUrl?: string;
        items: OrderItem[];
      };

  const groupedOrderItems = useMemo<GroupedItem[]>(() => {
    if (!order?.items) return [];
    const result: GroupedItem[] = [];
    const packageIndexMap = new Map<string, number>();

    order.items.forEach((item) => {
      if (item.packageInstanceId) {
        const idx = packageIndexMap.get(item.packageInstanceId);
        if (idx !== undefined) {
          (result[idx] as Extract<GroupedItem, { type: 'package' }>).items.push(item);
        } else {
          packageIndexMap.set(item.packageInstanceId, result.length);
          result.push({
            type: 'package',
            packageInstanceId: item.packageInstanceId,
            packageName: item.packageName || 'Package',
            packagePrice: Number(item.packagePrice || 0),
            packageImageUrl: item.clubPackage?.imageUrls?.[0],
            items: [item],
          });
        }
      } else {
        result.push({ type: 'standalone', item });
      }
    });

    return result;
  }, [order?.items]);

  const refundTotals = useMemo(() => {
    let totalItemRefund = 0;
    let totalTaxRefund = 0;
    Object.values(refundItemStates).forEach((s) => {
      if (s.selected) {
        totalItemRefund += s.refundTotal;
        totalTaxRefund += s.refundTax;
      }
    });
    let packageRefund = 0;
    Object.values(refundPackageStates).forEach((s) => {
      if (s.selected) packageRefund += s.amount === '' ? 0 : s.amount;
    });
    const shippingRefund = refundShipping ? Number(order?.shippingTotal ?? 0) : 0;
    const rushFeeRefund = refundRushFee ? Number(order?.rushFee ?? 0) : 0;
    const amountAlreadyRefunded = Number(order?.totalRefunded ?? 0);
    const totalAvailable = Number(order?.total ?? 0) - amountAlreadyRefunded;
    const totalRefund = totalItemRefund + totalTaxRefund + packageRefund + shippingRefund + rushFeeRefund;
    return { totalItemRefund, totalTaxRefund, packageRefund, shippingRefund, rushFeeRefund, totalRefund, amountAlreadyRefunded, totalAvailable };
  }, [refundItemStates, refundPackageStates, refundShipping, refundRushFee, order?.shippingTotal, order?.rushFee, order?.total, order?.totalRefunded]);

  const handleSubmitRefund = () => {
    if (!orderId || refundTotals.totalRefund <= 0) return;
    const standaloneItems = Object.entries(refundItemStates)
      .filter(([, s]) => s.selected && s.quantity > 0)
      .map(([orderItemId, s]) => ({ orderItemId, quantity: s.quantity }));

    // Collect individually-selected package items (user controls which ones get refundedQuantity++)
    const packageItems = Object.entries(refundItemStates)
      .filter(([itemId, s]) => {
        if (!s.selected || s.quantity <= 0) return false;
        const orderItem = order?.items?.find((i) => i.id === itemId);
        return orderItem?.packageInstanceId != null;
      })
      .map(([orderItemId, s]) => ({ orderItemId, quantity: s.quantity }));

    const hasPackageRefund = Object.values(refundPackageStates).some((ps) => ps.selected);
    const items = [...standaloneItems, ...packageItems];

    refundMutation.mutate(
      {
        id: orderId,
        data: {
          items: items.length > 0 ? items : undefined,
          customAmount: hasPackageRefund ? refundTotals.totalRefund : undefined,
          refundShipping: refundShipping || undefined,
          refundRushFee: refundRushFee || undefined,
          reason: refundReason.trim() || undefined,
        },
      },
      { onSuccess: () => setIsRefunding(false) }
    );
  };

  // Missing products helpers
  const isResolvingMode = isMissingMode && order?.status === 'MISSING';

  const handleStartMissing = () => {
    const states: Record<string, { selected: boolean; quantity: number }> = {};
    if (order?.status === 'MISSING') {
      // Resolve mode: pre-populate with currently missing items
      order?.items?.forEach((item) => {
        const mq = item.missingQuantity || 0;
        states[item.id] = { selected: mq > 0, quantity: mq };
      });
    } else {
      // Mark missing mode: all unchecked
      order?.items?.forEach((item) => {
        states[item.id] = { selected: false, quantity: 0 };
      });
    }
    setMissingItemStates(states);
    setMissingReason('');
    setIsMissingMode(true);
  };

  const handleCancelMissing = () => {
    setIsMissingMode(false);
  };

  const handleToggleMissingItem = (itemId: string, checked: boolean) => {
    const item = order?.items?.find((i) => i.id === itemId);
    if (!item) return;
    setMissingItemStates((prev) => {
      if (checked) {
        const qty = isResolvingMode
          ? (item.missingQuantity || 0)
          : item.quantity - (item.missingQuantity || 0);
        return { ...prev, [itemId]: { selected: true, quantity: Math.max(1, qty) } };
      }
      return { ...prev, [itemId]: { selected: false, quantity: 0 } };
    });
  };

  const handleMissingQtyChange = (itemId: string, qty: number) => {
    const item = order?.items?.find((i) => i.id === itemId);
    if (!item) return;
    const maxQty = isResolvingMode
      ? (item.missingQuantity || 0)
      : item.quantity - (item.missingQuantity || 0);
    const clamped = Math.max(0, Math.min(qty, maxQty));
    setMissingItemStates((prev) => ({
      ...prev,
      [itemId]: { ...prev[itemId], quantity: clamped },
    }));
  };

  const missingSelectedCount = Object.values(missingItemStates).filter(
    (s) => s.selected && s.quantity > 0
  ).length;

  const handleSubmitMissing = () => {
    if (!orderId || missingSelectedCount === 0) return;
    const items = Object.entries(missingItemStates)
      .filter(([, s]) => s.selected && s.quantity > 0)
      .map(([orderItemId, s]) => ({ orderItemId, quantity: s.quantity }));

    if (isResolvingMode) {
      resolveMissingMutation.mutate(
        { id: orderId, data: { items, reason: missingReason.trim() || undefined } },
        { onSuccess: () => setIsMissingMode(false) }
      );
    } else {
      markMissingMutation.mutate(
        { id: orderId, data: { items, reason: missingReason.trim() || undefined } },
        { onSuccess: () => setIsMissingMode(false) }
      );
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
          {!isRefunding && !isMissingMode && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleStartMissing}
              className="text-orange-600 hover:text-orange-700"
            >
              <AlertTriangle className="size-4 mr-2" />
              {order.status === 'MISSING' ? 'Resolve Missing' : 'Missing Products'}
            </Button>
          )}
          {!isRefunding && !isMissingMode && (
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

      {/* Partially Shipped Banner */}
      {order.status === 'PARTIALLY_SHIPPED' && order.items && order.items.some((i) => (i.shippedQuantity || 0) > 0) && (
        <div className="flex items-start gap-3 rounded-lg border border-blue-300 bg-blue-50 dark:border-blue-800 dark:bg-blue-950/30 p-4">
          <Truck className="size-5 text-blue-600 dark:text-blue-400 mt-0.5 shrink-0" />
          <div className="flex-1 space-y-2">
            <p className="text-sm font-semibold text-blue-800 dark:text-blue-300">
              This order has been partially shipped
            </p>
            <div className="space-y-1">
              {order.items.map((item) => {
                const shipped = item.shippedQuantity || 0;
                const remaining = item.quantity - shipped - (item.refundedQuantity || 0);
                return (
                  <div key={item.id} className="flex items-center justify-between text-sm text-blue-700 dark:text-blue-400">
                    <span>{item.clubProduct?.name || item.name || item.productVariant?.product?.name || 'Unknown'}</span>
                    <span className="font-medium">
                      {shipped} of {item.quantity} shipped
                      {remaining > 0 && <span className="text-blue-500 dark:text-blue-500"> ({remaining} pending)</span>}
                    </span>
                  </div>
                );
              })}
            </div>
            <p className="text-xs text-blue-600 dark:text-blue-500">
              Remaining items will be shipped when available. Check the <strong>Shipments</strong> panel for tracking details.
            </p>
          </div>
        </div>
      )}

      {/* Missing Items Banner */}
      {order.status === 'MISSING' && order.items?.some((i) => (i.missingQuantity || 0) > 0) && (
        <div className="flex items-start gap-3 rounded-lg border border-orange-300 bg-orange-50 dark:border-orange-800 dark:bg-orange-950/30 p-4">
          <AlertTriangle className="size-5 text-orange-600 dark:text-orange-400 mt-0.5 shrink-0" />
          <div className="flex-1 space-y-2">
            <p className="text-sm font-semibold text-orange-800 dark:text-orange-300">
              This order has items out of stock
            </p>
            <div className="space-y-1">
              {order.items
                .filter((i) => (i.missingQuantity || 0) > 0)
                .map((item) => (
                  <div key={item.id} className="flex items-center justify-between text-sm text-orange-700 dark:text-orange-400">
                    <span>{item.clubProduct?.name || item.name || item.productVariant?.product?.name || 'Unknown'}</span>
                    <span className="font-medium">
                      {item.missingQuantity} of {item.quantity} missing
                    </span>
                  </div>
                ))}
            </div>
            <p className="text-xs text-orange-600 dark:text-orange-500">
              Use the <strong>Resolve Missing</strong> button to restock items or swap variants, then move this order back to processing.
            </p>
          </div>
        </div>
      )}

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
        <Card>
          <CardHeader className="py-4">
            <h2 className="text-lg font-semibold">Notes</h2>
          </CardHeader>
          <CardContent>
            {order.notes && !order.notes.startsWith('[SYSTEM] Stock reserved') ? (
              <p className="text-sm whitespace-pre-wrap">{order.notes}</p>
            ) : (
              <p className="text-sm text-muted-foreground">No notes</p>
            )}
          </CardContent>
        </Card>

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

              {/* Column headers in missing mode */}
              {isMissingMode && (
                <div className="grid grid-cols-[auto_1fr_80px_100px] gap-2 items-center px-4 py-2 bg-orange-50 dark:bg-orange-950/20 text-xs font-medium text-muted-foreground border-b">
                  <span className="w-5" />
                  <span>Product</span>
                  <span className="text-center">Order Qty</span>
                  <span className="text-center">{isResolvingMode ? 'Resolve Qty' : 'Missing Qty'}</span>
                </div>
              )}

              <ScrollArea>
                <div className="divide-y">
                  {groupedOrderItems.map((group) => {
                    if (group.type === 'standalone') {
                      const item = group.item;
                      const rs = refundItemStates[item.id];

                      return (
                        <div key={item.id} className="p-4">
                          {isMissingMode ? (
                            (() => {
                              const ms = missingItemStates[item.id];
                              const maxQty = isResolvingMode
                                ? (item.missingQuantity || 0)
                                : item.quantity - (item.missingQuantity || 0);
                              const isFullyMissing = !isResolvingMode && (item.missingQuantity || 0) >= item.quantity;
                              return (
                                <div className={`grid grid-cols-[auto_1fr_80px_100px] gap-2 items-center ${isFullyMissing ? 'opacity-50' : ''}`}>
                                  <Checkbox
                                    checked={ms?.selected ?? false}
                                    disabled={isFullyMissing || maxQty <= 0}
                                    onCheckedChange={(checked) => handleToggleMissingItem(item.id, checked === true)}
                                  />
                                  <div className="flex items-center gap-3 min-w-0">
                                    <div className="flex items-center justify-center rounded-lg bg-accent/50 h-12 w-12 shrink-0">
                                      {(item.clubProduct?.imageUrls[0] || item.clubProduct?.product?.imageUrl || item.productVariant?.product?.imageUrl) ? (
                                        <img src={item.clubProduct?.imageUrls[0] || item.clubProduct?.product?.imageUrl || item.productVariant?.product?.imageUrl} alt={item.name || 'Product'} className="h-[30px] w-full object-contain" />
                                      ) : (
                                        <Package className="size-5 text-muted-foreground" />
                                      )}
                                    </div>
                                    <div className="min-w-0">
                                      <p className="text-sm font-medium truncate">{item.clubProduct?.name || item.name || item.productVariant?.product?.name || 'Unknown'}</p>
                                      {item.sku && <p className="text-xs text-muted-foreground">SKU: {item.sku}</p>}
                                      {(() => {
                                        const { sizeValue, rest } = extractSize(item.attributes, item.productVariant?.attributes);
                                        return (
                                          <>
                                            {sizeValue && <p className="text-xs text-muted-foreground">Size: {sizeValue}</p>}
                                            {rest.length > 0 && <p className="text-xs text-muted-foreground">{rest.map(([key, value]) => `${key}: ${value}`).join(' | ')}</p>}
                                          </>
                                        );
                                      })()}
                                      {item.customFields && Object.keys(item.customFields).length > 0 && (
                                        <div className="text-xs text-muted-foreground">
                                          {Object.entries(item.customFields).map(([key, value]) => <p key={key}>{key}: {value}</p>)}
                                        </div>
                                      )}
                                      {(item.missingQuantity || 0) > 0 && !isResolvingMode && (
                                        <p className="text-xs text-orange-600 font-medium">{isFullyMissing ? 'All missing' : `${item.missingQuantity} of ${item.quantity} missing`}</p>
                                      )}
                                      {isResolvingMode && (item.missingQuantity || 0) > 0 && (
                                        <p className="text-xs text-orange-600 font-medium">{item.missingQuantity} currently missing</p>
                                      )}
                                    </div>
                                  </div>
                                  <div className="text-center text-sm text-muted-foreground">&times; {item.quantity}</div>
                                  <div className="text-center">
                                    {ms?.selected ? (
                                      <Input type="number" min={1} max={maxQty} value={ms.quantity} onChange={(e) => handleMissingQtyChange(item.id, parseInt(e.target.value) || 0)} className="h-8 text-sm text-center" />
                                    ) : (
                                      <span className="text-sm text-muted-foreground">&ndash;</span>
                                    )}
                                  </div>
                                </div>
                              );
                            })()
                          ) : isRefunding ? (
                            <>
                              <div className={`grid grid-cols-[auto_1fr_80px_80px_90px_90px] gap-2 items-center ${item.refundedQuantity >= item.quantity ? 'opacity-50' : ''}`}>
                                <Checkbox
                                  checked={rs?.selected ?? false}
                                  disabled={item.refundedQuantity >= item.quantity}
                                  onCheckedChange={(checked) => handleToggleRefundItem(item.id, checked === true)}
                                />
                                <div className="flex items-center gap-3 min-w-0">
                                  <div className="flex items-center justify-center rounded-lg bg-accent/50 h-12 w-12 shrink-0">
                                    {(item.clubProduct?.imageUrls[0] || item.clubProduct?.product?.imageUrl || item.productVariant?.product?.imageUrl) ? (
                                      <img src={item.clubProduct?.imageUrls[0] || item.clubProduct?.product?.imageUrl || item.productVariant?.product?.imageUrl} alt={item.name || 'Product'} className="h-[30px] w-full object-contain" />
                                    ) : (
                                      <Package className="size-5 text-muted-foreground" />
                                    )}
                                  </div>
                                  <div className="min-w-0">
                                    <p className="text-sm font-medium truncate">{item.clubProduct?.name || item.name || item.productVariant?.product?.name || 'Unknown'}</p>
                                    {item.sku && <p className="text-xs text-muted-foreground">SKU: {item.sku}</p>}
                                    {(() => {
                                      const { sizeValue, rest } = extractSize(item.attributes, item.productVariant?.attributes);
                                      return (
                                        <>
                                          {sizeValue && <p className="text-xs text-muted-foreground">Size: {sizeValue}</p>}
                                          {rest.length > 0 && <p className="text-xs text-muted-foreground">{rest.map(([key, value]) => `${key}: ${value}`).join(' | ')}</p>}
                                        </>
                                      );
                                    })()}
                                    {item.customFields && Object.keys(item.customFields).length > 0 && (
                                      <div className="text-xs text-muted-foreground">
                                        {Object.entries(item.customFields).map(([key, value]) => <p key={key}>{key}: {value}</p>)}
                                      </div>
                                    )}
                                    {item.refundedQuantity > 0 && (
                                      <p className="text-xs text-destructive font-medium">{item.refundedQuantity >= item.quantity ? 'Fully refunded' : `${item.refundedQuantity} of ${item.quantity} refunded`}</p>
                                    )}
                                    {(item.missingQuantity || 0) > 0 && (
                                      <p className="text-xs text-orange-600 font-medium">{item.missingQuantity >= item.quantity ? 'All missing' : `${item.missingQuantity} of ${item.quantity} missing`}</p>
                                    )}
                                  </div>
                                </div>
                                <div className="text-center text-sm text-muted-foreground">&times; {item.quantity}</div>
                                <div className="text-right text-sm">${Number(item.unitPrice).toFixed(2)}</div>
                                <div className="text-right text-sm font-medium">${Number(item.totalPrice).toFixed(2)}</div>
                                <div className="text-right text-sm text-muted-foreground">
                                  ${(Number(order.subtotal) > 0 ? (Number(item.totalPrice) / Number(order.subtotal)) * Number(order.taxTotal) : 0).toFixed(2)}
                                </div>
                              </div>
                              {rs?.selected && (
                                <div className="grid grid-cols-[auto_1fr_80px_80px_90px_90px] gap-2 items-center mt-2">
                                  <span className="w-5" />
                                  <span />
                                  <Input type="number" min={0} max={item.quantity - (item.refundedQuantity || 0)} value={rs.quantity} onChange={(e) => handleRefundQtyChange(item.id, parseInt(e.target.value) || 0)} className="h-8 text-sm text-center" />
                                  <span />
                                  <Input type="text" value={rs.refundTotal.toFixed(2)} readOnly className="h-8 text-sm text-right bg-muted/30" tabIndex={-1} />
                                  <Input type="text" value={rs.refundTax.toFixed(4)} readOnly className="h-8 text-sm text-right bg-muted/30" tabIndex={-1} />
                                </div>
                              )}
                            </>
                          ) : (
                            <div className={`flex items-center gap-4 ${item.refundedQuantity >= item.quantity ? 'opacity-60' : ''}`}>
                              <div className="flex items-center justify-center rounded-lg bg-accent/50 h-16 w-16 shrink-0">
                                {(item.clubProduct?.imageUrls[0] || item.clubProduct?.product?.imageUrl || item.productVariant?.product?.imageUrl) ? (
                                  <img src={item.clubProduct?.imageUrls[0] || item.clubProduct?.product?.imageUrl || item.productVariant?.product?.imageUrl} alt={item.name || 'Product'} className="h-10 w-full object-contain" />
                                ) : (
                                  <Package className="size-6 text-muted-foreground" />
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <span className="font-medium text-foreground truncate">{item.clubProduct?.name || item.name || item.productVariant?.product?.name || 'Unknown Product'}</span>
                                {item.sku && <p className="text-xs text-muted-foreground">SKU: {item.sku}</p>}
                                {(() => {
                                  const { sizeValue, rest } = extractSize(item.attributes, item.productVariant?.attributes);
                                  return (
                                    <>
                                      {sizeValue && <p className="text-xs text-muted-foreground">Size: {sizeValue}</p>}
                                      {rest.length > 0 && <p className="text-xs text-muted-foreground">{rest.map(([key, value]) => `${key}: ${value}`).join(' | ')}</p>}
                                    </>
                                  );
                                })()}
                                {item.customFields && Object.keys(item.customFields).length > 0 && (
                                  <div className="text-xs text-muted-foreground">
                                    {Object.entries(item.customFields).map(([key, value]) => <p key={key}>{key}: {value}</p>)}
                                  </div>
                                )}
                                {item.refundedQuantity > 0 && (
                                  <p className="text-xs text-destructive font-medium mt-0.5">{item.refundedQuantity >= item.quantity ? 'Fully refunded' : `${item.refundedQuantity} of ${item.quantity} refunded`}</p>
                                )}
                                {(item.missingQuantity || 0) > 0 && (
                                  <p className="text-xs text-orange-600 font-medium mt-0.5">{item.missingQuantity >= item.quantity ? 'All missing' : `${item.missingQuantity} of ${item.quantity} missing`}</p>
                                )}
                              </div>
                              <div className="flex items-center gap-2">
                                {canSwapVariant && item.productVariant?.product?.id && (
                                  <TooltipProvider>
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          className="h-8 w-8 p-0"
                                          onClick={() => handleOpenSwap(item)}
                                        >
                                          <ArrowLeftRight className="size-4 text-muted-foreground" />
                                        </Button>
                                      </TooltipTrigger>
                                      <TooltipContent>Swap variant (e.g. change size)</TooltipContent>
                                    </Tooltip>
                                  </TooltipProvider>
                                )}
                                <div className="text-right">
                                  <div className="font-medium">${Number(item.totalPrice).toFixed(2)}</div>
                                  <div className="text-sm text-muted-foreground">${Number(item.unitPrice).toFixed(2)} x {item.quantity}</div>
                                  {item.refundedQuantity > 0 && (
                                    <div className="text-sm text-destructive font-medium">-{item.refundedQuantity} (-${(item.refundedQuantity * Number(item.unitPrice)).toFixed(2)})</div>
                                  )}
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    }

                    // Package group
                    const { packageInstanceId, packageName, packagePrice, packageImageUrl, items: pkgItems } = group;
                    const pkgQty = pkgItems[0]?.packageQuantity ?? 1;
                    const pkgTotalPrice = packagePrice * pkgQty;
                    const allPkgRefunded = pkgItems.every((i) => i.refundedQuantity >= i.quantity);

                    return (
                      <div key={packageInstanceId}>
                        {/* Package header */}
                        {isMissingMode ? (
                          <div className="p-4 pb-2 flex items-center gap-3">
                            <span className="w-5 shrink-0" />
                            <div className="flex items-center justify-center rounded-lg bg-primary/10 h-12 w-12 shrink-0 overflow-hidden">
                              {packageImageUrl ? (
                                <img src={packageImageUrl} alt={packageName} className="h-full w-full object-cover" />
                              ) : (
                                <Package className="size-5 text-primary" />
                              )}
                            </div>
                            <div>
                              <p className="text-sm font-semibold">{packageName}</p>
                              <p className="text-xs text-muted-foreground">{pkgItems.length} items</p>
                            </div>
                          </div>
                        ) : isRefunding ? (
                          <div className="p-4 pb-2">
                            <div className={`grid grid-cols-[auto_1fr_80px_80px_90px_90px] gap-2 items-center ${refundTotals.totalAvailable <= 0 ? 'opacity-50' : ''}`}>
                              <Checkbox
                                checked={refundPackageStates[packageInstanceId]?.selected ?? false}
                                disabled={refundTotals.totalAvailable <= 0}
                                onCheckedChange={(checked) => handleToggleRefundPackage(packageInstanceId, checked === true, packagePrice)}
                              />
                              <div className="flex items-center gap-3">
                                <div className="flex items-center justify-center rounded-lg bg-primary/10 h-12 w-12 shrink-0 overflow-hidden">
                                  {packageImageUrl ? (
                                    <img src={packageImageUrl} alt={packageName} className="h-full w-full object-cover" />
                                  ) : (
                                    <Package className="size-5 text-primary" />
                                  )}
                                </div>
                                <div>
                                  <p className="text-sm font-semibold">{packageName}</p>
                                  <p className="text-xs text-muted-foreground">{pkgItems.length} items</p>
                                </div>
                              </div>
                              <span />
                              <span />
                              <div className="text-right text-sm font-semibold">${pkgTotalPrice.toFixed(2)}</div>
                              <span />
                            </div>
                            {refundPackageStates[packageInstanceId]?.selected && (
                              <div className="grid grid-cols-[auto_1fr_80px_80px_90px_90px] gap-2 items-center mt-2">
                                <span className="w-5" />
                                <span className="text-xs text-muted-foreground pl-1">Refund amount:</span>
                                <span />
                                <span />
                                <Input
                                  type="number"
                                  min={0}
                                  max={pkgTotalPrice}
                                  step={0.01}
                                  value={refundPackageStates[packageInstanceId]?.amount ?? ''}
                                  onChange={(e) => handleRefundPackageAmountChange(packageInstanceId, e.target.value)}
                                  className="h-8 text-sm text-right"
                                />
                                <span />
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className={`p-4 pb-2 flex items-center gap-4 ${allPkgRefunded ? 'opacity-60' : ''}`}>
                            <div className="flex items-center justify-center rounded-lg bg-primary/10 h-16 w-16 shrink-0 overflow-hidden">
                              {packageImageUrl ? (
                                <img src={packageImageUrl} alt={packageName} className="h-full w-full object-cover" />
                              ) : (
                                <Package className="size-6 text-primary" />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <span className="font-semibold text-foreground">{packageName}</span>
                              <p className="text-xs text-muted-foreground">{pkgItems.length} items</p>
                            </div>
                            <div className="text-right">
                              <div className="font-medium">${pkgTotalPrice.toFixed(2)}</div>
                              {pkgQty > 1 && <div className="text-sm text-muted-foreground">${packagePrice.toFixed(2)} x {pkgQty}</div>}
                            </div>
                          </div>
                        )}

                        {/* Package items (indented, no price) */}
                        {pkgItems.map((item) => {
                          return (
                            <div key={item.id} className="pl-8 pr-4 py-2 border-t border-dashed border-border/50">
                              {isMissingMode ? (
                                (() => {
                                  const ms = missingItemStates[item.id];
                                  const maxQty = isResolvingMode
                                    ? (item.missingQuantity || 0)
                                    : item.quantity - (item.missingQuantity || 0);
                                  const isFullyMissing = !isResolvingMode && (item.missingQuantity || 0) >= item.quantity;
                                  return (
                                    <div className={`grid grid-cols-[auto_1fr_80px_100px] gap-2 items-center ${isFullyMissing ? 'opacity-50' : ''}`}>
                                      <Checkbox
                                        checked={ms?.selected ?? false}
                                        disabled={isFullyMissing || maxQty <= 0}
                                        onCheckedChange={(checked) => handleToggleMissingItem(item.id, checked === true)}
                                      />
                                      <div className="flex items-center gap-3 min-w-0">
                                        <div className="flex items-center justify-center rounded-lg bg-accent/50 h-10 w-10 shrink-0">
                                          {(item.clubProduct?.imageUrls[0] || item.clubProduct?.product?.imageUrl || item.productVariant?.product?.imageUrl) ? (
                                            <img src={item.clubProduct?.imageUrls[0] || item.clubProduct?.product?.imageUrl || item.productVariant?.product?.imageUrl} alt={item.name || 'Product'} className="h-6 w-full object-contain" />
                                          ) : (
                                            <Package className="size-4 text-muted-foreground" />
                                          )}
                                        </div>
                                        <div className="min-w-0">
                                          <p className="text-sm font-medium truncate">{item.clubProduct?.name || item.name || item.productVariant?.product?.name || 'Unknown'}</p>
                                          {item.sku && <p className="text-xs text-muted-foreground">SKU: {item.sku}</p>}
                                          {(() => {
                                            const { sizeValue, rest } = extractSize(item.attributes, item.productVariant?.attributes);
                                            return (
                                              <>
                                                {sizeValue && <p className="text-xs text-muted-foreground">Size: {sizeValue}</p>}
                                                {rest.length > 0 && <p className="text-xs text-muted-foreground">{rest.map(([key, value]) => `${key}: ${value}`).join(' | ')}</p>}
                                              </>
                                            );
                                          })()}
                                          {item.customFields && Object.keys(item.customFields).length > 0 && (
                                            <div className="text-xs text-muted-foreground">
                                              {Object.entries(item.customFields).map(([key, value]) => <p key={key}>{key}: {value}</p>)}
                                            </div>
                                          )}
                                          {(item.missingQuantity || 0) > 0 && !isResolvingMode && (
                                            <p className="text-xs text-orange-600 font-medium">{isFullyMissing ? 'All missing' : `${item.missingQuantity} of ${item.quantity} missing`}</p>
                                          )}
                                          {isResolvingMode && (item.missingQuantity || 0) > 0 && (
                                            <p className="text-xs text-orange-600 font-medium">{item.missingQuantity} currently missing</p>
                                          )}
                                        </div>
                                      </div>
                                      <div className="text-center text-sm text-muted-foreground">&times; {item.quantity}</div>
                                      <div className="text-center">
                                        {ms?.selected ? (
                                          <Input type="number" min={1} max={maxQty} value={ms.quantity} onChange={(e) => handleMissingQtyChange(item.id, parseInt(e.target.value) || 0)} className="h-8 text-sm text-center" />
                                        ) : (
                                          <span className="text-sm text-muted-foreground">&ndash;</span>
                                        )}
                                      </div>
                                    </div>
                                  );
                                })()
                              ) : isRefunding ? (
                                (() => {
                                  const rs = refundItemStates[item.id];
                                  const pkgSelected = refundPackageStates[packageInstanceId]?.selected ?? false;
                                  const isFullyRefunded = item.refundedQuantity >= item.quantity;
                                  return (
                                    <div className={`grid grid-cols-[auto_1fr] gap-2 items-center ${isFullyRefunded ? 'opacity-50' : ''}`}>
                                      <Checkbox
                                        checked={rs?.selected ?? false}
                                        disabled={!pkgSelected || isFullyRefunded}
                                        onCheckedChange={(checked) => handleToggleRefundItem(item.id, checked === true)}
                                      />
                                      <div className="flex items-center gap-3 min-w-0">
                                        <div className="flex items-center justify-center rounded-lg bg-accent/50 h-10 w-10 shrink-0">
                                          {(item.clubProduct?.imageUrls[0] || item.clubProduct?.product?.imageUrl || item.productVariant?.product?.imageUrl) ? (
                                            <img src={item.clubProduct?.imageUrls[0] || item.clubProduct?.product?.imageUrl || item.productVariant?.product?.imageUrl} alt={item.name || 'Product'} className="h-6 w-full object-contain" />
                                          ) : (
                                            <Package className="size-4 text-muted-foreground" />
                                          )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                          <div className="flex items-center gap-2">
                                            <p className="text-sm font-medium truncate">{item.clubProduct?.name || item.name || item.productVariant?.product?.name || 'Unknown'}</p>
                                            <span className="text-xs text-muted-foreground shrink-0">×{item.quantity}</span>
                                          </div>
                                          {item.sku && <p className="text-xs text-muted-foreground">SKU: {item.sku}</p>}
                                          {(() => {
                                            const { sizeValue, rest } = extractSize(item.attributes, item.productVariant?.attributes);
                                            return (
                                              <>
                                                {sizeValue && <p className="text-xs text-muted-foreground">Size: {sizeValue}</p>}
                                                {rest.length > 0 && <p className="text-xs text-muted-foreground">{rest.map(([key, value]) => `${key}: ${value}`).join(' | ')}</p>}
                                              </>
                                            );
                                          })()}
                                          {item.customFields && Object.keys(item.customFields).length > 0 && (
                                            <div className="text-xs text-muted-foreground">
                                              {Object.entries(item.customFields).map(([key, value]) => <p key={key}>{key}: {value}</p>)}
                                            </div>
                                          )}
                                          {item.refundedQuantity > 0 && (
                                            <p className="text-xs text-destructive font-medium">{isFullyRefunded ? 'Fully refunded' : `${item.refundedQuantity} of ${item.quantity} refunded`}</p>
                                          )}
                                          {(item.missingQuantity || 0) > 0 && (
                                            <p className="text-xs text-orange-600 font-medium">{item.missingQuantity >= item.quantity ? 'All missing' : `${item.missingQuantity} of ${item.quantity} missing`}</p>
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                  );
                                })()
                              ) : (
                                <div className={`flex items-center gap-3 ${item.refundedQuantity >= item.quantity ? 'opacity-60' : ''}`}>
                                  <div className="flex items-center justify-center rounded-lg bg-accent/50 h-12 w-12 shrink-0">
                                    {(item.clubProduct?.imageUrls[0] || item.clubProduct?.product?.imageUrl || item.productVariant?.product?.imageUrl) ? (
                                      <img src={item.clubProduct?.imageUrls[0] || item.clubProduct?.product?.imageUrl || item.productVariant?.product?.imageUrl} alt={item.name || 'Product'} className="h-8 w-full object-contain" />
                                    ) : (
                                      <Package className="size-5 text-muted-foreground" />
                                    )}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                      <span className="font-medium text-sm text-foreground truncate">{item.clubProduct?.name || item.name || item.productVariant?.product?.name || 'Unknown Product'}</span>
                                      <span className="text-xs text-muted-foreground shrink-0">×{item.quantity}</span>
                                    </div>
                                    {item.sku && <p className="text-xs text-muted-foreground">SKU: {item.sku}</p>}
                                    {(() => {
                                      const { sizeValue, rest } = extractSize(item.attributes, item.productVariant?.attributes);
                                      return (
                                        <>
                                          {sizeValue && <p className="text-xs text-muted-foreground">Size: {sizeValue}</p>}
                                          {rest.length > 0 && <p className="text-xs text-muted-foreground">{rest.map(([key, value]) => `${key}: ${value}`).join(' | ')}</p>}
                                        </>
                                      );
                                    })()}
                                    {item.customFields && Object.keys(item.customFields).length > 0 && (
                                      <div className="text-xs text-muted-foreground">
                                        {Object.entries(item.customFields).map(([key, value]) => <p key={key}>{key}: {value}</p>)}
                                      </div>
                                    )}
                                    {item.refundedQuantity > 0 && (
                                      <p className="text-xs text-destructive font-medium mt-0.5">{item.refundedQuantity >= item.quantity ? 'Fully refunded' : `${item.refundedQuantity} of ${item.quantity} refunded`}</p>
                                    )}
                                    {(item.missingQuantity || 0) > 0 && (
                                      <p className="text-xs text-orange-600 font-medium mt-0.5">{item.missingQuantity >= item.quantity ? 'All missing' : `${item.missingQuantity} of ${item.quantity} missing`}</p>
                                    )}
                                  </div>
                                  {canSwapVariant && item.productVariant?.product?.id && (
                                    <TooltipProvider>
                                      <Tooltip>
                                        <TooltipTrigger asChild>
                                          <Button
                                            variant="ghost"
                                            size="sm"
                                            className="h-7 w-7 p-0 shrink-0"
                                            onClick={() => handleOpenSwap(item)}
                                          >
                                            <ArrowLeftRight className="size-3.5 text-muted-foreground" />
                                          </Button>
                                        </TooltipTrigger>
                                        <TooltipContent>Swap variant</TooltipContent>
                                      </Tooltip>
                                    </TooltipProvider>
                                  )}
                                </div>
                              )}
                            </div>
                          );
                        })}
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

                  {/* Rush fee row in refund mode */}
                  {isRefunding && order.isRushOrder && Number(order.rushFee) > 0 && (
                    <div className="p-4">
                      <div className={`grid grid-cols-[auto_1fr_80px_80px_90px_90px] gap-2 items-center ${order.rushRefunded ? 'opacity-50' : ''}`}>
                        <Checkbox
                          checked={refundRushFee}
                          disabled={order.rushRefunded}
                          onCheckedChange={(checked) => setRefundRushFee(checked === true)}
                        />
                        <div className="flex items-center gap-3">
                          <div className="flex items-center justify-center rounded-lg bg-accent/50 h-12 w-12 shrink-0">
                            <Clock className="size-5 text-muted-foreground" />
                          </div>
                          <div>
                            <p className="text-sm font-medium">Rush Order Fee</p>
                            {order.rushRefunded && (
                              <p className="text-xs text-destructive font-medium">Already refunded</p>
                            )}
                          </div>
                        </div>
                        <span />
                        <span />
                        <div className="text-right text-sm font-medium">
                          ${Number(order.rushFee).toFixed(2)}
                        </div>
                        <div className="text-right text-sm text-muted-foreground">&ndash;</div>
                      </div>
                      {refundRushFee && (
                        <div className="grid grid-cols-[auto_1fr_80px_80px_90px_90px] gap-2 items-center mt-2">
                          <span className="w-5" />
                          <span />
                          <span />
                          <span />
                          <Input
                            type="text"
                            value={Number(order.rushFee).toFixed(2)}
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
                {order.isRushOrder && Number(order.rushFee) > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">
                      Rush Fee
                      {order.rushRefunded && (
                        <span className="text-destructive ml-1">(Refunded)</span>
                      )}
                    </span>
                    <div className="text-right">
                      <span>${Number(order.rushFee).toFixed(2)}</span>
                      {order.rushRefunded && (
                        <div className="text-destructive text-xs font-medium">
                         -${Number(order.rushFee).toFixed(2)}
                        </div>
                      )}
                    </div>
                  </div>
                )}
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
                    {/* TODO: Restock refunded items — functionality to be added later */}
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
                            <p>Items + tax + shipping + rush fee (if selected)</p>
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

                {/* Missing products summary */}
                {isMissingMode && (
                  <div className="space-y-3 pt-3">
                    <Separator />
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-orange-600">
                        <AlertTriangle className="size-3.5 inline mr-1.5" />
                        {isResolvingMode ? 'Resolving missing items' : 'Marking items as missing'}
                      </span>
                      <span className="text-sm font-medium">
                        {missingSelectedCount} item{missingSelectedCount !== 1 ? 's' : ''} selected
                      </span>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-sm text-muted-foreground">Reason (optional):</label>
                      <Input
                        value={missingReason}
                        onChange={(e) => setMissingReason(e.target.value)}
                        placeholder="Enter reason..."
                        className="h-9 text-sm"
                      />
                    </div>
                    <div className="flex items-center gap-2 justify-end pt-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleCancelMissing}
                        disabled={markMissingMutation.isPending || resolveMissingMutation.isPending}
                      >
                        Cancel
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-orange-600 hover:text-orange-700"
                        onClick={handleSubmitMissing}
                        disabled={
                          markMissingMutation.isPending ||
                          resolveMissingMutation.isPending ||
                          missingSelectedCount === 0
                        }
                      >
                        {(markMissingMutation.isPending || resolveMissingMutation.isPending) ? (
                          <>
                            <div className="animate-spin rounded-full h-3.5 w-3.5 border-b-2 border-orange-600 mr-2" />
                            Processing...
                          </>
                        ) : (
                          <>
                            <AlertTriangle className="size-4 mr-2" />
                            {isResolvingMode ? 'Resolve Missing' : 'Mark as Missing'}
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
                          {formatDateTime(new Date(history.createdAt))}
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

          {/* Shipments Panel */}
          <OrderShipmentsPanel orderId={order.id} />

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

      {/* Swap Variant Dialog */}
      <Dialog open={!!swapItem} onOpenChange={(open) => !open && setSwapItem(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Swap Variant</DialogTitle>
            <DialogDescription>
              Select a new variant for this item. Stock will be released from the current variant and reserved on the new one.
            </DialogDescription>
          </DialogHeader>
          <DialogBody className="space-y-4">
            {swapItem && (
              <>
                {/* Current variant info */}
                <div className="rounded-lg border p-3 space-y-1">
                  <p className="text-sm font-medium">Current</p>
                  <p className="text-sm">{swapItem.clubProduct?.name || swapItem.name || swapItem.productVariant?.product?.name || 'Unknown'}</p>
                  {swapItem.sku && <p className="text-xs text-muted-foreground">SKU: {swapItem.sku}</p>}
                  {(() => {
                    const { sizeValue, rest } = extractSize(swapItem.attributes, swapItem.productVariant?.attributes);
                    return (
                      <>
                        {sizeValue && <p className="text-xs text-muted-foreground">Size: {sizeValue}</p>}
                        {rest.length > 0 && <p className="text-xs text-muted-foreground">{rest.map(([k, v]) => `${k}: ${v}`).join(' | ')}</p>}
                      </>
                    );
                  })()}
                </div>

                {/* New variant select */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">New Variant</label>
                  {isLoadingVariants ? (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground py-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary" />
                      Loading variants...
                    </div>
                  ) : (
                    <Select value={selectedVariantId} onValueChange={setSelectedVariantId}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a variant..." />
                      </SelectTrigger>
                      <SelectContent>
                        {siblingVariants
                          ?.filter((v) => v.id !== swapItem.productVariantId)
                          .map((variant) => {
                            const attrs = variant.attributes
                              ? Object.entries(variant.attributes).map(([k, v]) => `${k}: ${v}`).join(', ')
                              : '';
                            return (
                              <SelectItem key={variant.id!} value={variant.id!}>
                                {attrs || variant.sku} — SKU: {variant.sku} — ${Number(variant.price).toFixed(2)}
                              </SelectItem>
                            );
                          })}
                      </SelectContent>
                    </Select>
                  )}
                  {siblingVariants && siblingVariants.filter((v) => v.id !== swapItem.productVariantId).length === 0 && (
                    <p className="text-sm text-muted-foreground">No other variants available for this product.</p>
                  )}
                </div>
              </>
            )}
          </DialogBody>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSwapItem(null)}>
              Cancel
            </Button>
            <Button
              onClick={handleConfirmSwap}
              disabled={!selectedVariantId || swapVariantMutation.isPending}
            >
              {swapVariantMutation.isPending ? (
                <>
                  <div className="animate-spin rounded-full h-3.5 w-3.5 border-b-2 border-white mr-2" />
                  Swapping...
                </>
              ) : (
                <>
                  <ArrowLeftRight className="size-4 mr-2" />
                  Confirm Swap
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
