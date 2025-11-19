import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStockVariants } from '@/modules/inventory/hooks/use-stock-variants';
import {
  StockVariantItem,
  StockStatus,
} from '@/modules/inventory/types/stock-variant.types';
import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent, CardFooter } from '@/shared/components/ui/card';
import { toAbsoluteUrl } from '@/shared/lib/helpers';
import { Package, MapPin, TrendingUp, AlertTriangle, Eye, ChevronLeft, ChevronRight } from 'lucide-react';

interface StockVariantGridProps {
  warehouseId?: string;
  productId?: string;
  categoryId?: string;
  searchQuery: string;
  pageSize?: number;
}

const getStatusBadgeVariant = (status: StockStatus) => {
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

export function StockVariantGrid({
  warehouseId,
  productId,
  categoryId,
  searchQuery,
  pageSize = 12,
}: StockVariantGridProps) {
  const navigate = useNavigate();
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      if (searchQuery !== debouncedSearch) {
        setCurrentPage(1);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery, debouncedSearch]);

  // Fetch stock variants with pagination and filters
  const { data: stockVariantsResponse, isLoading, error } = useStockVariants({
    page: currentPage,
    limit: pageSize,
    search: debouncedSearch || undefined,
    warehouseId,
    productId,
    categoryId,
    sortBy: 'productName',
    sortOrder: 'asc',
  });

  const handleVariantClick = useCallback(
    (variantId: string) => {
      navigate(`/inventory/stocks/variant/${variantId}`);
    },
    [navigate]
  );

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <span className="text-muted-foreground text-lg">
          Loading stock variants...
        </span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-2">
        <span className="text-destructive text-lg">
          Error loading stock variants
        </span>
        <span className="text-base text-muted-foreground">
          {error instanceof Error ? error.message : 'Unknown error'}
        </span>
      </div>
    );
  }

  if (!stockVariantsResponse?.data || stockVariantsResponse.data.length === 0) {
    return (
      <div className="flex items-center justify-center py-20">
        <span className="text-muted-foreground text-lg">
          {searchQuery
            ? 'No stock variants found matching your search'
            : 'No stock variants yet'}
        </span>
      </div>
    );
  }

  const totalPages = stockVariantsResponse.meta.totalPages;
  const totalItems = stockVariantsResponse.meta.total;

  // Generate page numbers to show
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const showEllipsis = totalPages > 7;

    if (!showEllipsis) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    // Always show first page
    pages.push(1);

    if (currentPage > 3) {
      pages.push('...');
    }

    // Show pages around current page
    for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
      pages.push(i);
    }

    if (currentPage < totalPages - 2) {
      pages.push('...');
    }

    // Always show last page
    if (totalPages > 1) {
      pages.push(totalPages);
    }

    return pages;
  };

  return (
    <div className="space-y-6">
      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {stockVariantsResponse.data.map((variant) => (
          <Card
            key={variant.productVariantId}
            className="group hover:shadow-lg transition-all duration-200 cursor-pointer overflow-hidden"
            onClick={() => handleVariantClick(variant.productVariantId)}
          >
            {/* Image Section */}
            <div className="relative aspect-square bg-accent/30 overflow-hidden">
              {variant.imageUrl ? (
                <img
                  src={variant.imageUrl}
                  alt={variant.productName}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Package className="h-20 w-20 text-muted-foreground" />
                </div>
              )}

              {/* Status Badge Overlay */}
              <div className="absolute top-3 right-3">
                <Badge
                  variant={getStatusBadgeVariant(variant.status)}
                  appearance="light"
                  className="text-xs font-semibold shadow-md"
                >
                  {getStatusLabel(variant.status)}
                </Badge>
              </div>

              {/* Quick View Button */}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-200 flex items-center justify-center opacity-0 group-hover:opacity-100">
                <Button
                  variant="secondary"
                  size="sm"
                  className="gap-2"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleVariantClick(variant.productVariantId);
                  }}
                >
                  <Eye className="h-4 w-4" />
                  View Details
                </Button>
              </div>
            </div>

            {/* Content Section */}
            <CardContent className="p-4 space-y-3">
              {/* Product Name */}
              <h3 className="font-semibold text-base line-clamp-2 min-h-[3rem] group-hover:text-primary transition-colors">
                {variant.productName}
              </h3>

              {/* Variant Name */}
              <p className="text-sm text-muted-foreground line-clamp-1">
                {variant.variantName}
              </p>

              {/* SKU */}
              <div className="flex items-center gap-2">
                <Badge variant="outline" size="sm" className="text-xs">
                  {variant.sku}
                </Badge>
                {variant.categoryName && (
                  <span className="text-xs text-muted-foreground truncate">
                    {variant.categoryName}
                  </span>
                )}
              </div>

              {/* Stock Information */}
              <div className="grid grid-cols-3 gap-2 pt-2 border-t">
                <div className="text-center">
                  <p className="text-xs text-muted-foreground mb-1">Total</p>
                  <p className="text-lg font-bold">{variant.totalQuantity}</p>
                </div>
                <div className="text-center border-x">
                  <p className="text-xs text-muted-foreground mb-1">Reserved</p>
                  <p className="text-lg font-semibold text-amber-600">
                    {variant.totalReserved}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-muted-foreground mb-1">Available</p>
                  <p className="text-lg font-semibold text-green-600">
                    {variant.totalAvailable}
                  </p>
                </div>
              </div>
            </CardContent>

            {/* Footer */}
            <CardFooter className="p-4 pt-0 flex items-center justify-between text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5" />
                {variant.warehouseCount} warehouse{variant.warehouseCount !== 1 ? 's' : ''}
              </span>
              {variant.lastMovement && (
                <span className="flex items-center gap-1">
                  <TrendingUp className="h-3.5 w-3.5" />
                  {new Date(variant.lastMovement).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                  })}
                </span>
              )}
            </CardFooter>
          </Card>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex flex-col items-center gap-4">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="gap-2"
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>

            <div className="flex items-center gap-1">
              {getPageNumbers().map((page, index) => (
                page === '...' ? (
                  <span key={index} className="px-3 py-2 text-muted-foreground">
                    ...
                  </span>
                ) : (
                  <Button
                    key={index}
                    variant={currentPage === page ? 'mono' : 'ghost'}
                    size="sm"
                    onClick={() => handlePageChange(page as number)}
                    className="min-w-[40px]"
                  >
                    {page}
                  </Button>
                )
              ))}
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="gap-2"
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          <p className="text-sm text-muted-foreground">
            Showing {((currentPage - 1) * pageSize) + 1} - {Math.min(currentPage * pageSize, totalItems)} of {totalItems} items
          </p>
        </div>
      )}
    </div>
  );
}
