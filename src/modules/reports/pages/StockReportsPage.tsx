import { useEffect, useState } from 'react';
import { stockReportsService } from '../services/stock-reports.service';
import {
  DamagedProductReport,
  InventoryValue,
  StockInsertionHistory,
  StockObject,
  StockTotalQuantity,
} from '../types';
import { SummaryCard } from '../components/SummaryCard';
import { StockInsertionHistoryChart } from '../components/StockInsertionHistoryChart';
import { DamagedProductsTable } from '../components/DamagedProductsTable';
import { BestWorstStockCard } from '../components/BestWorstStockCard';
import { Input } from '@/shared/components/ui/input';
import { ArrowDown, ArrowUp, Boxes, DollarSign } from 'lucide-react';

export default function StockReportsPage() {
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');

  const [totalQty, setTotalQty] = useState<StockTotalQuantity | null>(null);
  const [inventoryValue, setInventoryValue] = useState<InventoryValue | null>(null);
  const [highestStock, setHighestStock] = useState<StockObject | null>(null);
  const [lowestStock, setLowestStock] = useState<StockObject | null>(null);
  const [historyData, setHistoryData] = useState<StockInsertionHistory[]>([]);
  const [damagedData, setDamagedData] = useState<DamagedProductReport[]>([]);

  // Fetch Snapshot Data (No filters)
  useEffect(() => {
    const fetchSnapshot = async () => {
      try {
        const [qty, val, high, low] = await Promise.all([
          stockReportsService.getTotalStockQuantity(),
          stockReportsService.getInventoryValue(),
          stockReportsService.getHighestStock(),
          stockReportsService.getLowestStock(),
        ]);
        setTotalQty(qty);
        setInventoryValue(val);
        setHighestStock(high);
        setLowestStock(low);
      } catch (error) {
        console.error('Failed to fetch stock snapshot', error);
      }
    };
    fetchSnapshot();
  }, []);

  // Fetch History/Damaged Data (With filters)
  useEffect(() => {
    const filters = {
       startDate: startDate || undefined,
       endDate: endDate || undefined,
    };

    const fetchFiltered = async () => {
      try {
        const [history, damaged] = await Promise.all([
          stockReportsService.getStockInsertionHistory(filters),
          stockReportsService.getDamagedProducts(filters),
        ]);
        setHistoryData(history);
        setDamagedData(damaged);
      } catch (error) {
        console.error('Failed to fetch filtered stock reports', error);
      }
    };

    fetchFiltered();
  }, [startDate, endDate]);

  return (
    <div className="container-fluid space-y-5 lg:space-y-9">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Stock Reports</h1>
         <div className="flex items-center gap-2">
          <div className="grid gap-1">
             <span className="text-xs font-medium">Start Date</span>
             <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-auto"
              />
          </div>
          <div className="grid gap-1">
             <span className="text-xs font-medium">End Date</span>
             <Input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-auto"
              />
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <SummaryCard
          title="Total Stock Quantity"
          value={totalQty?.totalQuantity ?? 0}
          icon={Boxes}
          description="Total items in stock"
        />
        <SummaryCard
          title="Inventory Value"
          value={`$${inventoryValue?.totalValue?.toLocaleString() ?? '0.00'}`}
          icon={DollarSign}
          description="Total value of inventory"
        />
        <BestWorstStockCard title="Highest Stock Product" data={highestStock} />
        <BestWorstStockCard title="Lowest Stock Product" data={lowestStock} />
      </div>

      <div className="grid gap-4 md:grid-cols-1">
        <StockInsertionHistoryChart data={historyData} />
      </div>

       <div className="grid gap-4 md:grid-cols-1">
        <DamagedProductsTable data={damagedData} />
      </div>
    </div>
  );
}
