import { useCallback, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { StockVariantListTable } from '../components/stock-variant-list';
import { StockVariantGrid } from '../components/stock-variant-grid';
import { Button } from '@/shared/components/ui/button';
import { Input, InputWrapper } from '@/shared/components/ui/input';
import {
  LayoutGrid,
  LayoutList,
  Search,
  X,
  Download,
  Check,
  ChevronDown,
  Tag,
  SlidersHorizontal,
} from 'lucide-react';
import { Card, CardHeader, CardToolbar } from '@/shared/components/ui/card';
import { useDocumentTitle } from '@/shared/hooks/use-document-title';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/shared/components/ui/dialog';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/shared/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/shared/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select';
import { Badge } from '@/shared/components/ui/badge';
import { cn } from '@/shared/lib/utils';
import { useProducts } from '@/modules/products/hooks/use-products';
import { useProductCategories } from '@/modules/products/hooks/use-product-categories';
import { useExportInventory } from '../hooks/use-export-inventory';
import { StockStatus } from '../types/stock-variant.types';

type ViewMode = 'grid' | 'table';

const STATUS_OPTIONS: { label: string; value: StockStatus }[] = [
  { label: 'In Stock', value: StockStatus.IN_STOCK },
  { label: 'Low Stock', value: StockStatus.LOW_STOCK },
  { label: 'Out of Stock', value: StockStatus.OUT_OF_STOCK },
];

export function StockVariantListPage() {
  useDocumentTitle('Stock Variants');
  const [searchParams, setSearchParams] = useSearchParams();
  const [viewMode, setViewMode] = useState<ViewMode>(
    (searchParams.get('view') as ViewMode) || 'table'
  );
  const searchQuery = searchParams.get('search') || '';

  const [exportOpen, setExportOpen] = useState(false);
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);

  // Filter state
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>([]);
  const [selectedStatus, setSelectedStatus] = useState<StockStatus | ''>('');
  const [colorQuery, setColorQuery] = useState('');
  const [saleOnly, setSaleOnly] = useState(false);
  const [categoryOpen, setCategoryOpen] = useState(false);

  const { data: products } = useProducts();
  const { data: categories } = useProductCategories();
  const { exportInventory, isExporting } = useExportInventory();

  const setSearchQuery = useCallback(
    (value: string) => {
      setSearchParams(
        (prev) => {
          if (value) {
            prev.set('search', value);
          } else {
            prev.delete('search');
          }
          return prev;
        },
        { replace: true }
      );
    },
    [setSearchParams]
  );

  const handleViewModeChange = useCallback(
    (mode: ViewMode) => {
      setViewMode(mode);
      setSearchParams(
        (prev) => {
          if (mode !== 'table') {
            prev.set('view', mode);
          } else {
            prev.delete('view');
          }
          return prev;
        },
        { replace: true }
      );
    },
    [setSearchParams]
  );

  const toggleCategory = (id: string) => {
    setSelectedCategoryIds((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    );
  };

  const toggleProduct = (id: string) => {
    setSelectedProductIds((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    );
  };

  const handleExport = async () => {
    await exportInventory(selectedProductIds.length > 0 ? selectedProductIds : undefined);
    setExportOpen(false);
    setSelectedProductIds([]);
  };

  const handleOpenChange = (open: boolean) => {
    setExportOpen(open);
    if (!open) setSelectedProductIds([]);
  };

  const clearFilters = () => {
    setSelectedCategoryIds([]);
    setSelectedStatus('');
    setColorQuery('');
    setSaleOnly(false);
  };

  const activeFilterCount =
    selectedCategoryIds.length +
    (selectedStatus ? 1 : 0) +
    (colorQuery ? 1 : 0) +
    (saleOnly ? 1 : 0);

  const filterProps = {
    categoryIds: selectedCategoryIds.length ? selectedCategoryIds : undefined,
    status: selectedStatus ? (selectedStatus as StockStatus) : undefined,
    color: colorQuery || undefined,
    tags: saleOnly ? ['sale'] : undefined,
  };

  return (
    <div className="container-fluid space-y-5 lg:space-y-9">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Stock Inventory</h1>
          <p className="text-base text-muted-foreground">
            View and manage product variant stock levels across all warehouses
          </p>
        </div>
        <Button variant="outline" onClick={() => setExportOpen(true)} className="gap-2">
          <Download className="h-4 w-4" />
          Export
        </Button>
      </div>

      {/* Toolbar */}
      <Card>
        <CardHeader className="py-4">
          <CardToolbar className="flex flex-col gap-3">
            {/* Row 1: search + view toggle */}
            <div className="flex items-center justify-between gap-4">
              <InputWrapper className="w-full lg:w-[400px] py-4 h-12 rounded-xl">
                <Search className="h-5 w-5" />
                <Input
                  placeholder="Search by SKU or product name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="text-base py-4 h-12 rounded-xl"
                />
                {searchQuery && (
                  <Button
                    variant="dim"
                    size="sm"
                    className="-me-3.5"
                    onClick={() => setSearchQuery('')}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </InputWrapper>

              <div className="flex items-center">
                <Button
                  variant={viewMode === 'grid' ? 'mono' : 'ghost'}
                  size="sm"
                  onClick={() => handleViewModeChange('grid')}
                  className="gap-2 h-10 px-4"
                >
                  <LayoutGrid className="h-5 w-5" />
                  <span className="font-medium">Grid</span>
                </Button>
                <Button
                  variant={viewMode === 'table' ? 'mono' : 'ghost'}
                  size="sm"
                  onClick={() => handleViewModeChange('table')}
                  className="gap-2 h-10 px-4"
                >
                  <LayoutList className="h-5 w-5" />
                  <span className="font-medium">Table</span>
                </Button>
              </div>
            </div>

            {/* Row 2: filters */}
            <div className="flex flex-wrap items-center gap-2">
              <SlidersHorizontal className="h-4 w-4 text-muted-foreground shrink-0" />

              {/* Category multiselect */}
              <Popover open={categoryOpen} onOpenChange={setCategoryOpen}>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="sm" className="h-8 gap-1.5">
                    Categories
                    {selectedCategoryIds.length > 0 && (
                      <Badge variant="secondary" size="sm" className="rounded-full px-1.5">
                        {selectedCategoryIds.length}
                      </Badge>
                    )}
                    <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-56 p-0" align="start">
                  <Command>
                    <CommandInput placeholder="Search categories..." />
                    <CommandList>
                      <CommandEmpty>No categories found.</CommandEmpty>
                      <CommandGroup>
                        {categories?.map((cat) => (
                          <CommandItem
                            key={cat.id}
                            value={cat.name}
                            onSelect={() => toggleCategory(cat.id!)}
                          >
                            <Check
                              className={cn(
                                'mr-2 h-4 w-4',
                                selectedCategoryIds.includes(cat.id!)
                                  ? 'opacity-100'
                                  : 'opacity-0'
                              )}
                            />
                            {cat.name}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>

              {/* Status */}
              <Select
                value={selectedStatus}
                onValueChange={(v) => setSelectedStatus(v === 'all' ? '' : (v as StockStatus))}
              >
                <SelectTrigger className="h-8 w-auto min-w-[130px] text-sm">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All statuses</SelectItem>
                  {STATUS_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Color */}
              <div className="relative">
                <Input
                  placeholder="Color (e.g. navy)"
                  value={colorQuery}
                  onChange={(e) => setColorQuery(e.target.value)}
                  variant="sm"
                  className="h-8 text-sm w-36 pr-7"
                />
                {colorQuery && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-8 w-7 p-0"
                    onClick={() => setColorQuery('')}
                  >
                    <X className="h-3.5 w-3.5" />
                  </Button>
                )}
              </div>

              {/* Sale tag toggle */}
              <Button
                variant={saleOnly ? 'mono' : 'outline'}
                size="sm"
                className="h-8 gap-1.5"
                onClick={() => setSaleOnly((v) => !v)}
              >
                <Tag className="h-3.5 w-3.5" />
                Sale
              </Button>

              {/* Clear filters */}
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
      </Card>

      {/* Content */}
      {viewMode === 'grid' ? (
        <StockVariantGrid searchQuery={searchQuery} {...filterProps} />
      ) : (
        <StockVariantListTable searchQuery={searchQuery} {...filterProps} />
      )}

      {/* Export Dialog */}
      <Dialog open={exportOpen} onOpenChange={handleOpenChange}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>Export Inventory</DialogTitle>
          </DialogHeader>

          <div className="space-y-3 py-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">
                Filter by Products{' '}
                <span className="text-muted-foreground font-normal">(optional)</span>
              </label>
              {selectedProductIds.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 px-2 text-muted-foreground"
                  onClick={() => setSelectedProductIds([])}
                >
                  <X className="h-3 w-3 mr-1" />
                  Clear ({selectedProductIds.length})
                </Button>
              )}
            </div>

            <Command className="rounded-lg border border-border">
              <CommandInput placeholder="Search products..." />
              <CommandList className="max-h-64">
                <CommandEmpty>No products found.</CommandEmpty>
                <CommandGroup>
                  {products?.map((product) => {
                    const allSkus = product.variants?.map((v) => v.sku).join(' ') ?? product.defaultVariant?.sku ?? '';
                    const displaySku = product.defaultVariant?.sku ?? '';
                    return (
                      <CommandItem
                        key={product.id}
                        value={`${product.name} ${allSkus}`}
                        onSelect={() => toggleProduct(product.id!)}
                      >
                        <div className="flex flex-col gap-0.5 min-w-0">
                          <span className="truncate">{product.name}</span>
                          {displaySku && (
                            <span className="text-xs text-muted-foreground">{displaySku}</span>
                          )}
                        </div>
                        <Check
                          className={cn(
                            'ml-auto h-4 w-4 shrink-0',
                            selectedProductIds.includes(product.id!)
                              ? 'opacity-100'
                              : 'opacity-0'
                          )}
                        />
                      </CommandItem>
                    );
                  })}
                </CommandGroup>
              </CommandList>
            </Command>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => handleOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={handleExport} disabled={isExporting} className="gap-2">
              <Download className="h-4 w-4" />
              {isExporting ? 'Exporting…' : 'Export Excel'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
