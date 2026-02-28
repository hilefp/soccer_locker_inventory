import { useState } from 'react';
import { useDocumentTitle } from '@/shared/hooks/use-document-title';
import { useClubSalesReport } from '../hooks/use-club-sales-report';
import { SalesKpiCard } from '../components/sales-kpi-card';
import { SalesDateFilters } from '../components/sales-date-filters';
import { SalesChart } from '../components/sales-chart';
import { TopProductCard } from '../components/top-product-card';
import { DollarSign, ShoppingCart, Package } from 'lucide-react';
import { Alert, AlertDescription } from '@/shared/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Search, X } from 'lucide-react';
import { GroupByPeriod } from '../types/sales-reports.types';

export default function ClubSalesReportPage() {
  useDocumentTitle('Club Sales Report');

  const [clubId, setClubId] = useState<string>('');
  const [clubIdInput, setClubIdInput] = useState<string>('');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [groupBy, setGroupBy] = useState<GroupByPeriod>('day');

  const { data, loading, error } = useClubSalesReport(
    clubId
      ? {
          clubId,
          startDate: startDate || undefined,
          endDate: endDate || undefined,
          groupBy,
        }
      : null
  );

  const handleSearch = () => {
    if (!clubIdInput.trim()) {
      return;
    }
    setClubId(clubIdInput.trim());
  };

  const handleClearAll = () => {
    setClubId('');
    setClubIdInput('');
    setStartDate('');
    setEndDate('');
  };

  const handleClearDateFilters = () => {
    setStartDate('');
    setEndDate('');
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(value);
  };

  const formatNumber = (value: number) => {
    return new Intl.NumberFormat('en-US').format(value);
  };

  const handleGroupByChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setGroupBy(e.target.value as GroupByPeriod);
  };

  // Get chart data from API
  const netSalesChartData = data?.chartData?.netSales || [];
  const ordersChartData = data?.chartData?.orders || [];
  const currentYearLabel = data?.chartData?.currentYearLabel || '';
  const previousYearLabel = data?.chartData?.previousYearLabel || '';

  const netSalesCurrentTotal = netSalesChartData.reduce((sum, item) => sum + item.currentYear, 0);
  const netSalesPreviousTotal = netSalesChartData.reduce((sum, item) => sum + item.previousYear, 0);
  const ordersCurrentTotal = ordersChartData.reduce((sum, item) => sum + item.currentYear, 0);
  const ordersPreviousTotal = ordersChartData.reduce((sum, item) => sum + item.previousYear, 0);

  return (
    <div className="container-fluid space-y-6 lg:space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Club Sales Report</h1>
        <p className="text-muted-foreground mt-2">
          Detailed sales performance and metrics for a specific club.
        </p>
      </div>

      {/* Club Selector */}
      <Card className="border-none shadow-md">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2.5 text-base font-semibold">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
              <Search className="h-4.5 w-4.5 text-primary" />
            </div>
            <span>Seleccionar Club</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <div className="flex-1 space-y-2">
              <Label htmlFor="clubIdInput" className="text-sm font-medium">
                Club ID <span className="text-destructive">*</span>
              </Label>
              <Input
                id="clubIdInput"
                type="text"
                placeholder="Ingresa el ID del club (requerido)..."
                value={clubIdInput}
                onChange={(e) => setClubIdInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                className="rounded-lg border-2 focus:border-primary"
                aria-label="Club ID input"
                aria-required="true"
              />
            </div>
            <div className="flex items-end">
              <Button onClick={handleSearch} disabled={!clubIdInput.trim()}>
                <Search className="mr-2 h-4 w-4" />
                Buscar
              </Button>
            </div>
          </div>

          {clubId && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleClearAll}
              className="w-full rounded-lg border-2 hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30 transition-all duration-200"
            >
              <X className="mr-2 h-4 w-4" />
              Limpiar Todo
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Date Filters - Only show when club is selected */}
      {clubId && (
        <SalesDateFilters
          startDate={startDate}
          endDate={endDate}
          onStartDateChange={setStartDate}
          onEndDateChange={setEndDate}
          onClearFilters={handleClearDateFilters}
        />
      )}

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Club Name Display */}
      {data && (
        <div className="rounded-lg border bg-primary/5 p-4">
          <p className="text-sm text-muted-foreground">Mostrando resultados para:</p>
          <h2 className="text-2xl font-bold text-primary">{data.clubName}</h2>
        </div>
      )}

      {/* KPI Cards - Only show when club is selected */}
      {clubId && (
        <div className="grid gap-4 md:grid-cols-3">
          <SalesKpiCard
            title="Total Orders"
            value={data ? formatNumber(data.totalOrders) : '0'}
            icon={ShoppingCart}
            description="Number of completed orders"
            iconClassName="text-purple-600"
            loading={loading}
          />
          <SalesKpiCard
            title="Net Sales"
            value={data ? formatCurrency(data.netSales) : '$0.00'}
            icon={DollarSign}
            description="Total revenue for this club"
            iconClassName="text-green-600"
            loading={loading}
          />
          <SalesKpiCard
            title="Items Sold"
            value={data ? formatNumber(data.itemsSold) : '0'}
            icon={Package}
            description="Total products sold"
            iconClassName="text-orange-600"
            loading={loading}
          />
        </div>
      )}

      {/* Charts Section - Only show when club is selected */}
      {clubId && (
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">Charts</h2>
            <div className="flex items-center gap-2">
              <select
                className="rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                value={groupBy}
                onChange={handleGroupByChange}
              >
                <option value="day">By day</option>
                <option value="week">By week</option>
                <option value="month">By month</option>
              </select>
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <SalesChart
              title="Net sales"
              data={netSalesChartData}
              currentYearLabel={currentYearLabel}
              previousYearLabel={previousYearLabel}
              currentYearTotal={netSalesCurrentTotal}
              previousYearTotal={netSalesPreviousTotal}
              loading={loading}
              valuePrefix="$"
              formatValue={(value) => `$${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
            />
            <SalesChart
              title="Orders"
              data={ordersChartData}
              currentYearLabel={currentYearLabel}
              previousYearLabel={previousYearLabel}
              currentYearTotal={ordersCurrentTotal}
              previousYearTotal={ordersPreviousTotal}
              loading={loading}
            />
          </div>
        </div>
      )}

      {/* Top Product Section - Only show when club is selected */}
      {clubId && <TopProductCard topProduct={data?.topProduct || null} loading={loading} />}

      {/* Date Range Info */}
      {data?.dateRange && (data.dateRange.startDate || data.dateRange.endDate) && (
        <div className="rounded-lg border bg-muted/50 p-4">
          <p className="text-sm text-muted-foreground">
            <span className="font-medium">Date Range:</span>{' '}
            {data.dateRange.startDate || 'All time'} to{' '}
            {data.dateRange.endDate || 'Present'}
          </p>
        </div>
      )}

      {/* Empty State - Show when no club is selected */}
      {!clubId && (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <Search className="h-16 w-16 text-muted-foreground/50 mb-4" />
            <h3 className="text-lg font-semibold mb-2">Ningún Club Seleccionado</h3>
            <p className="text-sm text-muted-foreground max-w-md">
              Ingresa un ID de club arriba para ver las métricas de ventas detalladas y datos de
              rendimiento de ese club específico.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
