import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { useDocumentTitle } from '@/shared/hooks/use-document-title';
import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import {
  Card,
  CardFooter,
  CardHeader,
  CardTable,
  CardToolbar,
} from '@/shared/components/ui/card';
import { DataGrid } from '@/shared/components/ui/data-grid';
import { DataGridColumnHeader } from '@/shared/components/ui/data-grid-column-header';
import { DataGridPagination } from '@/shared/components/ui/data-grid-pagination';
import { DataGridTable } from '@/shared/components/ui/data-grid-table';
import { Input, InputWrapper } from '@/shared/components/ui/input';
import { ScrollArea, ScrollBar } from '@/shared/components/ui/scroll-area';
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
  ColumnDef,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  PaginationState,
  SortingState,
  useReactTable,
} from '@tanstack/react-table';
import { Check, ClipboardList, Eye, Plus, Search, X } from 'lucide-react';
import {
  useCancelStockEntry,
  useConfirmStockEntry,
  useStockEntries,
} from '../hooks/use-stock-entry';
import {
  EntryStatus,
  EntryType,
  StockEntryResponse,
} from '../types/stock-entry.types';

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

export function StockEntryListPage() {
  useDocumentTitle('Stock Entries');
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState('');
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });
  const [sorting, setSorting] = useState<SortingState>([
    { id: 'entryDate', desc: true },
  ]);
  const [confirmTarget, setConfirmTarget] = useState<StockEntryResponse | null>(
    null,
  );
  const [cancelTarget, setCancelTarget] = useState<StockEntryResponse | null>(
    null,
  );

  const { data: entries = [], isLoading } = useStockEntries();
  const confirmMutation = useConfirmStockEntry();
  const cancelMutation = useCancelStockEntry();

  const filteredData = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return entries;

    return entries.filter(
      (entry) =>
        entry.entryNumber.toLowerCase().includes(query) ||
        entry.referenceDocument?.toLowerCase().includes(query) ||
        entry.warehouse?.name?.toLowerCase().includes(query),
    );
  }, [entries, searchQuery]);

  const columns = useMemo<ColumnDef<StockEntryResponse>[]>(
    () => [
      {
        id: 'entryNumber',
        accessorFn: (row) => row.entryNumber,
        header: ({ column }) => (
          <DataGridColumnHeader title="Entry Number" column={column} />
        ),
        cell: ({ row }) => (
          <div className="flex flex-col">
            <span className="font-mono text-sm font-medium">
              {row.original.entryNumber}
            </span>
            {row.original.referenceDocument && (
              <span className="text-xs text-muted-foreground">
                Ref: {row.original.referenceDocument}
              </span>
            )}
          </div>
        ),
        size: 190,
      },
      {
        id: 'warehouse',
        accessorFn: (row) => row.warehouse?.name || '-',
        header: ({ column }) => (
          <DataGridColumnHeader title="Warehouse" column={column} />
        ),
        cell: ({ row }) => (
          <div className="flex flex-col items-start gap-1">
            <span className="text-sm whitespace-nowrap">
              {row.original.warehouse?.name}
            </span>
            {row.original.warehouse?.code && (
              <Badge variant="outline" size="sm">
                {row.original.warehouse.code}
              </Badge>
            )}
          </div>
        ),
        size: 190,
      },
      {
        id: 'entryType',
        accessorFn: (row) => row.entryType,
        header: ({ column }) => (
          <DataGridColumnHeader title="Type" column={column} />
        ),
        cell: ({ row }) => (
          <span className="text-sm">
            {entryTypeLabels[row.original.entryType] || row.original.entryType}
          </span>
        ),
        size: 110,
      },
      {
        id: 'entryDate',
        accessorFn: (row) => row.entryDate,
        header: ({ column }) => (
          <DataGridColumnHeader title="Entry Date" column={column} />
        ),
        cell: ({ row }) => (
          <span className="text-sm">
            {format(new Date(row.original.entryDate), 'MM/dd/yyyy')}
          </span>
        ),
        size: 110,
      },
      {
        id: 'products',
        accessorFn: (row) => row.details?.length || 0,
        header: ({ column }) => (
          <DataGridColumnHeader title="Products" column={column} />
        ),
        cell: ({ row }) => {
          const products = row.original.details?.length || 0;
          const units =
            row.original.details?.reduce((sum, d) => sum + d.quantity, 0) || 0;
          return (
            <div className="flex flex-col">
              <span className="text-sm font-medium">{products}</span>
              <span className="text-xs text-muted-foreground">
                {units} unit{units !== 1 ? 's' : ''}
              </span>
            </div>
          );
        },
        size: 90,
      },
      {
        id: 'totalCost',
        accessorFn: (row) => row.totalCost,
        header: ({ column }) => (
          <DataGridColumnHeader title="Total Cost" column={column} />
        ),
        cell: ({ row }) => (
          <span className="text-sm font-medium">
            ${Number(row.original.totalCost || 0).toFixed(2)}
          </span>
        ),
        size: 100,
      },
      {
        id: 'status',
        accessorFn: (row) => row.status,
        header: ({ column }) => (
          <DataGridColumnHeader title="Status" column={column} />
        ),
        cell: ({ row }) => {
          const status = statusConfig[row.original.status];
          return (
            <Badge variant={status.variant} appearance="light">
              {status.label}
            </Badge>
          );
        },
        size: 100,
      },
      {
        id: 'actions',
        header: () => <span className="font-medium">Actions</span>,
        enableSorting: false,
        cell: ({ row }) => {
          const entry = row.original;

          return (
            <div className="flex items-center gap-1">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-8 gap-1"
                onClick={() =>
                  navigate(`/inventory/stock-entries/${entry.id}`)
                }
              >
                <Eye className="h-3.5 w-3.5" />
                View
              </Button>
              {entry.status === EntryStatus.DRAFT && (
                <>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-8 gap-1 text-green-600 hover:text-green-700"
                    onClick={() => setConfirmTarget(entry)}
                    disabled={confirmMutation.isPending}
                  >
                    <Check className="h-3.5 w-3.5" />
                    Confirm
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-8 gap-1 text-destructive hover:text-destructive"
                    onClick={() => setCancelTarget(entry)}
                    disabled={cancelMutation.isPending}
                  >
                    <X className="h-3.5 w-3.5" />
                    Cancel
                  </Button>
                </>
              )}
            </div>
          );
        },
        size: 230,
      },
    ],
    [confirmMutation.isPending, cancelMutation.isPending, navigate],
  );

  const table = useReactTable({
    data: filteredData,
    columns,
    state: {
      pagination,
      sorting,
    },
    onPaginationChange: setPagination,
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getRowId: (row) => row.id,
  });

  return (
    <div className="container-fluid space-y-5 lg:space-y-9">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Stock Entries</h1>
          <p className="text-muted-foreground">
            Register and track incoming inventory to your warehouses
          </p>
        </div>
        <Button
          variant="mono"
          onClick={() => navigate('/inventory/stock-entries/new')}
        >
          <Plus className="mr-2 h-4 w-4" />
          New Entry
        </Button>
      </div>

      <DataGrid
        table={table}
        recordCount={filteredData.length}
        tableLayout={{
          cellBorder: true,
        }}
      >
        <Card>
          <CardHeader className="py-3.5">
            <CardToolbar>
              <InputWrapper className="w-full lg:w-[300px]">
                <Search />
                <Input
                  placeholder="Search by entry number, reference..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                {searchQuery && (
                  <Button
                    variant="dim"
                    size="sm"
                    className="-me-3.5"
                    onClick={() => setSearchQuery('')}
                  >
                    <X />
                  </Button>
                )}
              </InputWrapper>
            </CardToolbar>
          </CardHeader>
          <CardTable>
            {isLoading ? (
              <div className="flex items-center justify-center py-10">
                <span className="text-muted-foreground">
                  Loading stock entries...
                </span>
              </div>
            ) : filteredData.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 gap-4">
                <ClipboardList className="size-12 text-muted-foreground" />
                <p className="text-muted-foreground">
                  {searchQuery
                    ? 'No stock entries match your search'
                    : 'No stock entries yet. Create your first one.'}
                </p>
              </div>
            ) : (
              <ScrollArea className="w-full">
                <DataGridTable />
                <ScrollBar orientation="horizontal" />
              </ScrollArea>
            )}
          </CardTable>
          <CardFooter>
            <DataGridPagination />
          </CardFooter>
        </Card>
      </DataGrid>

      {/* Confirm entry dialog */}
      <AlertDialog
        open={!!confirmTarget}
        onOpenChange={(open) => !open && setConfirmTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm stock entry?</AlertDialogTitle>
            <AlertDialogDescription>
              Confirming {confirmTarget?.entryNumber} will add its quantities
              to the warehouse stock levels. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep as draft</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (confirmTarget) {
                  confirmMutation.mutate(confirmTarget.id);
                }
                setConfirmTarget(null);
              }}
            >
              Confirm entry
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Cancel entry dialog */}
      <AlertDialog
        open={!!cancelTarget}
        onOpenChange={(open) => !open && setCancelTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel stock entry?</AlertDialogTitle>
            <AlertDialogDescription>
              {cancelTarget?.entryNumber} will be marked as cancelled and its
              products will not be added to stock.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep entry</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (cancelTarget) {
                  cancelMutation.mutate(cancelTarget.id);
                }
                setCancelTarget(null);
              }}
            >
              Cancel entry
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
