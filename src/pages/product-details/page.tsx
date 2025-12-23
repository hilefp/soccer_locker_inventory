import { ProductListTable } from "../../modules/products/components/product-list";
import { useDocumentTitle } from '@/shared/hooks/use-document-title';

export function ProductDetailsPage() {
  useDocumentTitle('Product Details');
  return (
    <div className="container-fluid">
      {/* Product List Table */}
      <ProductListTable />
    </div>
  );
}
