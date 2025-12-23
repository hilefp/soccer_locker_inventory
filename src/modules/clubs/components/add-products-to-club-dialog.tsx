import { useMemo, useState } from 'react';
import { useProducts } from '@/modules/products/hooks/use-products';
import { Product } from '@/modules/products/types/product.type';
import { ClubProduct } from '../types/club-product';
import { useAddProductsToClub } from '../hooks/use-club-products';
import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog';
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
import { Package, Search, X } from 'lucide-react';

interface AddProductsToClubDialogProps {
  clubId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  existingClubProducts?: ClubProduct[];
}

// Helper to format price
const formatPrice = (price: number | null | undefined): string => {
  if (price === null || price === undefined) return '-';
  return Number(price).toFixed(2);
};

export function AddProductsToClubDialog({
  clubId,
  open,
  onOpenChange,
  existingClubProducts = [],
}: AddProductsToClubDialogProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [sorting, setSorting] = useState<SortingState>([
    { id: 'name', desc: false },
  ]);

  // Fetch all products
  const { data: allProducts = [], isLoading } = useProducts();
  const addProductsMutation = useAddProductsToClub(clubId);

  // Filter out already added products
  const existingProductIds = useMemo(
    () => new Set(existingClubProducts.map((cp) => cp.productId)),
    [existingClubProducts]
  );

  const availableProducts = useMemo(
    () => allProducts.filter((p) => p.id && !existingProductIds.has(p.id)),
    [allProducts, existingProductIds]
  );

  const columns = useMemo<ColumnDef<Product>[]>(
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
        accessorFn: (row) => row.name,
        header: ({ column }) => (
          <DataGridColumnHeader title="Product" column={column} />
        ),
        cell: ({ row }) => {
          const product = row.original;
          const imageUrl =
            product.imageUrls && product.imageUrls.length > 0
              ? product.imageUrls[0]
              : null;

          return (
            <div className="flex items-center gap-2.5">
              <div className="flex items-center justify-center rounded-md bg-accent/50 h-[40px] w-[50px] shrink-0">
                {imageUrl ? (
                  <img
                    src={imageUrl}
                    className="h-[30px] w-full object-contain"
                    alt={product.name}
                  />
                ) : (
                  <Package className="size-5 text-muted-foreground" />
                )}
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-sm font-medium">{product.name}</span>
                <span className="text-xs text-muted-foreground">
                  SKU: {product.defaultVariant?.sku || 'N/A'}
                </span>
              </div>
            </div>
          );
        },
        enableSorting: true,
        size: 250,
      },
      {
        id: 'category',
        accessorFn: (row) => row.category?.name || '-',
        header: ({ column }) => (
          <DataGridColumnHeader title="Category" column={column} />
        ),
        cell: ({ row }) => {
          const category = row.original.category?.name;
          return (
            <span className="text-sm">{category || '-'}</span>
          );
        },
        enableSorting: true,
        size: 150,
      },
      {
        id: 'brand',
        accessorFn: (row) => row.brand?.name || '-',
        header: ({ column }) => (
          <DataGridColumnHeader title="Brand" column={column} />
        ),
        cell: ({ row }) => {
          const brand = row.original.brand?.name;
          return (
            <span className="text-sm">{brand || '-'}</span>
          );
        },
        enableSorting: true,
        size: 150,
      },
      {
        id: 'price',
        accessorFn: (row) => row.defaultVariant?.price,
        header: ({ column }) => (
          <DataGridColumnHeader title="Base Price" column={column} />
        ),
        cell: ({ row }) => {
          const price = row.original.defaultVariant?.price;
          return (
            <span className="text-sm font-medium">
              ${formatPrice(price)}
            </span>
          );
        },
        enableSorting: true,
        size: 100,
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
    ],
    []
  );

  const filteredData = useMemo(() => {
    if (!searchQuery) {
      return availableProducts;
    }
    const query = searchQuery.toLowerCase();
    return availableProducts.filter(
      (p) =>
        p?.name?.toLowerCase().includes(query) ||
        p?.defaultVariant?.sku?.toLowerCase().includes(query) ||
        p?.category?.name?.toLowerCase().includes(query) ||
        p?.brand?.name?.toLowerCase().includes(query)
    );
  }, [availableProducts, searchQuery]);

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
    getRowId: (row) => row.id || '',
  });

  const handleAddSelected = async () => {
    const selectedProducts = table
      .getSelectedRowModel()
      .rows.map((row) => row.original);

    if (selectedProducts.length === 0) {
      return;
    }

    try {
      await addProductsMutation.mutateAsync({
        products: selectedProducts.map((p) => ({
          productId: p.id!,
          stock: 0,
          isActive: true,
        })),
      });
      // Reset selection and close dialog
      setRowSelection({});
      onOpenChange(false);
    } catch (error) {
      console.error('Error adding products:', error);
    }
  };

  const handleClose = () => {
    setRowSelection({});
    setSearchQuery('');
    onOpenChange(false);
  };

  const selectedCount = Object.keys(rowSelection).length;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Add Products to Club</DialogTitle>
          <DialogDescription>
            Select products to add to this club. You can customize pricing and
            details after adding.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-hidden">
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
                  <InputWrapper className="w-full lg:w-[300px]">
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
                  {selectedCount > 0 && (
                    <span className="text-sm text-muted-foreground">
                      {selectedCount} selected
                    </span>
                  )}
                </CardToolbar>
              </CardHeader>
              <CardTable>
                {isLoading ? (
                  <div className="flex items-center justify-center py-10">
                    <span className="text-muted-foreground">
                      Loading products...
                    </span>
                  </div>
                ) : filteredData.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 gap-4">
                    <Package className="size-12 text-muted-foreground" />
                    <p className="text-muted-foreground">
                      {searchQuery
                        ? 'No products found matching your search'
                        : 'All products have been added to this club'}
                    </p>
                  </div>
                ) : (
                  <ScrollArea className="h-[400px]">
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
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={handleClose}>
            Cancel
          </Button>
          <Button
            variant="mono"
            onClick={handleAddSelected}
            disabled={selectedCount === 0 || addProductsMutation.isPending}
          >
            {addProductsMutation.isPending
              ? 'Adding...'
              : `Add ${selectedCount} Product${selectedCount !== 1 ? 's' : ''}`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
