import { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/shared/components/ui/dialog';
import { QrCode, Printer, Download, Maximize2 } from 'lucide-react';
import { toast } from 'sonner';
import { Order } from '@/modules/orders/types';
import { OrderQRCode } from './order-qr-code';

interface OrderQRCodeCardProps {
  order: Order;
}

export function OrderQRCodeCard({ order }: OrderQRCodeCardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const qrRef = useRef<HTMLDivElement>(null);

  const qrCodeUrl = `${window.location.origin}/orders/current?search=${encodeURIComponent(order.orderNumber)}`;

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      toast.error('Please allow popups to print');
      return;
    }

    const qrElement = qrRef.current;
    if (!qrElement) return;

    const svgElement = qrElement.querySelector('svg');
    if (!svgElement) return;

    const svgString = new XMLSerializer().serializeToString(svgElement);

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Print QR Code - ${order.orderNumber}</title>
          <style>
            body {
              margin: 0;
              padding: 20px;
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              font-family: Arial, sans-serif;
            }
            .qr-container {
              text-align: center;
            }
            .qr-code {
              margin: 20px 0;
            }
            .order-info {
              margin-top: 20px;
            }
            h2 {
              margin: 10px 0;
            }
            p {
              margin: 5px 0;
              color: #666;
            }
            @media print {
              body {
                padding: 0;
              }
            }
          </style>
        </head>
        <body>
          <div class="qr-container">
            <div class="qr-code">${svgString}</div>
            <div class="order-info">
              <h2>Order ${order.orderNumber}</h2>
              <p>Scan to view in kanban board</p>
            </div>
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

  const handleDownloadPNG = () => {
    const qrElement = qrRef.current;
    if (!qrElement) return;

    const svgElement = qrElement.querySelector('svg');
    if (!svgElement) return;

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const svgString = new XMLSerializer().serializeToString(svgElement);
    const img = new Image();
    const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(svgBlob);

    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);

      canvas.toBlob((blob) => {
        if (!blob) return;
        const pngUrl = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.download = `qrcode-${order.orderNumber}.png`;
        link.href = pngUrl;
        link.click();
        URL.revokeObjectURL(pngUrl);
        toast.success('QR Code downloaded as PNG');
      });

      URL.revokeObjectURL(url);
    };

    img.src = url;
  };

  return (
    <>
      <Card>
        <CardHeader className="py-4">
          <CardTitle className="text-lg flex items-center gap-2">
            <QrCode className="size-5 text-muted-foreground" />
            QR Code
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div ref={qrRef}>
            <OrderQRCode order={order} size={200} showLabel />
          </div>

          <div className="grid grid-cols-1 gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsModalOpen(true)}
              className="w-full"
            >
              <Maximize2 className="size-4 mr-2" />
              View Full Size
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handlePrint}
              className="w-full"
            >
              <Printer className="size-4 mr-2" />
              Print
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleDownloadPNG}
              className="w-full"
            >
              <Download className="size-4 mr-2" />
              Download PNG
            </Button>
          </div>

          <div className="text-xs text-muted-foreground text-center bg-accent/50 p-2 rounded-md">
            Scan to view in kanban board
          </div>
        </CardContent>
      </Card>

      {/* Full Size Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl">QR Code - {order.orderNumber}</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col items-center gap-4 py-4">
            <OrderQRCode order={order} size={300} showLabel />
            <div className="text-center">
              <p className="text-sm text-muted-foreground">
                Scan this code to quickly access this order in the kanban board
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
