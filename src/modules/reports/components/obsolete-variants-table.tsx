import { Card } from '@/shared/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/components/ui/table';
import type { ObsoleteVariantsResponse } from '../types/inventory-reports.types';
import { LoaderCircleIcon } from 'lucide-react';
import { format } from 'date-fns';

interface ObsoleteVariantsTableProps {
  data?: ObsoleteVariantsResponse;
  isLoading?: boolean;
  error?: Error | null;
}

export function ObsoleteVariantsTable({
  data,
  isLoading,
  error,
}: ObsoleteVariantsTableProps) {
  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-center h-96">
          <LoaderCircleIcon className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-center h-96">
          <div className="text-center space-y-2">
            <p className="text-sm font-medium text-destructive">Error loading table</p>
            <p className="text-sm text-muted-foreground">{error.message}</p>
          </div>
        </div>
      </Card>
    );
  }

  if (!data || data.data.length === 0) {
    return (
      <Card className="p-6">
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold">Obsolete Product Variants</h3>
            <p className="text-sm text-muted-foreground">
              Products with stock but no recent outflow activity
            </p>
          </div>
          <div className="flex items-center justify-center h-64">
            <p className="text-sm text-muted-foreground">No obsolete variants found</p>
          </div>
        </div>
      </Card>
    );
  }

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'yyyy-MM-dd');
    } catch {
      return dateString;
    }
  };

  return (
    <Card className="p-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold">Obsolete Product Variants</h3>
            <p className="text-sm text-muted-foreground">
              Products with stock but no recent outflow activity ({data.total} total)
            </p>
          </div>
        </div>

        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>SKU</TableHead>
                <TableHead>Product</TableHead>
                <TableHead>Category</TableHead>
                <TableHead className="text-right">Current Stock</TableHead>
                <TableHead>Last Outflow</TableHead>
                <TableHead className="text-right">Days Inactive</TableHead>
                <TableHead className="text-right">Warehouses</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.data.map((variant) => (
                <TableRow key={variant.productVariantId}>
                  <TableCell className="font-medium">{variant.sku}</TableCell>
                  <TableCell>{variant.productName}</TableCell>
                  <TableCell>{variant.categoryName}</TableCell>
                  <TableCell className="text-right">
                    {variant.currentStock.toLocaleString()}
                  </TableCell>
                  <TableCell>{formatDate(variant.lastOutflowDate)}</TableCell>
                  <TableCell className="text-right">
                    <span
                      className={
                        variant.daysSinceLastOutflow > 180
                          ? 'text-destructive font-medium'
                          : variant.daysSinceLastOutflow > 90
                            ? 'text-orange-600 font-medium'
                            : ''
                      }
                    >
                      {variant.daysSinceLastOutflow}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    {variant.warehouseCount || '-'}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </Card>
  );
}
