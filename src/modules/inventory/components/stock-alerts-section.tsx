import { Alert, AlertDescription, AlertTitle } from '@/shared/components/ui/alert';
import { AlertTriangle, AlertCircle, AlertOctagon, Clock } from 'lucide-react';
import { StockAlert, AlertType } from '../types/stock-variant-detail.types';

interface StockAlertsSectionProps {
  alerts: StockAlert[];
}

export function StockAlertsSection({ alerts }: StockAlertsSectionProps) {
  if (alerts.length === 0) return null;

  const getAlertIcon = (type: AlertType) => {
    switch (type) {
      case AlertType.LOW_STOCK:
        return <AlertTriangle className="h-5 w-5" />;
      case AlertType.OUT_OF_STOCK:
        return <AlertOctagon className="h-5 w-5" />;
      case AlertType.NEAR_EXPIRATION:
        return <Clock className="h-5 w-5" />;
      case AlertType.EXPIRED:
        return <AlertOctagon className="h-5 w-5" />;
      case AlertType.OVERSTOCK:
        return <AlertCircle className="h-5 w-5" />;
      default:
        return <AlertCircle className="h-5 w-5" />;
    }
  };

  const getAlertVariant = (type: AlertType): 'primary' | 'mono' | 'destructive' | 'secondary' | 'success' | 'warning' | 'info' => {
    switch (type) {
      case AlertType.OUT_OF_STOCK:
      case AlertType.EXPIRED:
        return 'destructive';
      default:
        return 'warning';
    }
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="space-y-3">
      {alerts.map((alert) => (
        <Alert
          key={alert.id}
          variant={getAlertVariant(alert.alertType)}
          className="border-l-4"
        >
          {getAlertIcon(alert.alertType)}
          <AlertTitle className="text-base font-semibold">
            {alert.alertType.replace('_', ' ')}
          </AlertTitle>
          <AlertDescription className="text-base">
            {alert.message}
            <span className="block mt-2 text-sm text-muted-foreground">
              {formatDateTime(alert.createdAt)}
            </span>
          </AlertDescription>
        </Alert>
      ))}
    </div>
  );
}
