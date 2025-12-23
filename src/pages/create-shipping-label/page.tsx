'use client';

import { useState } from 'react';
import { useDocumentTitle } from '@/shared/hooks/use-document-title';
import { CreateShippingLabelSheet } from '../components/create-shipping-label-sheet';
import { ProductListTable } from '../../modules/products/components/product-list';

export function CreateShippingLabelPage() {
  useDocumentTitle('Create Shipping Label');
  const [isSheetOpen, setIsSheetOpen] = useState(true);

  return (
    <div className="container-fluid">
      <ProductListTable />
      <CreateShippingLabelSheet
        open={isSheetOpen}
        onOpenChange={setIsSheetOpen}
      />
    </div>
  );
}
