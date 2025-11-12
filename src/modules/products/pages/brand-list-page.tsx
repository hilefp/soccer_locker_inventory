'use client';

import { PlusIcon } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { BrandListTable } from '@/modules/products/components/brand-list';
import { BrandFormSheet } from '@/modules/products/components/brand-form-sheet';
import { useState } from 'react';
import { ProductNavigationTabs } from '@/modules/products/components/product-navigation-tabs';
import { useProductBrands } from '@/modules/products/hooks/use-product-brands';

export function BrandList() {
  const [isCreateBrandOpen, setIsCreateBrandOpen] = useState(false);

  // Use React Query hook for data fetching
  const { data: brands = [], isLoading, error } = useProductBrands();

  const activeBrands = brands.filter(brand => brand.isActive);
  const totalBrands = brands.length;
  const inactivePercentage = totalBrands > 0
    ? Math.round(((totalBrands - activeBrands.length) / totalBrands) * 100)
    : 0;

  return (
    <div className="container-fluid space-y-5 lg:space-y-9">
      <ProductNavigationTabs />
      <div className="flex items-center justify-between">
        <div className="flex flex-col">
          <h3 className="text-xl font-semibold text-foreground">
            Brands
          </h3>
          <span className="text-sm text-muted-foreground">
            {isLoading
              ? 'Loading brands...'
              : error
                ? `Error loading brands: ${error.message}`
                : `${totalBrands} brands found. ${inactivePercentage}% needs your attention.`
            }
          </span>
        </div>

        <Button variant="mono" onClick={() => setIsCreateBrandOpen(true)}>
          <PlusIcon />
          Add Brand
        </Button>
      </div>
      <BrandListTable
        brands={brands}
        isLoading={isLoading}
        error={error?.message || null}
      />
      <BrandFormSheet
        mode="new"
        open={isCreateBrandOpen}
        onOpenChange={setIsCreateBrandOpen}
      />
    </div>
  );
}
