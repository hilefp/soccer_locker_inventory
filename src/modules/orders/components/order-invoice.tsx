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
import { OrderQRCode } from './order-qr-code';
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
          <title>Invoice - ${order.orderNumber}</title>
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
              font-size: 11pt;
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
              font-size: 28pt;
              font-weight: bold;
              margin-bottom: 8px;
            }
            .header-left .meta {
              font-size: 10pt;
              line-height: 1.6;
            }
            .qr-code {
              width: 100px;
              height: 100px;
            }
            .addresses {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 30px;
              margin: 20px 0;
            }
            .address-block {
              padding: 10px;
              background: #f9f9f9;
              border-radius: 4px;
            }
            .address-title {
              font-size: 10pt;
              font-weight: bold;
              text-transform: uppercase;
              margin-bottom: 8px;
              color: #666;
            }
            .address-content {
              font-size: 10pt;
              line-height: 1.6;
            }
            .items-table {
              width: 100%;
              margin: 20px 0;
              border-collapse: collapse;
            }
            .items-table th {
              background: #f0f0f0;
              padding: 10px;
              text-align: left;
              font-size: 10pt;
              font-weight: bold;
              text-transform: uppercase;
              border-bottom: 2px solid #000;
            }
            .items-table th.right {
              text-align: right;
            }
            .items-table td {
              padding: 10px;
              border-bottom: 1px solid #ddd;
              font-size: 10pt;
            }
            .items-table td.right {
              text-align: right;
            }
            .item-meta {
              font-size: 9pt;
              color: #666;
              margin-top: 2px;
            }
            .totals {
              margin-top: 20px;
              display: flex;
              justify-content: flex-end;
            }
            .totals-table {
              width: 300px;
            }
            .totals-row {
              display: flex;
              justify-content: space-between;
              padding: 8px 0;
              font-size: 10pt;
            }
            .totals-row.subtotal,
            .totals-row.tax,
            .totals-row.shipping {
              border-bottom: 1px solid #ddd;
            }
            .totals-row.total {
              font-size: 14pt;
              font-weight: bold;
              padding-top: 12px;
              border-top: 2px solid #000;
              margin-top: 5px;
            }
            .footer {
              margin-top: 30px;
              padding-top: 15px;
              border-top: 1px solid #ddd;
              font-size: 9pt;
              color: #666;
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
              <h1>INVOICE</h1>
              <div class="meta">
                <div><strong>Order Number:</strong> ${order.orderNumber}</div>
                <div><strong>Date:</strong> ${formatDate(new Date(order.createdAt))}</div>
                <div><strong>Status:</strong> ${order.status}</div>
              </div>
            </div>
            <div class="qr-code">${qrString}</div>
          </div>

          <div class="addresses">
            <div class="address-block">
              <div class="address-title">Bill To</div>
              <div class="address-content">
                <div><strong>${order.shippingName || 'N/A'}</strong></div>
                ${order.customerUser?.email ? `<div>${order.customerUser.email}</div>` : ''}
                ${order.shippingPhone ? `<div>${order.shippingPhone}</div>` : ''}
              </div>
            </div>
            <div class="address-block">
              <div class="address-title">Ship To</div>
              <div class="address-content">
                <div><strong>${order.shippingName || 'N/A'}</strong></div>
                ${shippingAddress ? `<div>${shippingAddress}</div>` : '<div>No shipping address</div>'}
              </div>
            </div>
          </div>

          <table class="items-table">
            <thead>
              <tr>
                <th>Item</th>
                <th class="right">Qty</th>
                <th class="right">Price</th>
                <th class="right">Total</th>
              </tr>
            </thead>
            <tbody>
              ${order.items
                ?.map(
                  (item) => `
                <tr>
                  <td>
                    <div><strong>${item.name || item.productVariant?.product?.name || 'Unknown Product'}</strong></div>
                    ${
                      item.sku || (item.attributes && Object.keys(item.attributes).length > 0)
                        ? `<div class="item-meta">
                      ${item.sku ? `SKU: ${item.sku}` : ''}
                      ${
                        item.attributes && Object.keys(item.attributes).length > 0
                          ? ` | ${Object.entries(item.attributes)
                              .map(([key, value]) => `${key}: ${value}`)
                              .join(' | ')}`
                          : ''
                      }
                    </div>`
                        : ''
                    }
                  </td>
                  <td class="right">${item.quantity}</td>
                  <td class="right">$${Number(item.unitPrice).toFixed(2)}</td>
                  <td class="right">$${Number(item.totalPrice).toFixed(2)}</td>
                </tr>
              `
                )
                .join('') || '<tr><td colspan="4">No items</td></tr>'}
            </tbody>
          </table>

          <div class="totals">
            <div class="totals-table">
              <div class="totals-row subtotal">
                <span>Subtotal</span>
                <span>$${Number(order.subtotal).toFixed(2)}</span>
              </div>
              <div class="totals-row tax">
                <span>Tax</span>
                <span>$${Number(order.taxTotal).toFixed(2)}</span>
              </div>
              <div class="totals-row shipping">
                <span>Shipping</span>
                <span>$${Number(order.shippingTotal).toFixed(2)}</span>
              </div>
              <div class="totals-row total">
                <span>TOTAL</span>
                <span>$${Number(order.total || 0).toFixed(2)} ${order.currency || 'USD'}</span>
              </div>
            </div>
          </div>

          ${
            order.carrier || order.trackingNumber
              ? `
          <div class="footer">
            ${order.carrier ? `<div><strong>Carrier:</strong> ${order.carrier}</div>` : ''}
            ${order.trackingNumber ? `<div><strong>Tracking:</strong> ${order.trackingNumber}</div>` : ''}
            ${order.shippedAt ? `<div><strong>Shipped:</strong> ${formatDate(new Date(order.shippedAt))}</div>` : ''}
          </div>
          `
              : ''
          }

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
            <div className="qr-code-container">
              <OrderQRCode order={order} size={100} />
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
