import { StockNavbar } from '../components/stock-navbar';
import { InboundStockTable } from '../tables/inbound-stock';
import { useDocumentTitle } from '@/shared/hooks/use-document-title';

export function InboundStock() {
  useDocumentTitle('Inbound Stock');
  return (
    <>
      <StockNavbar />
      <div className="container-fluid">
        <InboundStockTable />
      </div>
    </>
  );
}
