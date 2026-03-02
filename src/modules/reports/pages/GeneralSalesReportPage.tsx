import { useState } from 'react';
import { useDocumentTitle } from '@/shared/hooks/use-document-title';
import { useGeneralSalesReport } from '../hooks/use-general-sales-report';
import { SalesKpiCard } from '../components/sales-kpi-card';
import { SalesDateFilters } from '../components/sales-date-filters';
import { SalesChart } from '../components/sales-chart';
import { DollarSign, ShoppingCart, Package, TrendingUp, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/shared/components/ui/alert';
import { GroupByPeriod } from '../types/sales-reports.types';
import { useGeneralSalesExport } from '../hooks/use-general-sales-export';
import { ExportExcelButton } from '../components/export-excel-button';

export default function GeneralSalesReportPage() {
  useDocumentTitle('General Sales Report');

  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [clubId, setClubId] = useState<string>('');
  const [groupBy, setGroupBy] = useState<GroupByPeriod>('day');

  const filters = {
    startDate: startDate || undefined,
    endDate: endDate || undefined,
    clubId: clubId || undefined,
    groupBy,
  };

  const { data, loading, error } = useGeneralSalesReport(filters);
  const { exporting, exportToExcel } = useGeneralSalesExport(filters);

  const handleClearFilters = () => {
    setStartDate('');
    setEndDate('');
    setClubId('');
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

  // Get chart data from API or use empty arrays
  const netSalesChartData = data?.chartData?.netSales || [];
  const ordersChartData = data?.chartData?.orders || [];
  const currentYearLabel = data?.chartData?.currentYearLabel || '';
  const previousYearLabel = data?.chartData?.previousYearLabel || '';

  // Calculate totals from chart data
  const netSalesCurrentTotal = netSalesChartData.reduce((sum, item) => sum + item.currentYear, 0);
  const netSalesPreviousTotal = netSalesChartData.reduce((sum, item) => sum + item.previousYear, 0);
  const ordersCurrentTotal = ordersChartData.reduce((sum, item) => sum + item.currentYear, 0);
  const ordersPreviousTotal = ordersChartData.reduce((sum, item) => sum + item.previousYear, 0);

  const handleGroupByChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setGroupBy(e.target.value as GroupByPeriod);
  };

  return (
    <div className="container-fluid space-y-6 lg:space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">General Sales Report</h1>
          <p className="text-muted-foreground mt-2">
            Overview of sales performance and key metrics across all clubs.
          </p>
        </div>
        <ExportExcelButton
          onClick={exportToExcel}
          loading={exporting}
          disabled={loading}
        />
      </div>

      {/* Filters */}
      <SalesDateFilters
        startDate={startDate}
        endDate={endDate}
        onStartDateChange={setStartDate}
        onEndDateChange={setEndDate}
        onClearFilters={handleClearFilters}
        showClubFilter={true}
        clubId={clubId}
        onClubIdChange={setClubId}
      />

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <SalesKpiCard
          title="Net Sales"
          value={data ? formatCurrency(data.netSales) : '$0.00'}
          icon={DollarSign}
          description="Total revenue after discounts"
          iconClassName="text-green-600"
          loading={loading}
        />
        <SalesKpiCard
          title="Gross Sales"
          value={data ? formatCurrency(data.grossSales) : '$0.00'}
          icon={TrendingUp}
          description="Total revenue before discounts"
          iconClassName="text-blue-600"
          loading={loading}
        />
        <SalesKpiCard
          title="Total Orders"
          value={data ? formatNumber(data.totalOrders) : '0'}
          icon={ShoppingCart}
          description="Number of completed orders"
          iconClassName="text-purple-600"
          loading={loading}
        />
        <SalesKpiCard
          title="Products Sold"
          value={data ? formatNumber(data.totalProductsSold) : '0'}
          icon={Package}
          description="Total items sold"
          iconClassName="text-orange-600"
          loading={loading}
        />
      </div>

      {/* Charts Section */}
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
    </div>
  );
}
