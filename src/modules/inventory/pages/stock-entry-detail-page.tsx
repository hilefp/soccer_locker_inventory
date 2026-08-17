import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { format } from 'date-fns';
import { useDocumentTitle } from '@/shared/hooks/use-document-title';
import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTable,
  CardTitle,
} from '@/shared/components/ui/card';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/shared/components/ui/alert-dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/components/ui/table';
import { ScrollArea, ScrollBar } from '@/shared/components/ui/scroll-area';
import { ArrowLeft, Check, Package, X } from 'lucide-react';
import {
  useCancelStockEntry,
  useConfirmStockEntry,
  useStockEntry,
} from '../hooks/use-stock-entry';
import { EntryStatus, EntryType } from '../types/stock-entry.types';

const entryTypeLabels: Record<string, string> = {
  [EntryType.PURCHASE]: 'Purchase',
  [EntryType.TRANSFER_IN]: 'Transfer In',
  [EntryType.RETURN]: 'Return',
  [EntryType.ADJUSTMENT]: 'Adjustment',
  [EntryType.PRODUCTION]: 'Production',
  [EntryType.INITIAL]: 'Initial',
};

const statusConfig: Record<
  EntryStatus,
  { label: string; variant: 'warning' | 'success' | 'destructive' }
> = {
  [EntryStatus.DRAFT]: { label: 'Draft', variant: 'warning' },
  [EntryStatus.CONFIRMED]: { label: 'Confirmed', variant: 'success' },
  [EntryStatus.CANCELLED]: { label: 'Cancelled', variant: 'destructive' },
};

export function StockEntryDetailPage() {
  useDocumentTitle('Stock Entry Details');
  const navigate = useNavigate();
  const { id = '' } = useParams<{ id: string }>();

  const { data: entry, isLoading } = useStockEntry(id);
  const confirmMutation = useConfirmStockEntry();
  const cancelMutation = useCancelStockEntry();

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [cancelOpen, setCancelOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="container-fluid flex items-center justify-center py-20">
        <span className="text-muted-foreground">Loading stock entry...</span>
      </div>
    );
  }

  if (!entry) {
    return (
      <div className="container-fluid flex flex-col items-center justify-center py-20 gap-4">
        <Package className="size-12 text-muted-foreground" />
        <p className="text-muted-foreground">Stock entry not found</p>
        <Button
          variant="outline"
          onClick={() => navigate('/inventory/stock-entries')}
        >
          Back to Stock Entries
        </Button>
      </div>
    );
  }

  const status = statusConfig[entry.status];
  const totalUnits = entry.details.reduce((sum, d) => sum + d.quantity, 0);
  const isDraft = entry.status === EntryStatus.DRAFT;

  return (
    <div className="container-fluid space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="icon"
            onClick={() => navigate('/inventory/stock-entries')}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold tracking-tight font-mono">
                {entry.entryNumber}
              </h1>
              <Badge variant={status.variant} appearance="light">
                {status.label}
              </Badge>
            </div>
            <p className="text-muted-foreground">
              {entryTypeLabels[entry.entryType] || entry.entryType} entry
              {entry.warehouse ? ` to ${entry.warehouse.name}` : ''}
            </p>
          </div>
        </div>

        {isDraft && (
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              className="text-destructive hover:text-destructive gap-1.5"
              onClick={() => setCancelOpen(true)}
              disabled={cancelMutation.isPending}
            >
              <X className="h-4 w-4" />
              Cancel Entry
            </Button>
            <Button
              variant="mono"
              className="gap-1.5"
              onClick={() => setConfirmOpen(true)}
              disabled={confirmMutation.isPending}
            >
              <Check className="h-4 w-4" />
              {confirmMutation.isPending ? 'Confirming...' : 'Confirm Entry'}
            </Button>
          </div>
        )}
      </div>

      {/* Info + summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-xl">Entry Information</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
              <div>
                <dt className="text-sm text-muted-foreground">Warehouse</dt>
                <dd className="text-sm font-medium mt-0.5 flex items-center gap-2">
                  {entry.warehouse?.name || '-'}
                  {entry.warehouse?.code && (
                    <Badge variant="outline" size="sm">
                      {entry.warehouse.code}
                    </Badge>
                  )}
                </dd>
              </div>
              <div>
                <dt className="text-sm text-muted-foreground">Entry Type</dt>
                <dd className="text-sm font-medium mt-0.5">
                  {entryTypeLabels[entry.entryType] || entry.entryType}
                </dd>
              </div>
              <div>
                <dt className="text-sm text-muted-foreground">Entry Date</dt>
                <dd className="text-sm font-medium mt-0.5">
                  {format(new Date(entry.entryDate), 'MM/dd/yyyy')}
                </dd>
              </div>
              <div>
                <dt className="text-sm text-muted-foreground">
                  Reference Document
                </dt>
                <dd className="text-sm font-medium mt-0.5">
                  {entry.referenceDocument || '-'}
                </dd>
              </div>
              <div>
                <dt className="text-sm text-muted-foreground">Created</dt>
                <dd className="text-sm font-medium mt-0.5">
                  {format(new Date(entry.createdAt), 'MM/dd/yyyy h:mm a')}
                </dd>
              </div>
              {entry.notes && (
                <div className="md:col-span-2">
                  <dt className="text-sm text-muted-foreground">Notes</dt>
                  <dd className="text-sm mt-0.5">{entry.notes}</dd>
                </div>
              )}
            </dl>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Products:</span>
              <span className="font-bold">{entry.details.length}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Total Units:</span>
              <span className="font-bold">{totalUnits}</span>
            </div>
            <div className="flex items-center justify-between border-t pt-3">
              <span className="font-medium">Total Cost:</span>
              <span className="font-bold text-primary text-lg">
                ${Number(entry.totalCost || 0).toFixed(2)}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Products */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Products</CardTitle>
        </CardHeader>
        <CardTable>
          <ScrollArea className="w-full">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>SKU</TableHead>
                  <TableHead className="text-right">Quantity</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {entry.details.map((detail) => (
                  <TableRow key={detail.id}>
                    <TableCell>
                      <span className="text-sm font-medium">
                        {detail.productVariant?.product?.name ||
                          'Unknown Product'}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm font-mono text-muted-foreground">
                        {detail.productVariant?.sku || 'N/A'}
                      </span>
                    </TableCell>
                    <TableCell className="text-right text-sm font-medium">
                      {detail.quantity}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
        </CardTable>
      </Card>

      {/* Confirm dialog */}
      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm stock entry?</AlertDialogTitle>
            <AlertDialogDescription>
              Confirming {entry.entryNumber} will add its quantities to the
              warehouse stock levels. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep as draft</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => confirmMutation.mutate(entry.id)}
            >
              Confirm entry
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Cancel dialog */}
      <AlertDialog open={cancelOpen} onOpenChange={setCancelOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel stock entry?</AlertDialogTitle>
            <AlertDialogDescription>
              {entry.entryNumber} will be marked as cancelled and its products
              will not be added to stock.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep entry</AlertDialogCancel>
            <AlertDialogAction onClick={() => cancelMutation.mutate(entry.id)}>
              Cancel entry
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
