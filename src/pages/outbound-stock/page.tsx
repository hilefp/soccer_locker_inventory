import { StockNavbar } from '../components/stock-navbar';
import { OutboundStockTable } from '../tables/outbound-stock';
import { useDocumentTitle } from '@/shared/hooks/use-document-title';

export function OutboundStock() {
  useDocumentTitle('Outbound Stock');
  return (
    <>
      <StockNavbar />
      <div className="container-fluid">
        <OutboundStockTable />
      </div>
    </>
  );
}
