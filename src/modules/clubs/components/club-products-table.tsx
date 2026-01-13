import { useMemo, useState } from 'react';
import { ClubProduct } from '../types/club-product';
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
import {
  DataGridTable,
  DataGridTableRowSelect,
  DataGridTableRowSelectAll,
} from '@/shared/components/ui/data-grid-table';
import { Input, InputWrapper } from '@/shared/components/ui/input';
import { ScrollArea, ScrollBar } from '@/shared/components/ui/scroll-area';
import {
  ColumnDef,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  PaginationState,
  RowSelectionState,
  SortingState,
  useReactTable,
} from '@tanstack/react-table';
import { Package, Search, SquarePen, Trash, X } from 'lucide-react';
import { useRemoveClubProduct } from '../hooks/use-club-products';

interface ClubProductsTableProps {
  clubId: string;
  clubProducts?: ClubProduct[];
  isLoading?: boolean;
  error?: string | null;
  onEditProduct?: (clubProduct: ClubProduct) => void;
}

// Helper to format price
const formatPrice = (price: number | null | undefined): string => {
  if (price === null || price === undefined) return '-';
  return Number(price).toFixed(2);
};

export function ClubProductsTable({
  clubId,
  clubProducts = [],
  isLoading = false,
  error = null,
  onEditProduct,
}: ClubProductsTableProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [sorting, setSorting] = useState<SortingState>([
    { id: 'productInfo', desc: false },
  ]);

  const removeMutation = useRemoveClubProduct(clubId);

  const columns = useMemo<ColumnDef<ClubProduct>[]>(
    () => [
      {
        accessorKey: 'id',
        header: () => <DataGridTableRowSelectAll />,
        cell: ({ row }) => <DataGridTableRowSelect row={row} />,
        enableSorting: false,
        enableHiding: false,
        size: 23,
      },
      {
        id: 'productInfo',
        accessorFn: (row) => row.name || row.product?.name,
        header: ({ column }) => (
          <DataGridColumnHeader title="Product" column={column} />
        ),
        cell: ({ row }) => {
          const clubProduct = row.original;
          const displayName = clubProduct.name || clubProduct.product?.name;
          const isCustomName = !!clubProduct.name;
          const imageUrl =
            clubProduct.imageUrls && clubProduct.imageUrls.length > 0
              ? clubProduct.imageUrls[0]
              : clubProduct.product?.imageUrls?.[0];

          return (
            <div className="flex items-center gap-2.5">
              <div className="flex items-center justify-center rounded-md bg-accent/50 h-[40px] w-[50px] shrink-0">
                {imageUrl ? (
                  <img
                    src={imageUrl}
                    className="h-[30px] w-full object-contain"
                    alt={displayName}
                  />
                ) : (
                  <Package className="size-5 text-muted-foreground" />
                )}
              </div>
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <span
                    className={`text-sm ${isCustomName ? 'font-semibold' : 'font-medium'}`}
                  >
                    {displayName}
                  </span>
                  {isCustomName && (
                    <Badge variant="outline" className="text-xs">
                      Custom
                    </Badge>
                  )}
                </div>
                <span className="text-xs text-muted-foreground">
                  SKU: {clubProduct.product?.defaultVariant?.sku || 'N/A'}
                </span>
                {isCustomName && clubProduct.product?.name && (
                  <span className="text-xs text-muted-foreground">
                    Base: {clubProduct.product.name}
                  </span>
                )}
              </div>
            </div>
          );
        },
        enableSorting: true,
        size: 250,
      },
      {
        id: 'price',
        accessorFn: (row) => row.price || row.product?.defaultVariant?.price,
        header: ({ column }) => (
          <DataGridColumnHeader title="Price" column={column} />
        ),
        cell: ({ row }) => {
          const clubProduct = row.original;
          const clubPrice = clubProduct.price;
          const basePrice = clubProduct.product?.defaultVariant?.price;
          const isCustomPrice = clubPrice !== null && clubPrice !== undefined;

          // Display club price if it's a string (could be a range), otherwise format the base price
          const displayPrice = isCustomPrice
            ? (typeof clubPrice === 'string' ? clubPrice : `$${formatPrice(clubPrice)}`)
            : (basePrice ? `$${formatPrice(basePrice)}` : '-');

          const basePriceDisplay = basePrice ? `$${formatPrice(basePrice)}` : null;

          return (
            <div className="flex flex-col gap-0.5">
              <div className="flex items-center gap-2">
                <span
                  className={`text-sm ${isCustomPrice ? 'font-semibold' : 'font-medium'}`}
                >
                  {displayPrice}
                </span>
                {isCustomPrice && (
                  <Badge variant="outline" className="text-xs">
                    Custom
                  </Badge>
                )}
              </div>
              {isCustomPrice && basePriceDisplay && (
                <span className="text-xs text-muted-foreground">
                  Base: {basePriceDisplay}
                </span>
              )}
            </div>
          );
        },
        enableSorting: true,
        size: 120,
      },
      {
        id: 'status',
        accessorFn: (row) => row.isActive,
        header: ({ column }) => (
          <DataGridColumnHeader title="Status" column={column} />
        ),
        cell: ({ row }) => {
          const isActive = row.original.isActive;
          return (
            <Badge
              variant={isActive ? 'success' : 'secondary'}
              appearance="light"
            >
              {isActive ? 'Active' : 'Inactive'}
            </Badge>
          );
        },
        enableSorting: true,
        size: 80,
      },
      {
        id: 'actions',
        header: () => '',
        enableSorting: false,
        cell: ({ row }) => {
          const clubProduct = row.original;

          const handleEdit = () => {
            if (onEditProduct) {
              onEditProduct(clubProduct);
            }
          };

          const handleDelete = async () => {
            if (!clubProduct.id) return;

            if (
              !confirm(
                `Are you sure you want to remove "${clubProduct.name || clubProduct.product?.name}" from this club? This action cannot be undone.`
              )
            ) {
              return;
            }

            try {
              await removeMutation.mutateAsync(clubProduct.id);
            } catch (error) {
              console.error('Delete error:', error);
            }
          };

          return (
            <div className="flex items-center gap-1">
              <Button
                variant="dim"
                mode="icon"
                size="sm"
                onClick={handleEdit}
                title="Edit club product"
              >
                <SquarePen />
              </Button>
              <Button
                variant="dim"
                mode="icon"
                size="sm"
                onClick={handleDelete}
                title="Remove from club"
              >
                <Trash />
              </Button>
            </div>
          );
        },
        size: 60,
      },
    ],
    [onEditProduct, removeMutation]
  );

  const filteredData = useMemo(() => {
    if (!searchQuery) {
      return clubProducts;
    }
    const query = searchQuery.toLowerCase();
    return clubProducts.filter(
      (cp) =>
        cp?.name?.toLowerCase().includes(query) ||
        cp?.product?.name?.toLowerCase().includes(query) ||
        cp?.product?.defaultVariant?.sku?.toLowerCase().includes(query) ||
        cp?.description?.toLowerCase().includes(query)
    );
  }, [clubProducts, searchQuery]);

  const table = useReactTable({
    data: filteredData,
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
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  return (
    <DataGrid
      table={table}
      recordCount={filteredData?.length || 0}
      tableLayout={{
        columnsPinnable: true,
        columnsMovable: true,
        columnsVisibility: true,
        cellBorder: true,
      }}
    >
      <Card>
        <CardHeader className="py-3.5">
          <CardToolbar className="flex items-center gap-2">
            <InputWrapper className="w-full lg:w-[250px]">
              <Search />
              <Input
                placeholder="Search products..."
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
                Loading club products...
              </span>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-10 gap-2">
              <span className="text-destructive">
                Error loading club products
              </span>
              <span className="text-sm text-muted-foreground">{error}</span>
            </div>
          ) : filteredData.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 gap-4">
              <Package className="size-12 text-muted-foreground" />
              <p className="text-muted-foreground">
                {searchQuery
                  ? 'No products found matching your search'
                  : 'No products added to this club yet'}
              </p>
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
