'use client';
import { ProductInfoSheet } from '../../modules/products/components/product-info-sheet'; 

export function ProductInfoPage() {
  return (
    <div className="container-fluid"> 
      <ProductInfoSheet mockData={[]} />
    </div>
  );
}
