import { AllStockTable } from '../tables/all-stock';
import { Inventory } from './total-asset';
import { useDocumentTitle } from '@/shared/hooks/use-document-title';

export function AllStock() {
  useDocumentTitle('All Stock');
  return (
    <div className="container-fluid">
      <div className="grid gap-5 lg:gap-7.5">
        <Inventory />
        <AllStockTable />
      </div>
    </div>
  );
}
