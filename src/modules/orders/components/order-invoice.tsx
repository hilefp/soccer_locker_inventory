import { useRef } from 'react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/shared/components/ui/sheet';
import { Button } from '@/shared/components/ui/button';
import { Separator } from '@/shared/components/ui/separator';
import { Printer, Receipt } from 'lucide-react';
import { toast } from 'sonner';
import { Order } from '@/modules/orders/types';
import { OrderStatusBadge } from './order-status-badge';
import { formatDate } from '@/shared/lib/helpers';

interface OrderInvoiceProps {
  order: Order;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function OrderInvoice({ order, open, onOpenChange }: OrderInvoiceProps) {
  const contentRef = useRef<HTMLDivElement>(null);

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

  const handlePrint = async () => {
    const { generateBulkPrintDocument, openPrintWindow } = await import('@/modules/orders/lib/print-utils');

    const htmlContent = await generateBulkPrintDocument([order], 'INVOICE');
    const success = openPrintWindow(htmlContent);

    if (!success) {
      toast.error('Please allow popups to print');
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-3xl overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="text-2xl">Invoice</SheetTitle>
        </SheetHeader>

        <div ref={contentRef} className="mt-6 space-y-6">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-4xl font-bold">INVOICE</h2>
              <div className="mt-3 space-y-1 text-sm">
                <p>
                  <strong>Order Number:</strong> {order.orderNumber}
                </p>
                <p>
                  <strong>Date:</strong> {formatDate(new Date(order.createdAt))}
                </p>
                <div className="flex items-center gap-2">
                  <strong>Status:</strong>
                  <OrderStatusBadge status={order.status} size="sm" />
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Addresses */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2 p-4 bg-accent/30 rounded-lg">
              <h3 className="text-sm font-semibold uppercase text-muted-foreground">
                Bill To
              </h3>
              <div className="space-y-1">
                <p className="font-semibold">{order.shippingName || 'N/A'}</p>
                {order.customerUser?.email && <p className="text-sm">{order.customerUser.email}</p>}
                {order.shippingPhone && <p className="text-sm">{order.shippingPhone}</p>}
              </div>
            </div>
            <div className="space-y-2 p-4 bg-accent/30 rounded-lg">
              <h3 className="text-sm font-semibold uppercase text-muted-foreground">
                Ship To
              </h3>
              <div className="space-y-1">
                <p className="font-semibold">{order.shippingName || 'N/A'}</p>
                {shippingAddress ? (
                  <p className="text-sm">{shippingAddress}</p>
                ) : (
                  <p className="text-sm text-muted-foreground">No shipping address</p>
                )}
              </div>
            </div>
          </div>

          <Separator />

          {/* Items Table */}
          <div>
            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <Receipt className="size-5" />
              Items
            </h3>
            <div className="border rounded-lg overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="bg-muted">
                    <th className="text-left p-3 font-semibold text-sm">Item</th>
                    <th className="text-right p-3 font-semibold text-sm">Qty</th>
                    <th className="text-right p-3 font-semibold text-sm">Price</th>
                    <th className="text-right p-3 font-semibold text-sm">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {order.items?.map((item, index) => (
                    <tr key={item.id} className={index % 2 === 0 ? 'bg-background' : 'bg-accent/10'}>
                      <td className="p-3">
                        <div className="font-medium">
                          {item.name || item.productVariant?.product?.name || 'Unknown Product'}
                        </div>
                        {(item.sku || (item.attributes && Object.keys(item.attributes).length > 0)) && (
                          <div className="text-xs text-muted-foreground mt-1">
                            {item.sku && `SKU: ${item.sku}`}
                            {item.attributes &&
                              Object.keys(item.attributes).length > 0 &&
                              ` | ${Object.entries(item.attributes)
                                .map(([key, value]) => `${key}: ${value}`)
                                .join(' | ')}`}
                          </div>
                        )}
                      </td>
                      <td className="text-right p-3">{item.quantity}</td>
                      <td className="text-right p-3">${Number(item.unitPrice).toFixed(2)}</td>
                      <td className="text-right p-3 font-medium">
                        ${Number(item.totalPrice).toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Totals */}
          <div className="flex justify-end">
            <div className="w-full max-w-sm space-y-2">
              <div className="flex justify-between py-2 border-b">
                <span className="text-muted-foreground">Subtotal</span>
                <span>${Number(order.subtotal).toFixed(2)}</span>
              </div>
              <div className="flex justify-between py-2 border-b">
                <span className="text-muted-foreground">Tax</span>
                <span>${Number(order.taxTotal).toFixed(2)}</span>
              </div>
              <div className="flex justify-between py-2 border-b">
                <span className="text-muted-foreground">Shipping</span>
                <span>${Number(order.shippingTotal).toFixed(2)}</span>
              </div>
              <div className="flex justify-between py-3 text-lg font-bold border-t-2">
                <span>TOTAL</span>
                <span>
                  ${Number(order.total || 0).toFixed(2)} {order.currency || 'USD'}
                </span>
              </div>
            </div>
          </div>

          {/* Shipping Info */}
          {(order.carrier || order.trackingNumber) && (
            <>
              <Separator />
              <div className="text-sm space-y-1 text-muted-foreground">
                {order.carrier && (
                  <p>
                    <strong>Carrier:</strong> {order.carrier}
                  </p>
                )}
                {order.trackingNumber && (
                  <p>
                    <strong>Tracking:</strong> {order.trackingNumber}
                  </p>
                )}
                {order.shippedAt && (
                  <p>
                    <strong>Shipped:</strong> {formatDate(new Date(order.shippedAt))}
                  </p>
                )}
              </div>
            </>
          )}

          {/* Print Button */}
          <Button onClick={handlePrint} className="w-full" size="lg">
            <Printer className="size-4 mr-2" />
            Print Invoice
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
