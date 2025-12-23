'use client';

import { useDocumentTitle } from '@/shared/hooks/use-document-title';
import { ProductListTable } from '../../modules/products/components/product-list';

export function ManageVariantsPage() {
  useDocumentTitle('Manage Variants');

  return (
    <div className="container-fluid">
      <ProductListTable />
    </div>
  );
}
