'use client';

import { PlusIcon } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { CategoryListTable } from '@/modules/products/components/category-list';
import { CategoryFormSheet } from '@/modules/products/components/category-form-sheet';
import { useState } from 'react';
import { ProductNavigationTabs } from '@/modules/products/components/product-navigation-tabs';
import { useProductCategories } from '@/modules/products/hooks/use-product-categories';
import { useDocumentTitle } from '@/shared/hooks/use-document-title';

export function CategoryList() {
  useDocumentTitle('Categories');
  const [isCreateCategoryOpen, setIsCreateCategoryOpen] = useState(false);

  // Use React Query hook for data fetching
  const { data: categories = [], isLoading, error } = useProductCategories();

  const activeCategories = categories.filter(cat => cat.isActive);
  const totalCategories = categories.length;
  const inactivePercentage = totalCategories > 0
    ? Math.round(((totalCategories - activeCategories.length) / totalCategories) * 100)
    : 0;

  return (
    <div className="container-fluid space-y-5 lg:space-y-9">
        <ProductNavigationTabs />
      <div className="flex items-center justify-between">
        <div className="flex flex-col">
          <h3 className="text-xl font-semibold text-foreground">
            Categories
          </h3>
          <span className="text-sm text-muted-foreground">
            {isLoading
              ? 'Loading categories...'
              : error
                ? `Error loading categories: ${error.message}`
                : `${totalCategories} categories found. ${inactivePercentage}% needs your attention.`
            }
          </span>
        </div>

        <Button variant="mono" onClick={() => setIsCreateCategoryOpen(true)}>
          <PlusIcon />
          Add Category
        </Button>
      </div>
      <CategoryListTable
        categories={categories}
        isLoading={isLoading}
        error={error?.message || null}
      />
      <CategoryFormSheet
        mode="new"
        open={isCreateCategoryOpen}
        onOpenChange={setIsCreateCategoryOpen}
      />
    </div>
  );
}
