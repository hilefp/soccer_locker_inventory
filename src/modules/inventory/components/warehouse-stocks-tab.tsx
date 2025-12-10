import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';
import { Separator } from '@/shared/components/ui/separator';
import { MapPin } from 'lucide-react';
import { WarehouseStock } from '../types/stock-variant-detail.types';
import { StockStatus } from '../types/stock-variant.types';

interface WarehouseStocksTabProps {
  warehouseStocks: WarehouseStock[];
}

export function WarehouseStocksTab({ warehouseStocks }: WarehouseStocksTabProps) {
  const getStatusBadgeVariant = (status: StockStatus) => {
    switch (status) {
      case StockStatus.IN_STOCK:
        return 'success';
      case StockStatus.LOW_STOCK:
        return 'warning';
      case StockStatus.OUT_OF_STOCK:
        return 'destructive';
      default:
        return 'default';
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="space-y-4">
      {warehouseStocks.map((stock) => (
        <Card key={stock.warehouseId}>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="space-y-1.5">
                <CardTitle className="text-lg">{stock.warehouseName}</CardTitle>
                <CardDescription className="flex items-center gap-2">
                  <Badge variant="outline" size="sm">{stock.warehouseCode}</Badge>
                  <Badge variant="outline" size="sm">{stock.warehouseType}</Badge>
                </CardDescription>
              </div>
              <Badge variant={getStatusBadgeVariant(stock.status) as any} appearance="light" className="text-sm px-3 py-1 ml-3" >
                {stock.status.replace('_', ' ')}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {stock.location && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4" />
                {stock.location}
              </div>
            )}

            <div className="grid grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-muted-foreground mb-1.5">Quantity</p>
                <p className="text-2xl font-semibold">{stock.quantity}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1.5">Reserved</p>
                <p className="text-2xl font-semibold text-amber-600">{stock.reservedQuantity}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1.5">Available</p>
                <p className="text-2xl font-semibold text-green-600">{stock.availableQuantity}</p>
              </div>
            </div>

            <Separator />

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Min Stock:</span>
                <span className="font-semibold text-base">{stock.minimumStock}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Max Stock:</span>
                <span className="font-semibold text-base">{stock.maximumStock ?? 'N/A'}</span>
              </div>
              <div className="flex justify-between col-span-2">
                <span className="text-muted-foreground">Last Count:</span>
                <span className="font-medium">{formatDate(stock.lastCountDate)}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
