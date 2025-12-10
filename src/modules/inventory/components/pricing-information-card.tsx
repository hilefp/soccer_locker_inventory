import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Separator } from '@/shared/components/ui/separator';
import { DollarSign, TrendingUp } from 'lucide-react';

interface PricingInformationCardProps {
  price: number;
  compareAtPrice: number | null;
  cost: number | null;
  totalQuantity: number;
}

export function PricingInformationCard({
  price,
  compareAtPrice,
  cost,
  totalQuantity,
}: PricingInformationCardProps) {
  const formatCurrency = (value: number | null) => {
    if (value === null) return '-';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(value);
  };

  const margin = cost ? price - cost : null;
  const marginPercentage = cost && cost > 0 ? ((price - cost) / cost) * 100 : null;
  const totalValue = price * totalQuantity;
  const totalCostValue = cost ? cost * totalQuantity : null;
  const totalMargin = margin ? margin * totalQuantity : null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <DollarSign className="h-5 w-5" />
          Pricing & Value
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Unit Pricing */}
        <div className="space-y-3">
          <p className="text-sm font-medium text-muted-foreground">Unit Pricing</p>
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">Selling Price:</span>
            <span className="font-bold text-lg">{formatCurrency(price)}</span>
          </div>
          {compareAtPrice && (
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Compare at:</span>
              <span className="text-sm line-through text-muted-foreground">
                {formatCurrency(compareAtPrice)}
              </span>
            </div>
          )}
          {cost && (
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Cost Price:</span>
              <span className="font-semibold text-base">{formatCurrency(cost)}</span>
            </div>
          )}
          {margin !== null && (
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Unit Margin:</span>
              <span className="font-semibold text-base text-green-600">
                {formatCurrency(margin)}
              </span>
            </div>
          )}
          {marginPercentage !== null && (
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Margin %:</span>
              <span className="font-bold text-base text-green-600 flex items-center gap-1">
                <TrendingUp className="h-4 w-4" />
                {marginPercentage.toFixed(1)}%
              </span>
            </div>
          )}
        </div>

        <Separator />

        {/* Total Value */}
        <div className="space-y-3">
          <p className="text-sm font-medium text-muted-foreground">Total Inventory Value</p>
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">Total Value:</span>
            <span className="font-bold text-xl text-primary">{formatCurrency(totalValue)}</span>
          </div>
          {totalCostValue !== null && (
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Total Cost:</span>
              <span className="font-semibold text-base">{formatCurrency(totalCostValue)}</span>
            </div>
          )}
          {totalMargin !== null && (
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Total Margin:</span>
              <span className="font-bold text-lg text-green-600">
                {formatCurrency(totalMargin)}
              </span>
            </div>
          )}
        </div>

        <div className="text-xs text-muted-foreground bg-accent/50 p-3 rounded-md">
          Based on {totalQuantity} units in stock
        </div>
      </CardContent>
    </Card>
  );
}
