'use client';

import { PlusIcon } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { CategoryListTable } from '@/modules/products/components/category-list';
import { CategoryFormSheet } from '@/modules/products/components/category-form-sheet';
import { useState } from 'react';
import { ProductNavigationTabs } from '@/modules/products/components/product-navigation-tabs';

export function CategoryList() {
  const [isCreateCategoryOpen, setIsCreateCategoryOpen] = useState(false);
  
  return (
    <div className="container-fluid space-y-5 lg:space-y-9">
        <ProductNavigationTabs />
      <div className="flex items-center justify-between">
        <div className="flex flex-col">
          <h3 className="text-xl font-semibold text-foreground">
            Categories
          </h3>
          <span className="text-sm text-muted-foreground">
            84 categories found. 12% needs your attention.
          </span>
        </div>

        <Button variant="mono" onClick={() => setIsCreateCategoryOpen(true)}>
          <PlusIcon />
          Add Category
        </Button>
      </div>
      <CategoryListTable />
      <CategoryFormSheet
        mode="new"  
        open={isCreateCategoryOpen}
        onOpenChange={setIsCreateCategoryOpen}
      />
    </div>
  );
}
