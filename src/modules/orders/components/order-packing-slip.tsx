import { useRef } from 'react';
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

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      toast.error('Please allow popups to print');
      return;
    }

    const contentElement = contentRef.current;
    if (!contentElement) return;

    // Get QR code SVG
    const qrElement = contentElement.querySelector('.qr-code-container svg');
    const qrString = qrElement ? new XMLSerializer().serializeToString(qrElement) : '';

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Packing Slip - ${order.orderNumber}</title>
          <style>
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }
            body {
              font-family: Arial, sans-serif;
              padding: 20mm;
              color: #000;
              font-size: 12pt;
            }
            .header {
              display: flex;
              justify-content: space-between;
              align-items: flex-start;
              margin-bottom: 20px;
              padding-bottom: 15px;
              border-bottom: 2px solid #000;
            }
            .header-left h1 {
              font-size: 24pt;
              font-weight: bold;
              margin-bottom: 5px;
            }
            .header-left .order-number {
              font-size: 14pt;
              font-weight: bold;
            }
            .qr-code {
              width: 120px;
              height: 120px;
            }
            .section {
              margin: 20px 0;
            }
            .section-title {
              font-size: 14pt;
              font-weight: bold;
              margin-bottom: 10px;
              text-transform: uppercase;
            }
            .address {
              line-height: 1.6;
            }
            .items-list {
              margin: 20px 0;
            }
            .item {
              display: flex;
              align-items: flex-start;
              padding: 10px 0;
              border-bottom: 1px solid #ddd;
            }
            .item:last-child {
              border-bottom: none;
            }
            .checkbox {
              width: 20px;
              height: 20px;
              border: 2px solid #000;
              margin-right: 15px;
              flex-shrink: 0;
            }
            .item-details {
              flex: 1;
            }
            .item-name {
              font-weight: bold;
              font-size: 12pt;
              margin-bottom: 3px;
            }
            .item-meta {
              font-size: 10pt;
              color: #666;
            }
            .item-quantity {
              font-size: 11pt;
              font-weight: bold;
              text-align: right;
              min-width: 60px;
            }
            .footer {
              margin-top: 30px;
              padding-top: 15px;
              border-top: 2px solid #000;
              font-size: 11pt;
            }
            .footer-row {
              margin: 5px 0;
            }
            @media print {
              body {
                padding: 10mm;
              }
              @page {
                margin: 0;
              }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="header-left">
              <h1>PACKING SLIP</h1>
              <div class="order-number">Order: ${order.orderNumber}</div>
            </div>
            <div class="qr-code">${qrString}</div>
          </div>

          <div class="section">
            <div class="section-title">Ship To</div>
            <div class="address">
              <div><strong>${order.shippingName || 'N/A'}</strong></div>
              ${order.shippingPhone ? `<div>${order.shippingPhone}</div>` : ''}
              ${shippingAddress ? `<div>${shippingAddress}</div>` : '<div>No shipping address</div>'}
            </div>
          </div>

          ${
            order.club
              ? `
          <div class="section">
            <div class="section-title">Club</div>
            <div><strong>${order.club.name}</strong></div>
          </div>
          `
              : ''
          }

          <div class="section">
            <div class="section-title">Order Items</div>
            <div class="items-list">
              ${order.items
                ?.map(
                  (item) => `
                <div class="item">
                  <div class="checkbox"></div>
                  <div class="item-details">
                    <div class="item-name">${item.name || item.productVariant?.product?.name || 'Unknown Product'}</div>
                    <div class="item-meta">
                      ${item.sku ? `SKU: ${item.sku}` : ''}
                      ${
                        item.attributes && Object.keys(item.attributes).length > 0
                          ? ` | ${Object.entries(item.attributes)
                              .map(([key, value]) => `${key}: ${value}`)
                              .join(' | ')}`
                          : ''
                      }
                    </div>
                  </div>
                  <div class="item-quantity">Qty: ${item.quantity}</div>
                </div>
              `
                )
                .join('') || '<div>No items</div>'}
            </div>
          </div>

          <div class="footer">
            <div class="footer-row"><strong>Total Items:</strong> ${order.items?.reduce((sum, item) => sum + item.quantity, 0) || 0}</div>
            <div class="footer-row"><strong>Printed:</strong> ${formatDate(new Date())}</div>
            ${order.notes ? `<div class="footer-row"><strong>Notes:</strong> ${order.notes}</div>` : ''}
          </div>

          <script>
            window.onload = function() {
              window.print();
              window.onafterprint = function() {
                window.close();
              };
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-2xl overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="text-2xl">Packing Slip</SheetTitle>
        </SheetHeader>

        <div ref={contentRef} className="mt-6 space-y-6">
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
