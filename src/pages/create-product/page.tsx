'use client';

import { useState } from 'react';
import { ProductFormSheet } from '../../modules/products/components/product-form-sheet';
import { ProductListTable } from '../../modules/products/components/product-list';
import { useDocumentTitle } from '@/shared/hooks/use-document-title';

export function CreateProductPage() {
  useDocumentTitle('Create Product');
  const [isSheetOpen, setIsSheetOpen] = useState(true);

  return (
    <div className="container-fluid">
      <ProductListTable />
      <ProductFormSheet mode="new" open={isSheetOpen} onOpenChange={setIsSheetOpen} />
    </div>
  );
}
