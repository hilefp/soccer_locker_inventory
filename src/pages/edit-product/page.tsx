'use client';

import { useState } from 'react';
import { ProductFormSheet } from '../../modules/products/components/product-form-sheet';
import { ProductListTable } from '../../modules/products/components/product-list';
import { useDocumentTitle } from '@/shared/hooks/use-document-title';

export function EditProductPage() {
  useDocumentTitle('Edit Product');
  const [isSheetOpen, setIsSheetOpen] = useState(true);

  return (
    <div className="container-fluid">
      <ProductListTable />
      <ProductFormSheet mode="edit" open={isSheetOpen} onOpenChange={setIsSheetOpen} />
    </div>
  );
}
