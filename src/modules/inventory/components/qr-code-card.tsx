import { useState, useRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/shared/components/ui/dialog';
import { QrCode, Printer, Download, Maximize2 } from 'lucide-react';
import { toast } from 'sonner';

interface QRCodeCardProps {
  sku: string;
  productName: string;
  variantId: string;
}

export function QRCodeCard({ sku, productName, variantId }: QRCodeCardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const qrRef = useRef<HTMLDivElement>(null);

  // Generate QR code data - you can customize this format
  const qrData = JSON.stringify({
    type: 'product_variant',
    variantId,
    sku,
    name: productName,
  });

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
          <title>Print QR Code - ${sku}</title>
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
            .product-info {
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
            <div class="product-info">
              <h2>${productName}</h2>
              <p><strong>SKU:</strong> ${sku}</p>
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
        link.download = `qrcode-${sku}.png`;
        link.href = pngUrl;
        link.click();
        URL.revokeObjectURL(pngUrl);
        toast.success('QR Code downloaded as PNG');
      });

      URL.revokeObjectURL(url);
    };

    img.src = url;
  };

  const handleDownloadPDF = () => {
    // For PDF, we'll use a simple approach with the print dialog
    // In a production app, you might want to use a library like jsPDF
    toast.info('Use Print button and select "Save as PDF" in the print dialog');
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <QrCode className="h-5 w-5" />
            QR Code
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div
            ref={qrRef}
            className="flex items-center justify-center p-4 bg-white rounded-lg"
          >
            <QRCodeSVG
              value={qrData}
              size={200}
              level="H"
              includeMargin={true}
            />
          </div>

          <div className="grid grid-cols-1 gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsModalOpen(true)}
              className="w-full"
            >
              <Maximize2 className="h-4 w-4 mr-2" />
              View Full Size
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handlePrint}
              className="w-full"
            >
              <Printer className="h-4 w-4 mr-2" />
              Print
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleDownloadPNG}
              className="w-full"
            >
              <Download className="h-4 w-4 mr-2" />
              Download PNG
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleDownloadPDF}
              className="w-full"
            >
              <Download className="h-4 w-4 mr-2" />
              Save as PDF
            </Button>
          </div>

          <div className="text-xs text-muted-foreground text-center bg-accent/50 p-2 rounded-md">
            Scan to view product details
          </div>
        </CardContent>
      </Card>

      {/* Full Size Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl">QR Code - {sku}</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col items-center gap-4 py-4">
            <div className="flex items-center justify-center p-6 bg-white rounded-lg">
              <QRCodeSVG
                value={qrData}
                size={300}
                level="H"
                includeMargin={true}
              />
            </div>
            <div className="text-center">
              <p className="font-semibold text-lg">{productName}</p>
              <p className="text-sm text-muted-foreground">SKU: {sku}</p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
