import { useCallback, useEffect, useMemo, useState } from 'react';
import { useStockVariants } from '@/modules/inventory/hooks/use-stock-variants';
import {
  StockVariantItem,
  StockStatus,
} from '@/modules/inventory/types/stock-variant.types';
import { Badge, BadgeProps } from '@/shared/components/ui/badge';
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
import { toAbsoluteUrl } from '@/shared/lib/helpers';
import {
  Column,
  ColumnDef,
  getCoreRowModel,
  PaginationState,
  RowSelectionState,
  SortingState,
  useReactTable,
} from '@tanstack/react-table';
import { Eye, Package } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

interface IColumnFilterProps<TData, TValue> {
  column: Column<TData, TValue>;
}

export interface IData {
  productVariantId: string;
  productId: string;
  sku: string;
  productInfo: {
    image: string | null;
    title: string;
    label: string;
  };
  categoryName: string | null;
  totalQuantity: number;
  totalReserved: number;
  totalAvailable: number;
  warehouseCount: number;
  lastMovement: string | null;
  status: {
    label: string;
    variant: string;
  };
}

interface StockVariantListProps {
  warehouseId?: string;
  productId?: string;
  categoryId?: string;
  searchQuery?: string;
}

// Helper function to convert StockVariantItem to IData format
const convertStockVariantToIData = (variant: StockVariantItem): IData => {
  const getStatusVariant = (status: StockStatus): string => {
    switch (status) {
      case StockStatus.IN_STOCK:
        return 'success';
      case StockStatus.LOW_STOCK:
        return 'warning';
      case StockStatus.OUT_OF_STOCK:
        return 'destructive';
      default:
        return 'default';
    }
  };

  const getStatusLabel = (status: StockStatus): string => {
    switch (status) {
      case StockStatus.IN_STOCK:
        return 'In Stock';
      case StockStatus.LOW_STOCK:
        return 'Low Stock';
      case StockStatus.OUT_OF_STOCK:
        return 'Out of Stock';
      default:
        return 'Unknown';
    }
  };

  return {
    productVariantId: variant.productVariantId,
    productId: variant.productId,
    sku: variant.sku,
    productInfo: {
      image: variant.imageUrl,
      title: variant.productName,
      label: variant.variantName,
    },
    categoryName: variant.categoryName,
    totalQuantity: variant.totalQuantity,
    totalReserved: variant.totalReserved,
    totalAvailable: variant.totalAvailable,
    warehouseCount: variant.warehouseCount,
    lastMovement: variant.lastMovement,
    status: {
      label: getStatusLabel(variant.status),
      variant: getStatusVariant(variant.status),
    },
  };
};

export function StockVariantListTable({
  warehouseId,
  productId,
  categoryId,
  searchQuery = '',
}: StockVariantListProps) {
  const navigate = useNavigate();
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [sorting, setSorting] = useState<SortingState>([
    { id: 'productName', desc: false },
  ]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      if (searchQuery !== debouncedSearch) {
        setPagination((prev) => ({ ...prev, pageIndex: 0 }));
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery, debouncedSearch]);

  // Fetch stock variants with pagination and filters
  const { data: stockVariantsResponse, isLoading, error } = useStockVariants({
    page: pagination.pageIndex + 1,
    limit: pagination.pageSize,
    search: debouncedSearch || undefined,
    warehouseId,
    productId,
    categoryId,
    sortBy: sorting[0]?.id as 'sku' | 'productName' | 'totalQuantity' | 'lastMovement' | undefined,
    sortOrder: sorting[0]?.desc ? 'desc' : 'asc',
  });

  const data = useMemo(() => {
    if (!stockVariantsResponse?.data || stockVariantsResponse.data.length === 0) return [];
    return stockVariantsResponse.data.map(convertStockVariantToIData);
  }, [stockVariantsResponse?.data]);

  const handleVariantClick = useCallback((variant: IData) => {
    navigate(`/inventory/stocks/variant/${variant.productVariantId}`);
  }, [navigate]);

  const columns = useMemo<ColumnDef<IData>[]>(
    () => [
      {
        accessorKey: 'productVariantId',
        accessorFn: (row) => row.productVariantId,
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
        id: 'sku',
        accessorFn: (row) => row.sku,
        header: ({ column }) => (
          <DataGridColumnHeader title="SKU" column={column} />
        ),
        cell: (info) => (
          <span className="text-sm font-medium">
            {info.getValue() as string}
          </span>
        ),
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
          const productInfo = info.row.getValue(
            'productInfo',
          ) as IData['productInfo'];

          return (
            <div className="flex items-center gap-2.5">
              <Card className="flex items-center justify-center rounded-md bg-accent/50 h-[40px] w-[50px] shadow-none shrink-0">
                {productInfo.image ? (
                  <img
                    src={productInfo.image}
                    className="cursor-pointer h-[30px] w-full object-contain"
                    alt="product"
                  />
                ) : (
                  <Package className="h-6 w-6 text-muted-foreground" />
                )}
              </Card>
              <div className="flex flex-col gap-1">
                <Link
                  to={`/inventory/stocks/variant/${info.row.original.productVariantId}`}
                  className="text-sm font-medium tracking-[-1%] cursor-pointer hover:text-primary"
                >
                  {productInfo.title}
                </Link>
                <span className="text-xs text-muted-foreground">
                  {productInfo.label}
                </span>
              </div>
            </div>
          );
        },
        enableSorting: true,
        size: 200,
      },
      {
        id: 'categoryName',
        accessorFn: (row) => row.categoryName,
        header: ({ column }) => (
          <DataGridColumnHeader title="Category" column={column} />
        ),
        cell: (info) => (
          <span className="text-sm">
            {(info.getValue() as string) || '-'}
          </span>
        ),
        enableSorting: false,
        size: 120,
      },
      {
        id: 'totalQuantity',
        accessorFn: (row) => row.totalQuantity,
        header: ({ column }) => (
          <DataGridColumnHeader title="Total Qty" column={column} />
        ),
        cell: (info) => (
          <span className="text-sm font-medium">
            {info.getValue() as number}
          </span>
        ),
        enableSorting: true,
        size: 80,
      },
      {
        id: 'totalReserved',
        accessorFn: (row) => row.totalReserved,
        header: ({ column }) => (
          <DataGridColumnHeader title="Reserved" column={column} />
        ),
        cell: (info) => (
          <span className="text-sm text-muted-foreground">
            {info.getValue() as number}
          </span>
        ),
        enableSorting: false,
        size: 80,
      },
      {
        id: 'totalAvailable',
        accessorFn: (row) => row.totalAvailable,
        header: ({ column }) => (
          <DataGridColumnHeader title="Available" column={column} />
        ),
        cell: (info) => (
          <span className="text-sm font-medium text-success">
            {info.getValue() as number}
          </span>
        ),
        enableSorting: false,
        size: 80,
      },
      {
        id: 'warehouseCount',
        accessorFn: (row) => row.warehouseCount,
        header: ({ column }) => (
          <DataGridColumnHeader title="Warehouses" column={column} />
        ),
        cell: (info) => (
          <span className="text-sm">
            {info.getValue() as number}
          </span>
        ),
        enableSorting: false,
        size: 90,
      },
      {
        id: 'status',
        accessorFn: (row) => row.status,
        header: ({ column }) => (
          <DataGridColumnHeader title="Status" column={column} />
        ),
        cell: (info) => {
          const status = info.row.original.status;
          const variant = status.variant as 'primary' | 'destructive' | 'secondary' | 'outline' | 'success' | 'warning' | 'info';
          return (
            <Badge variant={variant} appearance="light">
              {status.label}
            </Badge>
          );
        },
        enableSorting: false,
        size: 100,
      },
      {
        id: 'lastMovement',
        accessorFn: (row) => row.lastMovement,
        header: ({ column }) => (
          <DataGridColumnHeader title="Last Movement" column={column} />
        ),
        cell: (info) => {
          const date = info.getValue() as string | null;
          return (
            <span className="text-sm text-muted-foreground">
              {date ? new Date(date).toLocaleDateString() : '-'}
            </span>
          );
        },
        enableSorting: true,
        size: 120,
      },
      {
        id: 'actions',
        header: () => '',
        enableSorting: false,
        cell: ({ row }) => {
          const handleView = () => {
            handleVariantClick(row.original);
          };

          return (
            <div className="flex items-center gap-1">
              <Button
                variant="dim"
                mode="icon"
                size="sm"
                onClick={handleView}
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
    [handleVariantClick],
  );

  const table = useReactTable({
    data,
    columns,
    state: {
      pagination,
      sorting,
      rowSelection,
    },
    manualPagination: true,
    manualSorting: true,
    pageCount: stockVariantsResponse?.meta?.totalPages ?? -1,
    onPaginationChange: setPagination,
    onSortingChange: setSorting,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <DataGrid
      table={table}
      recordCount={stockVariantsResponse?.meta?.total || 0}
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
                Loading stock variants...
              </span>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-10 gap-2">
              <span className="text-destructive">
                Error loading stock variants
              </span>
              <span className="text-sm text-muted-foreground">
                {error instanceof Error ? error.message : 'Unknown error'}
              </span>
            </div>
          ) : data.length === 0 ? (
            <div className="flex items-center justify-center py-10">
              <span className="text-muted-foreground">
                {searchQuery
                  ? 'No stock variants found matching your search'
                  : 'No stock variants yet'}
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
