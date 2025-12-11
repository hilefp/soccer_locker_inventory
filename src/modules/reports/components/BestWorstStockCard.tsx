import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { StockObject } from '../types';

interface BestWorstStockCardProps {
  title: string;
  data: StockObject | null;
}

export function BestWorstStockCard({ title, data }: BestWorstStockCardProps) {
  if (!data) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-2">
            <div>
             <span className="text-muted-foreground text-sm">Product:</span>
             <p className="font-semibold">{data.productVariant.product.name}</p>
            </div>
             <div>
             <span className="text-muted-foreground text-sm">Variant SKU:</span>
             <p>{data.productVariant.sku}</p>
            </div>
             <div>
             <span className="text-muted-foreground text-sm">Warehouse:</span>
             <p>{data.warehouse.name}</p>
            </div>
             <div className="flex justify-between items-center mt-2">
                <span className="text-sm font-medium">Quantity:</span>
                <span className="text-xl font-bold">{data.quantity}</span>
             </div>
        </div>
      </CardContent>
    </Card>
  );
}
