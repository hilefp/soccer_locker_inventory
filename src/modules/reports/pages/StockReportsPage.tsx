import { useEffect, useState } from 'react';
import { stockReportsService } from '../services/stock-reports.service';
import { StockReportDto } from '../types';
import { SalesKpiCard } from '../components/sales-kpi-card';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Alert, AlertDescription } from '@/shared/components/ui/alert';
import {
  Boxes,
  DollarSign,
  Warehouse,
  AlertCircle,
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

export default function StockReportsPage() {
  useDocumentTitle('Stock Reports');

  const [data, setData] = useState<StockReportDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const report = await stockReportsService.getStockReport();
        setData(report);
      } catch (err: any) {
        console.error('Failed to fetch stock reports', err);
        setError(err?.response?.data?.message || 'Failed to fetch stock reports');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const fmt = (v: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 }).format(v);

  const fmtNum = (v: number) => new Intl.NumberFormat('en-US').format(v);

  const fmtPct = (v: number) => `${v.toFixed(2)}%`;

  return (
    <div className="container-fluid space-y-6 lg:space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Stock Reports</h1>
        <p className="text-muted-foreground mt-2">
          Analytics and insights for stock levels, movements and inventory health.
        </p>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* ── Main KPIs ─────────────────────────────────────────── */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <SalesKpiCard title="Total Quantity" value={data ? fmtNum(data.totalQuantity) : '0'} icon={Boxes} description="Total items in stock" iconClassName="text-blue-600" loading={loading} />
        <SalesKpiCard title="Available" value={data ? fmtNum(data.totalAvailableQuantity) : '0'} icon={CheckCircle2} description="Available for sale" iconClassName="text-green-600" loading={loading} />
        <SalesKpiCard title="Reserved" value={data ? fmtNum(data.totalReservedQuantity) : '0'} icon={Package} description="Reserved in orders" iconClassName="text-orange-600" loading={loading} />
        <SalesKpiCard title="Warehouses" value={data ? fmtNum(data.totalWarehouses) : '0'} icon={Warehouse} description="Active warehouses" iconClassName="text-purple-600" loading={loading} />
      </div>

      {/* ── Inventory Value ───────────────────────────────────── */}
      <div className="grid gap-4 md:grid-cols-3">
        <SalesKpiCard title="Inventory Cost" value={data ? fmt(data.totalInventoryValueCost) : '$0.00'} icon={DollarSign} description="Total cost value" iconClassName="text-orange-600" loading={loading} />
        <SalesKpiCard title="Retail Value" value={data ? fmt(data.totalInventoryValueRetail) : '$0.00'} icon={DollarSign} description="Total retail value" iconClassName="text-blue-600" loading={loading} />
        <SalesKpiCard title="Potential Revenue" value={data ? fmt(data.potentialRevenue) : '$0.00'} icon={TrendingUp} description="Retail - Cost" iconClassName="text-green-600" loading={loading} />
      </div>

      {/* ── Stock Health & Turnover ────────────────────────────── */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Stock Health */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold">Stock Health</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-sm"><Package className="h-4 w-4 text-blue-500" /> Unique Products</span>
                  <span className="font-semibold">{fmtNum(data?.uniqueProducts ?? 0)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-sm"><Boxes className="h-4 w-4 text-indigo-500" /> Unique Variants</span>
                  <span className="font-semibold">{fmtNum(data?.uniqueVariants ?? 0)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-sm"><CheckCircle2 className="h-4 w-4 text-green-500" /> With Stock</span>
                  <span className="font-semibold">{fmtNum(data?.productsWithStock ?? 0)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-sm"><AlertTriangle className="h-4 w-4 text-yellow-500" /> Low Stock</span>
                  <span className="font-semibold">{fmtNum(data?.productsWithLowStock ?? 0)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-sm"><XCircle className="h-4 w-4 text-red-500" /> Out of Stock</span>
                  <span className="font-semibold">{fmtNum(data?.productsOutOfStock ?? 0)}</span>
                </div>
                <div className="flex items-center justify-between border-t pt-3">
                  <span className="text-sm text-muted-foreground">Stock Accuracy</span>
                  <span className="font-semibold">{fmtPct(data?.stockAccuracy ?? 0)}</span>
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
            {loading ? (
              <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
            ) : data?.turnoverMetrics ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Avg Days to Sell</span>
                  <span className="font-semibold">{data.turnoverMetrics.averageDaysToSell.toFixed(1)} days</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Turnover Rate</span>
                  <span className="font-semibold">{data.turnoverMetrics.turnoverRate.toFixed(2)}x</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-sm"><TrendingUp className="h-4 w-4 text-green-500" /> Fast Moving</span>
                  <span className="font-semibold">{fmtNum(data.turnoverMetrics.fastMovingCount)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-sm"><ArrowDownUp className="h-4 w-4 text-yellow-500" /> Slow Moving</span>
                  <span className="font-semibold">{fmtNum(data.turnoverMetrics.slowMovingCount)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-sm"><XCircle className="h-4 w-4 text-red-500" /> Obsolete</span>
                  <span className="font-semibold">{fmtNum(data.turnoverMetrics.obsoleteCount)}</span>
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground py-4 text-center">No turnover data available</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* ── Movement Summary ──────────────────────────────────── */}
      {data?.movementSummary && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base font-semibold">
              <ArrowUpDown className="h-4 w-4" /> Movement Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div className="rounded-lg border p-4">
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">Entries</p>
                  <p className="text-2xl font-bold text-green-600">{fmtNum(data.movementSummary.totalEntries)}</p>
                </div>
                <div className="rounded-lg border p-4">
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">Exits</p>
                  <p className="text-2xl font-bold text-red-600">{fmtNum(data.movementSummary.totalExits)}</p>
                </div>
                <div className="rounded-lg border p-4">
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">Adjustments</p>
                  <p className="text-2xl font-bold text-blue-600">{fmtNum(data.movementSummary.totalAdjustments)}</p>
                </div>
                <div className="rounded-lg border p-4">
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">Net Change</p>
                  <p className={`text-2xl font-bold ${data.movementSummary.netChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {data.movementSummary.netChange >= 0 ? '+' : ''}{fmtNum(data.movementSummary.netChange)}
                  </p>
                </div>
                <div className="rounded-lg border p-4">
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">Transfers In</p>
                  <p className="text-2xl font-bold">{fmtNum(data.movementSummary.totalTransfersIn)}</p>
                </div>
                <div className="rounded-lg border p-4">
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">Transfers Out</p>
                  <p className="text-2xl font-bold">{fmtNum(data.movementSummary.totalTransfersOut)}</p>
                </div>
                <div className="rounded-lg border p-4">
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">Damaged</p>
                  <p className="text-2xl font-bold text-orange-600">{fmtNum(data.movementSummary.totalDamaged)}</p>
                </div>
                <div className="rounded-lg border p-4">
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">Lost</p>
                  <p className="text-2xl font-bold text-red-600">{fmtNum(data.movementSummary.totalLost)}</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* ── Warehouse Stats ───────────────────────────────────── */}
      {data?.warehouseStats && data.warehouseStats.length > 0 && (
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
                  {data.warehouseStats.map((wh) => (
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
      {data?.categoryStats && data.categoryStats.length > 0 && (
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
                  {data.categoryStats.map((cat) => (
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
        {data?.topProductsByQuantity && data.topProductsByQuantity.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base font-semibold">Top Products by Quantity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {data.topProductsByQuantity.map((p, i) => (
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
        {data?.topProductsByValue && data.topProductsByValue.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base font-semibold">Top Products by Value</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {data.topProductsByValue.map((p, i) => (
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
      {data?.lowStockAlerts && data.lowStockAlerts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base font-semibold text-yellow-600">
              <AlertTriangle className="h-4 w-4" /> Low Stock Alerts ({data.lowStockAlerts.length})
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
                  {data.lowStockAlerts.map((alert, i) => (
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
    </div>
  );
}
