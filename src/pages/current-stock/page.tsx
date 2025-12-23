import { StockNavbar } from '../components/stock-navbar';
import { CurrentStockTable } from '../tables/current-stock';
import { useDocumentTitle } from '@/shared/hooks/use-document-title';

export function CurrentStock() {
  useDocumentTitle('Current Stock');
  return (
    <>
      <StockNavbar />
      <div className="container-fluid">
        <CurrentStockTable />
      </div>
    </>
  );
}
