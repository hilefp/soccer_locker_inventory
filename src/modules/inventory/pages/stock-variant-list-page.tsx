import { useCallback, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { StockVariantListTable } from '../components/stock-variant-list';
import { StockVariantGrid } from '../components/stock-variant-grid';
import { Button } from '@/shared/components/ui/button';
import { Input, InputWrapper } from '@/shared/components/ui/input';
import { LayoutGrid, LayoutList, Search, X, Download, Check } from 'lucide-react';
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
import { cn } from '@/shared/lib/utils';
import { useProducts } from '@/modules/products/hooks/use-products';
import { useExportInventory } from '../hooks/use-export-inventory';

type ViewMode = 'grid' | 'table';

export function StockVariantListPage() {
  useDocumentTitle('Stock Variants');
  const [searchParams, setSearchParams] = useSearchParams();
  const [viewMode, setViewMode] = useState<ViewMode>(
    (searchParams.get('view') as ViewMode) || 'table'
  );
  const searchQuery = searchParams.get('search') || '';

  const [exportOpen, setExportOpen] = useState(false);
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);

  const { data: products } = useProducts();
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
          <CardToolbar className="flex items-center justify-between gap-4">
            {/* Search */}
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

            {/* View Toggle */}
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
          </CardToolbar>
        </CardHeader>
      </Card>

      {/* Content */}
      {viewMode === 'grid' ? (
        <StockVariantGrid searchQuery={searchQuery} />
      ) : (
        <StockVariantListTable searchQuery={searchQuery} />
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
