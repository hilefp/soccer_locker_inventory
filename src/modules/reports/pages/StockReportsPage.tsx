import { useEffect, useState } from 'react';
import { stockReportsService } from '../services/stock-reports.service';
import {
  DamagedProductReport,
  InventoryValue,
  ReportFilterDto,
  StockObject,
  StockRankingDto,
  StockReportDto,
  StockTotalQuantity,
} from '../types';
import { SummaryCard } from '../components/SummaryCard';
import { SalesKpiCard } from '../components/sales-kpi-card';
import { DamagedProductsTable } from '../components/DamagedProductsTable';
import { BestWorstStockCard } from '../components/BestWorstStockCard';
import { StockRankingChart } from '../components/StockRankingChart';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import {
  Boxes,
  DollarSign,
  Warehouse,
  Package,
  AlertTriangle,
  XCircle,
  ArrowUpDown,
  ArrowDownUp,
  TrendingUp,
  BarChart3,
  Clock,
  Loader2,
  CheckCircle2,
} from 'lucide-react';
import { useDocumentTitle } from '@/shared/hooks/use-document-title';
import { useMonthlyEntriesVsExits, useMonthlyTotalStock } from '../hooks/use-inventory-reports';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/components/ui/tabs';
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

  const [reportData, setReportData] = useState<StockReportDto | null>(null);
  const [reportLoading, setReportLoading] = useState(true);

  const totalStockQuery = useMonthlyTotalStock(filters);
  const entriesVsExitsQuery = useMonthlyEntriesVsExits(filters);

  const handleApplyFilters = (newFilters: ReportFilterDto) => {
    setFilters(newFilters);
  };

  const handleResetFilters = () => {
    setFilters(undefined);
  };

  const fmt = (v: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 }).format(v);

  const fmtNum = (v: number) => new Intl.NumberFormat('en-US').format(v);

  const fmtPct = (v: number) => `${v.toFixed(2)}%`;

  // Fetch unified report data
  useEffect(() => {
    const fetchReport = async () => {
      try {
        setReportLoading(true);
        const report = await stockReportsService.getStockReport();
        setReportData(report);
      } catch (error) {
        console.error('Failed to fetch stock report', error);
      } finally {
        setReportLoading(false);
      }
    };
    fetchReport();
  }, []);

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

      {/* ── New KPIs from unified API ────────────────────────── */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <SalesKpiCard title="Available" value={reportData ? fmtNum(reportData.totalAvailableQuantity) : '0'} icon={CheckCircle2} description="Available for sale" iconClassName="text-green-600" loading={reportLoading} />
        <SalesKpiCard title="Reserved" value={reportData ? fmtNum(reportData.totalReservedQuantity) : '0'} icon={Package} description="Reserved in orders" iconClassName="text-orange-600" loading={reportLoading} />
        <SalesKpiCard title="Warehouses" value={reportData ? fmtNum(reportData.totalWarehouses) : '0'} icon={Warehouse} description="Active warehouses" iconClassName="text-purple-600" loading={reportLoading} />
        <SalesKpiCard title="Potential Revenue" value={reportData ? fmt(reportData.potentialRevenue) : '$0.00'} icon={TrendingUp} description="Retail - Cost" iconClassName="text-green-600" loading={reportLoading} />
      </div>

      {/* ── Inventory Value Breakdown ─────────────────────────── */}
      <div className="grid gap-4 md:grid-cols-3">
        <SalesKpiCard title="Inventory Cost" value={reportData ? fmt(reportData.totalInventoryValueCost) : '$0.00'} icon={DollarSign} description="Total cost value" iconClassName="text-orange-600" loading={reportLoading} />
        <SalesKpiCard title="Retail Value" value={reportData ? fmt(reportData.totalInventoryValueRetail) : '$0.00'} icon={DollarSign} description="Total retail value" iconClassName="text-blue-600" loading={reportLoading} />
        <SalesKpiCard title="Potential Revenue" value={reportData ? fmt(reportData.potentialRevenue) : '$0.00'} icon={TrendingUp} description="Retail - Cost" iconClassName="text-green-600" loading={reportLoading} />
      </div>

      {/* ── Stock Health & Turnover ────────────────────────────── */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Stock Health */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold">Stock Health</CardTitle>
          </CardHeader>
          <CardContent>
            {reportLoading ? (
              <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-sm"><Package className="h-4 w-4 text-blue-500" /> Unique Products</span>
                  <span className="font-semibold">{fmtNum(reportData?.uniqueProducts ?? 0)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-sm"><Boxes className="h-4 w-4 text-indigo-500" /> Unique Variants</span>
                  <span className="font-semibold">{fmtNum(reportData?.uniqueVariants ?? 0)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-sm"><CheckCircle2 className="h-4 w-4 text-green-500" /> With Stock</span>
                  <span className="font-semibold">{fmtNum(reportData?.productsWithStock ?? 0)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-sm"><AlertTriangle className="h-4 w-4 text-yellow-500" /> Low Stock</span>
                  <span className="font-semibold">{fmtNum(reportData?.productsWithLowStock ?? 0)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-sm"><XCircle className="h-4 w-4 text-red-500" /> Out of Stock</span>
                  <span className="font-semibold">{fmtNum(reportData?.productsOutOfStock ?? 0)}</span>
                </div>
                <div className="flex items-center justify-between border-t pt-3">
                  <span className="text-sm text-muted-foreground">Stock Accuracy</span>
                  <span className="font-semibold">{fmtPct(reportData?.stockAccuracy ?? 0)}</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Turnover Metrics */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base font-semibold">
              <Clock className="h-4 w-4" /> Turnover Metrics
            </CardTitle>
          </CardHeader>
          <CardContent>
            {reportLoading ? (
              <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
            ) : reportData?.turnoverMetrics ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Avg Days to Sell</span>
                  <span className="font-semibold">{reportData.turnoverMetrics.averageDaysToSell.toFixed(1)} days</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Turnover Rate</span>
                  <span className="font-semibold">{reportData.turnoverMetrics.turnoverRate.toFixed(2)}x</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-sm"><TrendingUp className="h-4 w-4 text-green-500" /> Fast Moving</span>
                  <span className="font-semibold">{fmtNum(reportData.turnoverMetrics.fastMovingCount)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-sm"><ArrowDownUp className="h-4 w-4 text-yellow-500" /> Slow Moving</span>
                  <span className="font-semibold">{fmtNum(reportData.turnoverMetrics.slowMovingCount)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-sm"><XCircle className="h-4 w-4 text-red-500" /> Obsolete</span>
                  <span className="font-semibold">{fmtNum(reportData.turnoverMetrics.obsoleteCount)}</span>
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground py-4 text-center">No turnover data available</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* ── Movement Summary ──────────────────────────────────── */}
      {reportData?.movementSummary && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base font-semibold">
              <ArrowUpDown className="h-4 w-4" /> Movement Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-lg border p-4">
                <p className="text-xs text-muted-foreground uppercase tracking-wide">Entries</p>
                <p className="text-2xl font-bold text-green-600">{fmtNum(reportData.movementSummary.totalEntries)}</p>
              </div>
              <div className="rounded-lg border p-4">
                <p className="text-xs text-muted-foreground uppercase tracking-wide">Exits</p>
                <p className="text-2xl font-bold text-red-600">{fmtNum(reportData.movementSummary.totalExits)}</p>
              </div>
              <div className="rounded-lg border p-4">
                <p className="text-xs text-muted-foreground uppercase tracking-wide">Adjustments</p>
                <p className="text-2xl font-bold text-blue-600">{fmtNum(reportData.movementSummary.totalAdjustments)}</p>
              </div>
              <div className="rounded-lg border p-4">
                <p className="text-xs text-muted-foreground uppercase tracking-wide">Net Change</p>
                <p className={`text-2xl font-bold ${reportData.movementSummary.netChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {reportData.movementSummary.netChange >= 0 ? '+' : ''}{fmtNum(reportData.movementSummary.netChange)}
                </p>
              </div>
              <div className="rounded-lg border p-4">
                <p className="text-xs text-muted-foreground uppercase tracking-wide">Transfers In</p>
                <p className="text-2xl font-bold">{fmtNum(reportData.movementSummary.totalTransfersIn)}</p>
              </div>
              <div className="rounded-lg border p-4">
                <p className="text-xs text-muted-foreground uppercase tracking-wide">Transfers Out</p>
                <p className="text-2xl font-bold">{fmtNum(reportData.movementSummary.totalTransfersOut)}</p>
              </div>
              <div className="rounded-lg border p-4">
                <p className="text-xs text-muted-foreground uppercase tracking-wide">Damaged</p>
                <p className="text-2xl font-bold text-orange-600">{fmtNum(reportData.movementSummary.totalDamaged)}</p>
              </div>
              <div className="rounded-lg border p-4">
                <p className="text-xs text-muted-foreground uppercase tracking-wide">Lost</p>
                <p className="text-2xl font-bold text-red-600">{fmtNum(reportData.movementSummary.totalLost)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

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

      {/* ── Warehouse Stats ───────────────────────────────────── */}
      {reportData?.warehouseStats && reportData.warehouseStats.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base font-semibold">
              <Warehouse className="h-4 w-4" /> Warehouse Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-muted-foreground">
                    <th className="pb-3 font-medium">Warehouse</th>
                    <th className="pb-3 font-medium text-right">Total Qty</th>
                    <th className="pb-3 font-medium text-right">Available</th>
                    <th className="pb-3 font-medium text-right">Reserved</th>
                    <th className="pb-3 font-medium text-right">Products</th>
                    <th className="pb-3 font-medium text-right">Value</th>
                    <th className="pb-3 font-medium text-right">% of Total</th>
                  </tr>
                </thead>
                <tbody>
                  {reportData.warehouseStats.map((wh) => (
                    <tr key={wh.warehouseId} className="border-b last:border-0">
                      <td className="py-3 font-medium">{wh.warehouseName}</td>
                      <td className="py-3 text-right">{fmtNum(wh.totalQuantity)}</td>
                      <td className="py-3 text-right">{fmtNum(wh.availableQuantity)}</td>
                      <td className="py-3 text-right">{fmtNum(wh.reservedQuantity)}</td>
                      <td className="py-3 text-right">{fmtNum(wh.uniqueProducts)}</td>
                      <td className="py-3 text-right">{fmt(wh.inventoryValue)}</td>
                      <td className="py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <div className="h-2 w-16 rounded-full bg-muted">
                            <div className="h-2 rounded-full bg-purple-500" style={{ width: `${wh.percentageOfTotal}%` }} />
                          </div>
                          <span>{fmtPct(wh.percentageOfTotal)}</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ── Category Stats ────────────────────────────────────── */}
      {reportData?.categoryStats && reportData.categoryStats.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base font-semibold">
              <BarChart3 className="h-4 w-4" /> Categories Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-muted-foreground">
                    <th className="pb-3 font-medium">Category</th>
                    <th className="pb-3 font-medium text-right">Quantity</th>
                    <th className="pb-3 font-medium text-right">Products</th>
                    <th className="pb-3 font-medium text-right">Inventory Value</th>
                    <th className="pb-3 font-medium text-right">% of Total</th>
                  </tr>
                </thead>
                <tbody>
                  {reportData.categoryStats.map((cat) => (
                    <tr key={cat.categoryId} className="border-b last:border-0">
                      <td className="py-3 font-medium">{cat.categoryName}</td>
                      <td className="py-3 text-right">{fmtNum(cat.totalQuantity)}</td>
                      <td className="py-3 text-right">{fmtNum(cat.productCount)}</td>
                      <td className="py-3 text-right">{fmt(cat.inventoryValue)}</td>
                      <td className="py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <div className="h-2 w-16 rounded-full bg-muted">
                            <div className="h-2 rounded-full bg-primary" style={{ width: `${cat.percentageOfTotal}%` }} />
                          </div>
                          <span>{fmtPct(cat.percentageOfTotal)}</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ── Top Products ──────────────────────────────────────── */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Top by Quantity */}
        {reportData?.topProductsByQuantity && reportData.topProductsByQuantity.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base font-semibold">Top Products by Quantity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {reportData.topProductsByQuantity.map((p, i) => (
                  <div key={p.productId} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-500/10 text-xs font-bold text-blue-600">{i + 1}</span>
                      <div>
                        <p className="text-sm font-medium">{p.productName}</p>
                        <p className="text-xs text-muted-foreground">Price: {fmt(p.price)}</p>
                      </div>
                    </div>
                    <span className="font-semibold text-sm">{fmtNum(p.totalQuantity ?? 0)} units</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Top by Value */}
        {reportData?.topProductsByValue && reportData.topProductsByValue.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base font-semibold">Top Products by Value</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {reportData.topProductsByValue.map((p, i) => (
                  <div key={p.productId} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="flex h-7 w-7 items-center justify-center rounded-full bg-green-500/10 text-xs font-bold text-green-600">{i + 1}</span>
                      <div>
                        <p className="text-sm font-medium">{p.productName}</p>
                        <p className="text-xs text-muted-foreground">Price: {fmt(p.price)}</p>
                      </div>
                    </div>
                    <span className="font-semibold text-sm">{fmt(p.totalValue ?? 0)}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* ── Low Stock Alerts ──────────────────────────────────── */}
      {reportData?.lowStockAlerts && reportData.lowStockAlerts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base font-semibold text-yellow-600">
              <AlertTriangle className="h-4 w-4" /> Low Stock Alerts ({reportData.lowStockAlerts.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-muted-foreground">
                    <th className="pb-3 font-medium">Product</th>
                    <th className="pb-3 font-medium">Variant</th>
                    <th className="pb-3 font-medium">Warehouse</th>
                    <th className="pb-3 font-medium text-right">Current Stock</th>
                    <th className="pb-3 font-medium text-right">Minimum</th>
                  </tr>
                </thead>
                <tbody>
                  {reportData.lowStockAlerts.map((alert, i) => (
                    <tr key={`${alert.productId}-${i}`} className="border-b last:border-0">
                      <td className="py-3 font-medium">{alert.productName}</td>
                      <td className="py-3">{alert.variantName}</td>
                      <td className="py-3">{alert.warehouse}</td>
                      <td className="py-3 text-right">
                        <span className={`font-semibold ${alert.currentStock <= alert.minimumStock / 2 ? 'text-red-600' : 'text-yellow-600'}`}>
                          {fmtNum(alert.currentStock)}
                        </span>
                      </td>
                      <td className="py-3 text-right">{fmtNum(alert.minimumStock)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

       <div className="grid gap-4 md:grid-cols-1">
        <DamagedProductsTable data={damagedData} />
      </div>
    </div>
  );
}
