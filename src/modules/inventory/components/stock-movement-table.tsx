import { useMemo, useState } from 'react';
import { useStockMovements } from '@/modules/inventory/hooks/use-stock-movements';
import {
  StockMovementItem,
  MovementType,
} from '@/modules/inventory/types/stock-movement.types';
import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import {
  Card,
  CardFooter,
  CardTable,
} from '@/shared/components/ui/card';
import { DataGrid } from '@/shared/components/ui/data-grid';
import { DataGridColumnHeader } from '@/shared/components/ui/data-grid-column-header';
import { DataGridPagination } from '@/shared/components/ui/data-grid-pagination';
import {
  DataGridTable,
  DataGridTableRowSelect,
  DataGridTableRowSelectAll,
} from '@/shared/components/ui/data-grid-table';
import { ScrollArea, ScrollBar } from '@/shared/components/ui/scroll-area';
import {
  ColumnDef,
  getCoreRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  PaginationState,
  RowSelectionState,
  SortingState,
  useReactTable,
} from '@tanstack/react-table';
import { ArrowDownLeft, ArrowUpRight, Eye, FileText } from 'lucide-react';

interface IData {
  id: string;
  productInfo: {
    sku: string;
    productName: string;
    variantName: string;
  };
  warehouseName: string;
  movementType: {
    type: MovementType;
    label: string;
    variant: string;
    icon: JSX.Element;
  };
  quantity: {
    value: number;
    isPositive: boolean;
  };
  reference: {
    type: string | null;
    id: string | null;
  };
  userName: string;
  notes: string | null;
  createdAt: string;
}

interface StockMovementTableProps {
  productVariantId?: string;
  warehouseId?: string;
  movementType?: MovementType;
  startDate?: string;
  endDate?: string;
}

// Helper function to get movement type display info
const getMovementTypeInfo = (type: MovementType) => {
  const configs = {
    [MovementType.PURCHASE]: {
      label: 'Purchase',
      variant: 'success',
      icon: <ArrowDownLeft className="h-3.5 w-3.5" />,
    },
    [MovementType.SALE]: {
      label: 'Sale',
      variant: 'destructive',
      icon: <ArrowUpRight className="h-3.5 w-3.5" />,
    },
    [MovementType.ADJUSTMENT]: {
      label: 'Adjustment',
      variant: 'warning',
      icon: <FileText className="h-3.5 w-3.5" />,
    },
    [MovementType.TRANSFER_IN]: {
      label: 'Transfer In',
      variant: 'info',
      icon: <ArrowDownLeft className="h-3.5 w-3.5" />,
    },
    [MovementType.TRANSFER_OUT]: {
      label: 'Transfer Out',
      variant: 'secondary',
      icon: <ArrowUpRight className="h-3.5 w-3.5" />,
    },
    [MovementType.RETURN]: {
      label: 'Return',
      variant: 'primary',
      icon: <ArrowDownLeft className="h-3.5 w-3.5" />,
    },
    [MovementType.RESERVATION]: {
      label: 'Reservation',
      variant: 'outline',
      icon: <FileText className="h-3.5 w-3.5" />,
    },
    [MovementType.RELEASE]: {
      label: 'Release',
      variant: 'outline',
      icon: <FileText className="h-3.5 w-3.5" />,
    },
  };

  return configs[type] || {
    label: type,
    variant: 'default',
    icon: <FileText className="h-3.5 w-3.5" />,
  };
};

// Helper function to convert StockMovementItem to IData format
const convertStockMovementToIData = (movement: StockMovementItem): IData => {
  const typeInfo = getMovementTypeInfo(movement.movementType);

  return {
    id: movement.id,
    productInfo: {
      sku: movement.sku || '-',
      productName: movement.productName || 'Unknown Product',
      variantName: movement.variantName || '',
    },
    warehouseName: movement.warehouseName || 'Unknown Warehouse',
    movementType: {
      type: movement.movementType,
      label: typeInfo.label,
      variant: typeInfo.variant,
      icon: typeInfo.icon,
    },
    quantity: {
      value: movement.quantity,
      isPositive: movement.quantity > 0,
    },
    reference: {
      type: movement.referenceType,
      id: movement.referenceId,
    },
    userName: movement.userName || 'Unknown User',
    notes: movement.notes,
    createdAt: movement.createdAt,
  };
};

export function StockMovementTable({
  productVariantId,
  warehouseId,
  movementType,
  startDate,
  endDate,
}: StockMovementTableProps) {
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [sorting, setSorting] = useState<SortingState>([
    { id: 'createdAt', desc: true },
  ]);

  // Fetch stock movements with filters (client-side pagination)
  const { data: stockMovements, isLoading, error } = useStockMovements({
    productVariantId,
    warehouseId,
    movementType,
    startDate,
    endDate,
  });

  const data = useMemo(() => {
    if (!stockMovements || stockMovements.length === 0) return [];
    return stockMovements.map(convertStockMovementToIData);
  }, [stockMovements]);

  const columns = useMemo<ColumnDef<IData>[]>(
    () => [
      {
        accessorKey: 'id',
        accessorFn: (row) => row.id,
        header: () => <DataGridTableRowSelectAll />,
        cell: ({ row }) => <DataGridTableRowSelect row={row} />,
        enableSorting: false,
        enableHiding: false,
        enableResizing: false,
        size: 23,
        meta: {
          cellClassName: '',
        },
      },
      {
        id: 'createdAt',
        accessorFn: (row) => row.createdAt,
        header: ({ column }) => (
          <DataGridColumnHeader title="Date" column={column} />
        ),
        cell: (info) => {
          const date = new Date(info.getValue() as string);
          return (
            <div className="flex flex-col gap-0.5">
              <span className="text-sm font-medium">
                {date.toLocaleDateString()}
              </span>
              <span className="text-xs text-muted-foreground">
                {date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          );
        },
        enableSorting: true,
        size: 120,
      },
      {
        id: 'productInfo',
        accessorFn: (row) => row.productInfo,
        header: ({ column }) => (
          <DataGridColumnHeader title="Product" column={column} />
        ),
        cell: (info) => {
          const productInfo = info.getValue() as IData['productInfo'];
          return (
            <div className="flex flex-col gap-1">
              <span className="text-sm font-medium">
                {productInfo.productName}
              </span>
              {productInfo.variantName && (
                <span className="text-xs text-muted-foreground">
                  {productInfo.variantName}
                </span>
              )}
              <span className="text-xs text-muted-foreground font-mono">
                SKU: {productInfo.sku}
              </span>
            </div>
          );
        },
        enableSorting: false,
        size: 220,
      },
      {
        id: 'warehouseName',
        accessorFn: (row) => row.warehouseName,
        header: ({ column }) => (
          <DataGridColumnHeader title="Warehouse" column={column} />
        ),
        cell: (info) => (
          <span className="text-sm">
            {info.getValue() as string}
          </span>
        ),
        enableSorting: false,
        size: 140,
      },
      {
        id: 'movementType',
        accessorFn: (row) => row.movementType,
        header: ({ column }) => (
          <DataGridColumnHeader title="Type" column={column} />
        ),
        cell: (info) => {
          const movement = info.getValue() as IData['movementType'];
          const variant = movement.variant as 'primary' | 'destructive' | 'secondary' | 'outline' | 'success' | 'warning' | 'info';
          return (
            <Badge variant={variant} appearance="light" className="gap-1.5">
              {movement.icon}
              {movement.label}
            </Badge>
          );
        },
        enableSorting: true,
        size: 140,
      },
      {
        id: 'quantity',
        accessorFn: (row) => row.quantity,
        header: ({ column }) => (
          <DataGridColumnHeader title="Quantity" column={column} className="justify-end" />
        ),
        cell: (info) => {
          const quantity = info.getValue() as IData['quantity'];
          return (
            <div className="flex items-center justify-end">
              <span
                className={`text-sm font-semibold ${
                  quantity.isPositive
                    ? 'text-success'
                    : 'text-destructive'
                }`}
              >
                {quantity.isPositive ? '+' : ''}
                {quantity.value}
              </span>
            </div>
          );
        },
        enableSorting: true,
        size: 100,
      },
      {
        id: 'reference',
        accessorFn: (row) => row.reference,
        header: ({ column }) => (
          <DataGridColumnHeader title="Reference" column={column} />
        ),
        cell: (info) => {
          const reference = info.getValue() as IData['reference'];
          if (!reference.type || !reference.id) {
            return <span className="text-sm text-muted-foreground">-</span>;
          }
          return (
            <div className="flex flex-col gap-0.5">
              <span className="text-xs text-muted-foreground">
                {reference.type}
              </span>
              <span className="text-sm font-mono">
                {reference.id.substring(0, 8)}...
              </span>
            </div>
          );
        },
        enableSorting: false,
        size: 130,
      },
      {
        id: 'userName',
        accessorFn: (row) => row.userName,
        header: ({ column }) => (
          <DataGridColumnHeader title="User" column={column} />
        ),
        cell: (info) => (
          <span className="text-sm">
            {info.getValue() as string}
          </span>
        ),
        enableSorting: false,
        size: 120,
      },
      {
        id: 'notes',
        accessorFn: (row) => row.notes,
        header: ({ column }) => (
          <DataGridColumnHeader title="Notes" column={column} />
        ),
        cell: (info) => {
          const notes = info.getValue() as string | null;
          return (
            <span className="text-sm text-muted-foreground truncate max-w-[200px]">
              {notes || '-'}
            </span>
          );
        },
        enableSorting: false,
        size: 200,
      },
      {
        id: 'actions',
        header: () => '',
        enableSorting: false,
        cell: () => {
          return (
            <div className="flex items-center gap-1">
              <Button
                variant="dim"
                mode="icon"
                size="sm"
                title="View details"
              >
                <Eye />
              </Button>
            </div>
          );
        },
        size: 60,
      },
    ],
    [],
  );

  const table = useReactTable({
    data,
    columns,
    state: {
      pagination,
      sorting,
      rowSelection,
    },
    onPaginationChange: setPagination,
    onSortingChange: setSorting,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  return (
    <DataGrid
      table={table}
      recordCount={data.length}
      tableLayout={{
        columnsPinnable: true,
        columnsMovable: true,
        columnsVisibility: true,
        cellBorder: true,
      }}
    >
      <Card>
        <CardTable>
          {isLoading ? (
            <div className="flex items-center justify-center py-10">
              <span className="text-muted-foreground">
                Loading stock movements...
              </span>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-10 gap-2">
              <span className="text-destructive">
                Error loading stock movements
              </span>
              <span className="text-sm text-muted-foreground">
                {error instanceof Error ? error.message : 'Unknown error'}
              </span>
            </div>
          ) : data.length === 0 ? (
            <div className="flex items-center justify-center py-10">
              <span className="text-muted-foreground">
                No stock movements found
              </span>
            </div>
          ) : (
            <ScrollArea>
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
  );
}
