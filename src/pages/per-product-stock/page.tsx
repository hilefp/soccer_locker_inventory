'use client';

import { useState } from 'react';
import { PerProductStockSheet } from '../../modules/products/components/per-product-stock-sheet';
import { ProductListTable } from '../../modules/products/components/product-list';
import { useDocumentTitle } from '@/shared/hooks/use-document-title';

export function PerProductStockPage() {
  useDocumentTitle('Per Product Stock');
  const [isSheetOpen, setIsSheetOpen] = useState(true);

  return (
    <div className="container-fluid">
      <ProductListTable />
      <PerProductStockSheet open={isSheetOpen} onOpenChange={setIsSheetOpen} />
    </div>
  );
}
