import { useEffect, useState } from 'react';
import { stockReportsService } from '../services/stock-reports.service';
import {
  DamagedProductReport,
  InventoryValue,
  ReportFilterDto,
  StockObject,
  StockRankingDto,
  StockTotalQuantity,
} from '../types';
import { SummaryCard } from '../components/SummaryCard';
import { DamagedProductsTable } from '../components/DamagedProductsTable';
import { BestWorstStockCard } from '../components/BestWorstStockCard';
import { StockRankingChart } from '../components/StockRankingChart';
import { Input } from '@/shared/components/ui/input';
import { Boxes, DollarSign } from 'lucide-react';
import { useDocumentTitle } from '@/shared/hooks/use-document-title';
import { useMonthlyEntriesVsExits, useMonthlyTotalStock } from '../hooks/use-inventory-reports';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/components/ui/tabs';
import { ObsoleteVariantsTable } from '../components/obsolete-variants-table';
import { MonthlyEntriesVsExitsChart } from '../components/monthly-entries-vs-exits-chart';
import { MonthlyTotalStockChart } from '../components/monthly-total-stock-chart';
import { InventoryReportFilters } from '../components/inventory-report-filters';

export default function StockReportsPage() {
  useDocumentTitle('Stock Reports');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [rankingSort, setRankingSort] = useState<'asc' | 'desc'>('desc');

  const [activeTab, setActiveTab] = useState<'movements' | 'stock'>('movements');
  const [filters, setFilters] = useState<ReportFilterDto>();

  const [totalQty, setTotalQty] = useState<StockTotalQuantity | null>(null);
  const [inventoryValue, setInventoryValue] = useState<InventoryValue | null>(null);
  const [highestStock, setHighestStock] = useState<StockObject | null>(null);
  const [lowestStock, setLowestStock] = useState<StockObject | null>(null);
  const [rankingData, setRankingData] = useState<StockRankingDto[]>([]);
  const [damagedData, setDamagedData] = useState<DamagedProductReport[]>([]);

  const totalStockQuery = useMonthlyTotalStock(filters);
  const entriesVsExitsQuery = useMonthlyEntriesVsExits(filters);

  const handleApplyFilters = (newFilters: ReportFilterDto) => {
    setFilters(newFilters);
  };

  const handleResetFilters = () => {
    setFilters(undefined);
  };

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

  // Fetch Ranking (Depends on sort)
  useEffect(() => {
    const fetchRanking = async () => {
      try {
        const data = await stockReportsService.getStockRanking({ sortOrder: rankingSort });
        setRankingData(data);
      } catch (error) {
        console.error('Failed to fetch stock ranking', error);
      }
    };
    fetchRanking();
  }, [rankingSort]);

  // Fetch History/Damaged Data (With date filters)
  useEffect(() => {
    const filters = {
       startDate: startDate || undefined,
       endDate: endDate || undefined,
    };

    const fetchFiltered = async () => {
      try {
        const damaged = await stockReportsService.getDamagedProducts(filters);
        setDamagedData(damaged);
      } catch (error) {
        console.error('Failed to fetch filtered stock reports', error);
      }
    };

    fetchFiltered();
  }, [startDate, endDate]);

  return (
    <div className="container-fluid space-y-5 lg:space-y-9">
      <div className="flex flex-col gap-4">
        <h1 className="text-3xl font-bold tracking-tight">Stock Reports</h1>
        <p className="text-muted-foreground">
          Analytics and insights for stock movements and stock levels
        </p>
      </div>

      <div> 

      <InventoryReportFilters
        onApply={handleApplyFilters}
        onReset={handleResetFilters}
      />  
      </div>
      
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-2">
        <SummaryCard
          title="Total Stock Quantity"
          value={totalQty?.totalQuantity?.toLocaleString() ?? 0}
          icon={Boxes}
          description="Total items in stock"
        />
        <SummaryCard
          title="Inventory Value"
          value={`$${inventoryValue?.totalValue?.toLocaleString() ?? '0.00'}`}
          icon={DollarSign}
          description="Total value of inventory"
        />
  
      </div>

      <div className="grid gap-4 md:grid-cols-1">
            {/* Filters */}
 
              {/* Reports Tabs */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as typeof activeTab)}>
        <TabsList className="grid w-full max-w-md grid-cols-3">
          <TabsTrigger value="movements">Movements</TabsTrigger>
          <TabsTrigger value="stock">Stock</TabsTrigger>
       </TabsList>

        {/* Movements Tab */}
        <TabsContent value="movements" className="space-y-6 mt-6">
          <MonthlyEntriesVsExitsChart
            data={entriesVsExitsQuery.data || []}
            isLoading={entriesVsExitsQuery.isLoading}
            error={entriesVsExitsQuery.error}
          />
        </TabsContent>

        {/* Stock Tab */}
        <TabsContent value="stock" className="space-y-6 mt-6">
          <MonthlyTotalStockChart
            data={totalStockQuery.data || []}
            isLoading={totalStockQuery.isLoading}
            error={totalStockQuery.error}
          />
        </TabsContent>

       
      </Tabs> 
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <BestWorstStockCard title="Highest Stock Product" data={highestStock} />
        <BestWorstStockCard title="Lowest Stock Product" data={lowestStock} />
      </div>

      <div className="grid gap-4 md:grid-cols-1">
        <StockRankingChart 
          data={rankingData} 
          sortOrder={rankingSort} 
          onSortChange={setRankingSort}
        />
      </div>

       <div className="grid gap-4 md:grid-cols-1">
        <DamagedProductsTable data={damagedData} />
      </div>
    </div>
  );
}
