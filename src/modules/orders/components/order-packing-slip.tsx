import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/shared/components/ui/sheet';
import { Button } from '@/shared/components/ui/button';
import { Separator } from '@/shared/components/ui/separator';
import { Printer, Package, MapPin, Building, Hash } from 'lucide-react';
import { toast } from 'sonner';
import { Order } from '@/modules/orders/types';
import { OrderQRCode } from './order-qr-code';
import { formatDate } from '@/shared/lib/helpers';

interface OrderPackingSlipProps {
  order: Order;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function OrderPackingSlip({ order, open, onOpenChange }: OrderPackingSlipProps) {
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

    const htmlContent = await generateBulkPrintDocument([order], 'PACKING_SLIP');
    const success = openPrintWindow(htmlContent);

    if (!success) {
      toast.error('Please allow popups to print');
      return;
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-2xl overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="text-2xl">Packing Slip</SheetTitle>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-3xl font-bold">PACKING SLIP</h2>
              <p className="text-lg font-semibold mt-2">Order: {order.orderNumber}</p>
            </div>
            <div className="qr-code-container">
              <OrderQRCode order={order} size={120} />
            </div>
          </div>

          <Separator />

          {/* Ship To */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-lg font-semibold">
              <MapPin className="size-5" />
              SHIP TO
            </div>
            <div className="pl-7 space-y-1">
              <p className="font-semibold">{order.shippingName || 'N/A'}</p>
              {order.shippingPhone && <p>{order.shippingPhone}</p>}
              {shippingAddress ? (
                <p>{shippingAddress}</p>
              ) : (
                <p className="text-muted-foreground">No shipping address</p>
              )}
            </div>
          </div>

          {/* Club Info */}
          {order.club && (
            <>
              <Separator />
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-lg font-semibold">
                  <Building className="size-5" />
                  CLUB
                </div>
                <div className="pl-7">
                  <p className="font-semibold">{order.club.name}</p>
                </div>
              </div>
            </>
          )}

          <Separator />

          {/* Order Items */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-lg font-semibold">
              <Package className="size-5" />
              ORDER ITEMS
            </div>
            <div className="space-y-3">
              {order.items?.map((item) => (
                <div
                  key={item.id}
                  className="flex items-start gap-3 p-3 border rounded-lg hover:bg-accent/50 transition-colors"
                >
                  <div className="flex items-center justify-center h-5 w-5 border-2 border-foreground rounded mt-0.5 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold">
                      {item.name || item.productVariant?.product?.name || 'Unknown Product'}
                    </p>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
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
                  <div className="text-right font-semibold shrink-0">
                    Qty: {item.quantity}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <Separator />

          {/* Footer */}
          <div className="space-y-2 text-sm">
            <p>
              <strong>Total Items:</strong>{' '}
              {order.items?.reduce((sum, item) => sum + item.quantity, 0) || 0}
            </p>
            <p>
              <strong>Printed:</strong> {formatDate(new Date())}
            </p>
            {order.notes && (
              <p>
                <strong>Notes:</strong> {order.notes}
              </p>
            )}
          </div>

          {/* Print Button */}
          <Button onClick={handlePrint} className="w-full" size="lg">
            <Printer className="size-4 mr-2" />
            Print Packing Slip
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
