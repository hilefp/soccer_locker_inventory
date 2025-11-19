import { Card, CardContent } from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';
import { TrendingUp, TrendingDown, BarChart3 } from 'lucide-react';
import { StockMovement, MovementType } from '../types/stock-variant-detail.types';

interface StockMovementsTabProps {
  movements: StockMovement[];
  totalMovements: number;
  recentMovementsShown: number;
}

export function StockMovementsTab({
  movements,
  totalMovements,
  recentMovementsShown,
}: StockMovementsTabProps) {
  const getMovementIcon = (type: MovementType) => {
    switch (type) {
      case MovementType.ENTRY:
      case MovementType.TRANSFER_IN:
      case MovementType.RETURN:
        return <TrendingUp className="h-5 w-5 text-success" />;
      case MovementType.EXIT:
      case MovementType.TRANSFER_OUT:
      case MovementType.DAMAGE:
      case MovementType.LOSS:
        return <TrendingDown className="h-5 w-5 text-destructive" />;
      default:
        return <BarChart3 className="h-5 w-5 text-muted-foreground" />;
    }
  };

  const formatCurrency = (value: number | null) => {
    if (value === null) return '-';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(value);
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

  if (movements.length === 0) {
    return (
      <Card>
        <CardContent className="py-10 text-center">
          <p className="text-muted-foreground text-base">No stock movements recorded</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {movements.map((movement) => (
        <Card key={movement.id}>
          <CardContent className="pt-6">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3 flex-1">
                <div className="mt-0.5">
                  {getMovementIcon(movement.movementType)}
                </div>

                <div className="flex-1 space-y-3">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" size="sm" className="text-sm">
                      {movement.movementType.replace('_', ' ')}
                    </Badge>
                    <span className="text-base font-medium">
                      {movement.warehouse.name}
                    </span>
                  </div>

                  <div className="text-base space-y-1.5">
                    <div className="flex items-center gap-4">
                      <span className="text-muted-foreground">Quantity:</span>
                      <span className={`font-bold text-lg ${movement.quantity > 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {movement.quantity > 0 ? '+' : ''}{movement.quantity}
                      </span>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-muted-foreground">Stock:</span>
                      <span className="font-semibold text-base">
                        {movement.previousStock} → {movement.newStock}
                      </span>
                    </div>
                    {movement.reason && (
                      <div className="flex items-start gap-4">
                        <span className="text-muted-foreground">Reason:</span>
                        <span>{movement.reason}</span>
                      </div>
                    )}
                    {movement.notes && (
                      <div className="flex items-start gap-4">
                        <span className="text-muted-foreground">Notes:</span>
                        <span className="text-muted-foreground">{movement.notes}</span>
                      </div>
                    )}
                    {movement.totalCost && (
                      <div className="flex items-center gap-4">
                        <span className="text-muted-foreground">Cost:</span>
                        <span className="font-semibold text-base">{formatCurrency(movement.totalCost)}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="text-right text-sm text-muted-foreground">
                {formatDateTime(movement.createdAt)}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}

      {totalMovements > recentMovementsShown && (
        <p className="text-center text-sm text-muted-foreground pt-2">
          Showing {recentMovementsShown} of {totalMovements} total movements
        </p>
      )}
    </div>
  );
}
