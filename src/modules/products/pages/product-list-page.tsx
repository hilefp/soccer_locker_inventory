'use client';

import { PlusIcon, Upload } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/shared/components/ui/button';
import { ProductListTable } from '../components/product-list';
import { ProductNavigationTabs } from '@/modules/products/components/product-navigation-tabs';
import { useProducts } from '@/modules/products/hooks/use-products';

export function ProductList() {
  const navigate = useNavigate();

  // Use React Query hook for data fetching
  const { data: products = [], isLoading, error } = useProducts();

  const activeProducts = products.filter(product => product.isActive);
  const totalProducts = products.length;
  const activePercentage = totalProducts > 0
    ? Math.round((activeProducts.length / totalProducts) * 100)
    : 0;

  return (
    <div className="container-fluid space-y-5 lg:space-y-9">
      <ProductNavigationTabs />
      <div className="flex items-center flex-wrap gap-2.5 justify-between">
        <div className="flex flex-col gap-1">
          <h1 className="text-xl font-bold text-foreground">Product List</h1>
          <span className="text-sm text-muted-foreground">
            {isLoading
              ? 'Loading products...'
              : error
                ? `Error loading products: ${error.message}`
                : `${totalProducts} products found. ${activePercentage}% are active.`
            }
          </span>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="gap-2">
            <Upload className="h-4 w-4" />
            Import
          </Button>
          <Button
            variant="mono"
            className="gap-2"
            onClick={() => navigate('/products/new')}
          >
            <PlusIcon className="h-4 w-4" />
            Add Product
          </Button>
        </div>
      </div>

      {/* Product List Table */}
      <ProductListTable
        products={products}
        isLoading={isLoading}
        error={error?.message || null}
      />
    </div>
  );
}
