import { useEffect, useMemo, useState } from 'react';
import { Html5QrcodeSupportedFormats } from 'html5-qrcode';
import { toast } from 'sonner';
import { ProductFilterBar } from '@/modules/products/components/product-filter-bar';
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
import { CodeScannerButton } from '@/shared/components/scanner/code-scanner-button';
import {
  ColumnDef,
  getCoreRowModel,
  PaginationState,
  RowSelectionState,
  useReactTable,
} from '@tanstack/react-table';
import { Package, Search, SlidersHorizontal, X } from 'lucide-react';
import {
  useStockVariantByBarcode,
  useStockVariants,
} from '../hooks/use-stock-variants';
import { StockStatus, StockVariantItem } from '../types/stock-variant.types';

const BARCODE_FORMATS = [
  Html5QrcodeSupportedFormats.UPC_A,
  Html5QrcodeSupportedFormats.UPC_E,
  Html5QrcodeSupportedFormats.EAN_13,
  Html5QrcodeSupportedFormats.EAN_8,
  Html5QrcodeSupportedFormats.CODE_128,
];

const statusLabels: Record<StockStatus, { label: string; variant: 'success' | 'warning' | 'destructive' }> = {
  [StockStatus.IN_STOCK]: { label: 'In Stock', variant: 'success' },
  [StockStatus.LOW_STOCK]: { label: 'Low Stock', variant: 'warning' },
  [StockStatus.OUT_OF_STOCK]: { label: 'Out of Stock', variant: 'destructive' },
};

interface AddProductsToEntryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Variant IDs already added to the entry (hidden from the list) */
  existingVariantIds: string[];
  /** Called with the selected variants; the parent appends/increments rows */
  onAdd: (variants: StockVariantItem[]) => void;
}

export function AddProductsToEntryDialog({
  open,
  onOpenChange,
  existingVariantIds,
  onAdd,
}: AddProductsToEntryDialogProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>([]);
  const [selectedBrandId, setSelectedBrandId] = useState('');
  const [selectedSizeType, setSelectedSizeType] = useState('');
  const [colorQuery, setColorQuery] = useState('');
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });
  // Selected variants are kept by ID so selections survive page/filter changes
  const [selectedVariants, setSelectedVariants] = useState<
    Record<string, StockVariantItem>
  >({});

  const lookupBarcode = useStockVariantByBarcode();

  // Debounce the search input before hitting the API
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchQuery.trim()), 350);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Reset to the first page whenever search or filters change
  useEffect(() => {
    setPagination((prev) =>
      prev.pageIndex === 0 ? prev : { ...prev, pageIndex: 0 }
    );
  }, [debouncedSearch, selectedCategoryIds, selectedBrandId, selectedSizeType, colorQuery]);

  const { data: variantsResponse, isLoading } = useStockVariants({
    page: pagination.pageIndex + 1,
    limit: pagination.pageSize,
    search: debouncedSearch || undefined,
    categoryIds: selectedCategoryIds.length > 0 ? selectedCategoryIds : undefined,
    brandId: selectedBrandId || undefined,
    sizeType: selectedSizeType || undefined,
    color: colorQuery.trim() || undefined,
  });

  const pageData = useMemo(
    () =>
      (variantsResponse?.data || []).filter(
        (v) => !existingVariantIds.includes(v.productVariantId)
      ),
    [variantsResponse, existingVariantIds]
  );

  const rowSelection = useMemo<RowSelectionState>(
    () =>
      Object.fromEntries(Object.keys(selectedVariants).map((id) => [id, true])),
    [selectedVariants]
  );

  const columns = useMemo<ColumnDef<StockVariantItem>[]>(
    () => [
      {
        accessorKey: 'productVariantId',
        header: () => <DataGridTableRowSelectAll />,
        cell: ({ row }) => <DataGridTableRowSelect row={row} />,
        enableSorting: false,
        enableHiding: false,
        size: 23,
      },
      {
        id: 'productInfo',
        accessorFn: (row) => row.productName,
        header: ({ column }) => (
          <DataGridColumnHeader title="Product" column={column} />
        ),
        cell: ({ row }) => {
          const variant = row.original;
          return (
            <div className="flex items-center gap-2.5">
              <div className="flex items-center justify-center rounded-md bg-accent/50 h-[40px] w-[50px] shrink-0">
                {variant.imageUrl ? (
                  <img
                    src={variant.imageUrl}
                    className="h-[30px] w-full object-contain"
                    alt={variant.productName}
                  />
                ) : (
                  <Package className="size-5 text-muted-foreground" />
                )}
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-sm font-medium">
                  {variant.productName}
                </span>
                <span className="text-xs text-muted-foreground">
                  SKU: {variant.sku}
                  {variant.variantName ? ` | ${variant.variantName}` : ''}
                </span>
              </div>
            </div>
          );
        },
        enableSorting: false,
        size: 300,
      },
      {
        id: 'category',
        accessorFn: (row) => row.categoryName || '-',
        header: ({ column }) => (
          <DataGridColumnHeader title="Category" column={column} />
        ),
        cell: ({ row }) => (
          <span className="text-sm">{row.original.categoryName || '-'}</span>
        ),
        enableSorting: false,
        size: 140,
      },
      {
        id: 'stock',
        accessorFn: (row) => row.totalAvailable,
        header: ({ column }) => (
          <DataGridColumnHeader title="Available" column={column} />
        ),
        cell: ({ row }) => (
          <span className="text-sm font-medium">
            {row.original.totalAvailable}
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
        cell: ({ row }) => {
          const status = statusLabels[row.original.status];
          return (
            <Badge variant={status.variant} appearance="light">
              {status.label}
            </Badge>
          );
        },
        enableSorting: false,
        size: 110,
      },
    ],
    []
  );

  const table = useReactTable({
    data: pageData,
    columns,
    state: {
      pagination,
      rowSelection,
    },
    manualPagination: true,
    pageCount: variantsResponse?.meta.totalPages ?? -1,
    onPaginationChange: setPagination,
    onRowSelectionChange: (updater) => {
      const next =
        typeof updater === 'function' ? updater(rowSelection) : updater;
      setSelectedVariants((prev) => {
        const result: Record<string, StockVariantItem> = {};
        for (const id of Object.keys(next)) {
          if (!next[id]) continue;
          const known =
            prev[id] || pageData.find((v) => v.productVariantId === id);
          if (known) {
            result[id] = known;
          }
        }
        return result;
      });
    },
    getCoreRowModel: getCoreRowModel(),
    getRowId: (row) => row.productVariantId,
  });

  const toggleCategory = (id: string) => {
    setSelectedCategoryIds((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    );
  };

  const activeFilterCount =
    selectedCategoryIds.length +
    (selectedBrandId ? 1 : 0) +
    (selectedSizeType ? 1 : 0) +
    (colorQuery ? 1 : 0);

  const clearFilters = () => {
    setSelectedCategoryIds([]);
    setSelectedBrandId('');
    setSelectedSizeType('');
    setColorQuery('');
  };

  const handleBarcodeScan = async (raw: string) => {
    const cleaned = raw.trim().replace(/\D/g, '');
    if (!cleaned) {
      toast.error('Invalid barcode');
      return;
    }

    try {
      const result = await lookupBarcode.mutateAsync(cleaned);
      const scanned = result.variants.data.find(
        (v) => v.productVariantId === result.variant.id
      );
      if (!scanned) {
        toast.error('Scanned product not found in inventory');
        return;
      }
      onAdd([scanned]);
      toast.success(`${scanned.productName} (${scanned.sku}) added`);
    } catch (error: any) {
      if (error?.response?.status === 404) {
        toast.error('Barcode not registered to any product');
      } else {
        toast.error('Failed to look up barcode');
      }
    }
  };

  const handleAddSelected = () => {
    const variants = Object.values(selectedVariants);
    if (variants.length === 0) return;

    onAdd(variants);
    setSelectedVariants({});
    onOpenChange(false);
  };

  const handleClose = () => {
    setSelectedVariants({});
    setSearchQuery('');
    clearFilters();
    onOpenChange(false);
  };

  const selectedCount = Object.keys(selectedVariants).length;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl h-[80vh] flex flex-col overflow-hidden overflow-y-hidden">
        <DialogHeader>
          <DialogTitle>Add Products to Entry</DialogTitle>
          <DialogDescription>
            Search by name or SKU, scan a barcode, and select the products to
            add to this stock entry.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 min-h-0 overflow-hidden flex flex-col">
          <DataGrid
            table={table}
            recordCount={variantsResponse?.meta.total || 0}
            tableLayout={{
              cellBorder: true,
            }}
          >
            <Card className="flex-1 min-h-0">
              <CardHeader className="py-3.5 shrink-0">
                <CardToolbar className="flex flex-col items-stretch gap-3">
                  {/* Row 1: search + scan */}
                  <div className="flex items-center gap-2">
                    <InputWrapper className="w-full lg:w-[300px]">
                      <Search />
                      <Input
                        placeholder="Search by name or SKU..."
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
                    <CodeScannerButton
                      onScan={handleBarcodeScan}
                      label="Scan"
                      title="Scan Product Barcode"
                      helperText="Point the camera at the product barcode"
                      formats={BARCODE_FORMATS}
                      scannerId="stock-entry-dialog-scanner"
                    />
                    {selectedCount > 0 && (
                      <span className="text-sm text-muted-foreground">
                        {selectedCount} selected
                      </span>
                    )}
                  </div>

                  {/* Row 2: filters */}
                  <div className="flex flex-wrap items-center gap-2">
                    <SlidersHorizontal className="h-4 w-4 text-muted-foreground shrink-0" />
                    <ProductFilterBar
                      values={{
                        categoryIds: selectedCategoryIds,
                        brandId: selectedBrandId,
                        sizeType: selectedSizeType,
                        color: colorQuery,
                      }}
                      onToggleCategory={toggleCategory}
                      onBrandChange={setSelectedBrandId}
                      onSizeTypeChange={setSelectedSizeType}
                      onColorChange={setColorQuery}
                    />
                    {activeFilterCount > 0 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 text-muted-foreground gap-1"
                        onClick={clearFilters}
                      >
                        <X className="h-3.5 w-3.5" />
                        Clear ({activeFilterCount})
                      </Button>
                    )}
                  </div>
                </CardToolbar>
              </CardHeader>
              <CardTable className="min-h-0 grow flex flex-col">
                {isLoading ? (
                  <div className="flex items-center justify-center py-10">
                    <span className="text-muted-foreground">
                      Loading products...
                    </span>
                  </div>
                ) : pageData.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 gap-4">
                    <Package className="size-12 text-muted-foreground" />
                    <p className="text-muted-foreground">
                      {debouncedSearch || activeFilterCount > 0
                        ? 'No products found matching your search'
                        : 'No products available'}
                    </p>
                  </div>
                ) : (
                  <ScrollArea className="flex-1 min-h-0">
                    <DataGridTable />
                    <ScrollBar orientation="horizontal" />
                  </ScrollArea>
                )}
              </CardTable>
              <CardFooter className="shrink-0">
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
            disabled={selectedCount === 0}
          >
            {`Add ${selectedCount} Product${selectedCount !== 1 ? 's' : ''}`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
