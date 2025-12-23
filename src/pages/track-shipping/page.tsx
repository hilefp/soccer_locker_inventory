'use client';

import { useState } from 'react';
import { useDocumentTitle } from '@/shared/hooks/use-document-title';
import { TrackShippingSheet } from '../components/track-shipping-sheet';
import { ProductListTable } from '../../modules/products/components/product-list';

export function TrackShippingPage() {
  useDocumentTitle('Track Shipping');
  const [isSheetOpen, setIsSheetOpen] = useState(true);

  return (
    <div className="container-fluid">
      <ProductListTable />
      <TrackShippingSheet open={isSheetOpen} onOpenChange={setIsSheetOpen} />
    </div>
  );
}
