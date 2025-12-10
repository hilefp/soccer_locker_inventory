import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Package, AlertCircle, CheckCircle } from 'lucide-react';

interface StockSummaryCardsProps {
  totalQuantity: number;
  totalReserved: number;
  totalAvailable: number;
  warehouseCount: number;
  totalValue?: number;
  costValue?: number;
  profitMargin?: number;
}

export function StockSummaryCards({
  totalQuantity,
  totalReserved,
  totalAvailable,
  warehouseCount,
  totalValue,
  costValue,
  profitMargin,
}: StockSummaryCardsProps) {
  const formatCurrency = (value: number | undefined) => {
    if (value === undefined) return '-';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(value);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card>
        <CardHeader className="pb-3">
          <CardDescription className="text-sm">Total Quantity</CardDescription>
          <CardTitle className="text-4xl font-bold">{totalQuantity}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground flex items-center gap-1.5">
            <Package className="h-4 w-4" />
            Across {warehouseCount} warehouse{warehouseCount !== 1 ? 's' : ''}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardDescription className="text-sm">Reserved</CardDescription>
          <CardTitle className="text-4xl font-bold text-amber-600">{totalReserved}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground flex items-center gap-1.5">
            <AlertCircle className="h-4 w-4" />
            Pending fulfillment
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardDescription className="text-sm">Available</CardDescription>
          <CardTitle className="text-4xl font-bold text-green-600">{totalAvailable}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground flex items-center gap-1.5">
            <CheckCircle className="h-4 w-4" />
            Ready to allocate
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardDescription className="text-sm">Total Value</CardDescription>
          <CardTitle className="text-3xl font-bold">{formatCurrency(totalValue)}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-1">
          {costValue !== undefined && (
            <p className="text-xs text-muted-foreground">
              Cost: {formatCurrency(costValue)}
            </p>
          )}
          {profitMargin !== undefined && (
            <p className="text-xs font-medium text-green-600">
              Margin: {profitMargin.toFixed(1)}%
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
