import { QRCodeSVG } from 'qrcode.react';
import { Order } from '@/modules/orders/types';
import { cn } from '@/shared/lib/utils';

interface OrderQRCodeProps {
  order: Order;
  size?: number;
  showLabel?: boolean;
  className?: string;
}

export function OrderQRCode({
  order,
  size = 200,
  showLabel = false,
  className
}: OrderQRCodeProps) {
  // Generate URL that redirects to current orders page with search filter
  const qrCodeUrl = `${window.location.origin}/orders/current?search=${encodeURIComponent(order.orderNumber)}`;

  return (
    <div className={cn('flex flex-col items-center gap-2', className)}>
      <div className="bg-white p-3 rounded-lg">
        <QRCodeSVG
          value={qrCodeUrl}
          size={size}
          level="H"
          includeMargin={false}
          aria-label={`QR code for order ${order.orderNumber}`}
        />
      </div>
      {showLabel && (
        <span className="text-sm font-medium text-center">
          {order.orderNumber}
        </span>
      )}
    </div>
  );
}
