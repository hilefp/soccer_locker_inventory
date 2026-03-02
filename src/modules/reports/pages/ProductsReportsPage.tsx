import { useEffect, useState } from 'react';
import { productsReportsService } from '../services/products-reports.service';
import { ProductsReportDto } from '../types';
import { SalesKpiCard } from '../components/sales-kpi-card';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Alert, AlertDescription } from '@/shared/components/ui/alert';
import {
  Package,
  DollarSign,
  TrendingUp,
  AlertCircle,
  Layers,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  BarChart3,
  Loader2,
} from 'lucide-react';
import { useDocumentTitle } from '@/shared/hooks/use-document-title';

export default function ProductsReportsPage() {
  useDocumentTitle('Products Reports');

  const [data, setData] = useState<ProductsReportDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const report = await productsReportsService.getProductsReport();
        setData(report);
      } catch (err: any) {
        console.error('Failed to fetch product reports', err);
        setError(err?.response?.data?.message || 'Failed to fetch product reports');
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
        <h1 className="text-3xl font-bold tracking-tight">Products Reports</h1>
        <p className="text-muted-foreground mt-2">
          Overview of product catalog, pricing and inventory metrics.
        </p>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* ── Inventory Value ───────────────────────────────────── */}
      <div className="grid gap-4 md:grid-cols-3">
        <SalesKpiCard title="Inventory Value (Retail)" value={data ? fmt(data.totalInventoryValue) : '$0.00'} icon={DollarSign} description="Total retail value" iconClassName="text-blue-600" loading={loading} />
        <SalesKpiCard title="Inventory Cost" value={data ? fmt(data.totalInventoryCost) : '$0.00'} icon={DollarSign} description="Total cost" iconClassName="text-orange-600" loading={loading} />
        <SalesKpiCard title="Potential Profit" value={data ? fmt(data.potentialProfit) : '$0.00'} icon={TrendingUp} description="Revenue - Cost" iconClassName="text-green-600" loading={loading} />
      </div>

      {/* ── Main KPIs ─────────────────────────────────────────── */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <SalesKpiCard title="Total Products" value={data ? fmtNum(data.totalProducts) : '0'} icon={Package} description="Products in catalog" iconClassName="text-blue-600" loading={loading} />
        <SalesKpiCard title="Total Variants" value={data ? fmtNum(data.totalVariants) : '0'} icon={Layers} description="Product variants" iconClassName="text-indigo-600" loading={loading} />
        <SalesKpiCard title="Average Price" value={data ? fmt(data.averagePrice) : '$0.00'} icon={DollarSign} description="Avg product price" iconClassName="text-green-600" loading={loading} />
        <SalesKpiCard title="Profit Margin" value={data ? fmtPct(data.averageProfitMargin) : '0%'} icon={TrendingUp} description="Avg profit margin" iconClassName="text-emerald-600" loading={loading} />
      </div>

      {/* ── Stock Status & Price Range ────────────────────────── */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Stock status */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold">Stock Status</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-sm"><CheckCircle2 className="h-4 w-4 text-green-500" /> Active Products</span>
                  <span className="font-semibold">{fmtNum(data?.activeProducts ?? 0)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-sm"><XCircle className="h-4 w-4 text-red-500" /> Inactive Products</span>
                  <span className="font-semibold">{fmtNum(data?.inactiveProducts ?? 0)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-sm"><Package className="h-4 w-4 text-blue-500" /> With Stock</span>
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
              </div>
            )}
          </CardContent>
        </Card>

        {/* Price Range */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold">Price Range</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Lowest Price</span>
                  <span className="font-semibold">{fmt(data?.lowestPrice ?? 0)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Average Price</span>
                  <span className="font-semibold">{fmt(data?.averagePrice ?? 0)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Highest Price</span>
                  <span className="font-semibold">{fmt(data?.highestPrice ?? 0)}</span>
                </div>
                {data?.priceRangeDistribution && data.priceRangeDistribution.length > 0 && (
                  <>
                    <div className="border-t pt-3">
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-3">Distribution</p>
                      {data.priceRangeDistribution.map((item) => (
                        <div key={item.range} className="mb-2">
                          <div className="flex items-center justify-between text-sm mb-1">
                            <span>{item.range}</span>
                            <span className="text-muted-foreground">{item.productCount} ({fmtPct(item.percentage)})</span>
                          </div>
                          <div className="h-2 rounded-full bg-muted">
                            <div className="h-2 rounded-full bg-primary" style={{ width: `${item.percentage}%` }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

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
                    <th className="pb-3 font-medium text-right">Products</th>
                    <th className="pb-3 font-medium text-right">Variants</th>
                    <th className="pb-3 font-medium text-right">Avg Price</th>
                    <th className="pb-3 font-medium text-right">Inventory Value</th>
                    <th className="pb-3 font-medium text-right">% of Total</th>
                  </tr>
                </thead>
                <tbody>
                  {data.categoryStats.map((cat) => (
                    <tr key={cat.categoryId} className="border-b last:border-0">
                      <td className="py-3 font-medium">{cat.categoryName}</td>
                      <td className="py-3 text-right">{fmtNum(cat.totalProducts)}</td>
                      <td className="py-3 text-right">{fmtNum(cat.totalVariants)}</td>
                      <td className="py-3 text-right">{fmt(cat.averagePrice)}</td>
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

      {/* ── Brand Stats ───────────────────────────────────────── */}
      {data?.brandStats && data.brandStats.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base font-semibold">
              <BarChart3 className="h-4 w-4" /> Brands Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-muted-foreground">
                    <th className="pb-3 font-medium">Brand</th>
                    <th className="pb-3 font-medium text-right">Products</th>
                    <th className="pb-3 font-medium text-right">Variants</th>
                    <th className="pb-3 font-medium text-right">Avg Price</th>
                    <th className="pb-3 font-medium text-right">Inventory Value</th>
                    <th className="pb-3 font-medium text-right">% of Total</th>
                  </tr>
                </thead>
                <tbody>
                  {data.brandStats.map((brand) => (
                    <tr key={brand.brandId} className="border-b last:border-0">
                      <td className="py-3 font-medium">{brand.brandName}</td>
                      <td className="py-3 text-right">{fmtNum(brand.totalProducts)}</td>
                      <td className="py-3 text-right">{fmtNum(brand.totalVariants)}</td>
                      <td className="py-3 text-right">{fmt(brand.averagePrice)}</td>
                      <td className="py-3 text-right">{fmt(brand.inventoryValue)}</td>
                      <td className="py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <div className="h-2 w-16 rounded-full bg-muted">
                            <div className="h-2 rounded-full bg-indigo-500" style={{ width: `${brand.percentageOfTotal}%` }} />
                          </div>
                          <span>{fmtPct(brand.percentageOfTotal)}</span>
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
                      <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">{i + 1}</span>
                      <div>
                        <p className="text-sm font-medium">{p.productName}</p>
                        <p className="text-xs text-muted-foreground">{fmtNum(p.totalStock)} units · {p.variantCount} variants</p>
                      </div>
                    </div>
                    <span className="font-semibold text-sm">{fmt(p.inventoryValue)}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Top by Stock */}
        {data?.topProductsByStock && data.topProductsByStock.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base font-semibold">Top Products by Stock</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {data.topProductsByStock.map((p, i) => (
                  <div key={p.productId} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="flex h-7 w-7 items-center justify-center rounded-full bg-orange-500/10 text-xs font-bold text-orange-600">{i + 1}</span>
                      <div>
                        <p className="text-sm font-medium">{p.productName}</p>
                        <p className="text-xs text-muted-foreground">{fmt(p.inventoryValue)} · {p.variantCount} variants</p>
                      </div>
                    </div>
                    <span className="font-semibold text-sm">{fmtNum(p.totalStock)} units</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
