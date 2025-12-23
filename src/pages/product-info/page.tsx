'use client';
import { ProductInfoSheet } from '../../modules/products/components/product-info-sheet';
import { useDocumentTitle } from '@/shared/hooks/use-document-title';

export function ProductInfoPage() {
  useDocumentTitle('Product Info');
  return (
    <div className="container-fluid"> 
      <ProductInfoSheet mockData={[]} />
    </div>
  );
}
