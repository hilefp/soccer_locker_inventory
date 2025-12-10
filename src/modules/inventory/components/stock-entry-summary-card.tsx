import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';
import { Separator } from '@/shared/components/ui/separator';

interface StockEntrySummaryCardProps {
  entryNumber: string;
  totalItems: number;
  productsCount: number;
  totalCost: number;
}

export function StockEntrySummaryCard({
  entryNumber,
  totalItems,
  productsCount,
  totalCost,
}: StockEntrySummaryCardProps) {
  return (
    <Card className="sticky top-6">
      <CardHeader>
        <CardTitle className="text-xl">Summary</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Entry Number:</span>
            <span className="font-mono font-semibold">{entryNumber}</span>
          </div>
          <Separator />
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Total Items:</span>
            <span className="font-bold text-lg">{totalItems}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Products:</span>
            <span className="font-bold text-lg">{productsCount}</span>
          </div>
          <Separator />
          <div className="flex justify-between items-center">
            <span className="text-lg font-medium">Total Cost:</span>
            <span className="font-bold text-2xl text-primary">
              ${totalCost.toFixed(2)}
            </span>
          </div>
        </div>

        <Separator />

        <div className="space-y-2">
          <Badge variant="outline" className="w-full justify-center py-6 rounded-xl">
            Status: DRAFT
          </Badge>
          <p className="text-xs text-muted-foreground text-center">
            This entry will be created as a draft. You can confirm it later to update stock levels.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
