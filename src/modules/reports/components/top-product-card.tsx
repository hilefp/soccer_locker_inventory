import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Trophy, Package, Hash, DollarSign } from 'lucide-react';
import { TopProduct } from '../types/sales-reports.types';

interface TopProductCardProps {
  topProduct: TopProduct | null;
  loading?: boolean;
}

export function TopProductCard({ topProduct, loading = false }: TopProductCardProps) {
  if (loading) {
    return (
      <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-primary" />
            Top Selling Product
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="h-6 w-48 animate-pulse rounded bg-muted" />
          <div className="grid gap-3 md:grid-cols-2">
            <div className="h-16 animate-pulse rounded bg-muted" />
            <div className="h-16 animate-pulse rounded bg-muted" />
            <div className="h-16 animate-pulse rounded bg-muted" />
            <div className="h-16 animate-pulse rounded bg-muted" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!topProduct) {
    return (
      <Card className="border-muted bg-muted/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-muted-foreground" />
            Top Selling Product
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <Package className="h-12 w-12 text-muted-foreground/50 mb-3" />
            <p className="text-sm text-muted-foreground">No sales data available</p>
            <p className="text-xs text-muted-foreground/70 mt-1">
              Try adjusting your filters or date range
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-5 w-5 text-primary" />
          Top Selling Product
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div>
          <h3 className="text-xl font-bold text-foreground">{topProduct.productName}</h3>
          <p className="text-sm text-muted-foreground">SKU: {topProduct.sku}</p>
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          <div className="rounded-lg border bg-background/50 p-3">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <Hash className="h-4 w-4" />
              <span className="text-xs font-medium">Quantity Sold</span>
            </div>
            <p className="text-2xl font-bold">{topProduct.quantitySold.toLocaleString()}</p>
          </div>

          <div className="rounded-lg border bg-background/50 p-3">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <DollarSign className="h-4 w-4" />
              <span className="text-xs font-medium">Total Revenue</span>
            </div>
            <p className="text-2xl font-bold">
              ${topProduct.totalRevenue.toLocaleString()}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
