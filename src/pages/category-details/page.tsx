'use client';

import { PlusIcon } from 'lucide-react';
import { useState } from 'react';
import { useDocumentTitle } from '@/shared/hooks/use-document-title';
import { Button } from '@/shared/components/ui/button';
import { CategoryListTable } from '../../modules/products/components/category-list';
import { CategoryFormSheet } from '../../modules/products/components/category-form-sheet';

export function CategoryDetails() {
  useDocumentTitle('Category Details');
  const [isCreateCategoryOpen, setIsCreateCategoryOpen] = useState(false);
  
  return (
    <div className="container-fluid space-y-5 lg:space-y-9">
      <div className="flex items-center justify-between">
        <div className="flex flex-col">
          <h3 className="text-xl font-semibold text-foreground">
            Category List
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
      <CategoryListTable displaySheet="categoryDetails" />
      <CategoryFormSheet
        mode="new"  
        open={isCreateCategoryOpen}
        onOpenChange={setIsCreateCategoryOpen}
      />
    </div>
  );
}
