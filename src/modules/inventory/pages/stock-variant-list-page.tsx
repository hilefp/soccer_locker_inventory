import { useState } from 'react';
import { StockVariantListTable } from '../components/stock-variant-list';
import { StockVariantGrid } from '../components/stock-variant-grid';
import { Button } from '@/shared/components/ui/button';
import { Input, InputWrapper } from '@/shared/components/ui/input';
import { LayoutGrid, LayoutList, Search, X } from 'lucide-react';
import { Card, CardHeader, CardToolbar } from '@/shared/components/ui/card';

type ViewMode = 'grid' | 'table';

export function StockVariantListPage() {
  const [viewMode, setViewMode] = useState<ViewMode>('table');
  const [searchQuery, setSearchQuery] = useState('');

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
            <div className="flex items-center ">
              <Button
                variant={viewMode === 'grid' ? 'mono' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('grid')}
                className="gap-2 h-10 px-4"
              >
                <LayoutGrid className="h-5 w-5" />
                <span className="font-medium">Grid</span>
              </Button>
              <Button
                variant={viewMode === 'table' ? 'mono' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('table')}
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
    </div>
  );
}
