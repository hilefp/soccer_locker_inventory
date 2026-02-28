import { useState } from 'react';
import { useDocumentTitle } from '@/shared/hooks/use-document-title';
import { useGeneralSalesReport } from '../hooks/use-general-sales-report';
import { SalesKpiCard } from '../components/sales-kpi-card';
import { SalesDateFilters } from '../components/sales-date-filters';
import { SalesChart } from '../components/sales-chart';
import { DollarSign, ShoppingCart, Package, TrendingUp } from 'lucide-react';
import { Alert, AlertDescription } from '@/shared/components/ui/alert';
import { AlertCircle } from 'lucide-react';

export default function GeneralSalesReportPage() {
  useDocumentTitle('General Sales Report');

  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [clubId, setClubId] = useState<string>('');

  const { data, loading, error } = useGeneralSalesReport({
    startDate: startDate || undefined,
    endDate: endDate || undefined,
    clubId: clubId || undefined,
  });

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

  // Mock data for charts - In production, this would come from the API
  const netSalesChartData = [
    { date: '1', currentYear: 1200, previousYear: 800 },
    { date: '2', currentYear: 1100, previousYear: 1300 },
    { date: '3', currentYear: 2800, previousYear: 1000 },
    { date: '4', currentYear: 900, previousYear: 1200 },
    { date: '5', currentYear: 1500, previousYear: 800 },
    { date: '6', currentYear: 800, previousYear: 600 },
    { date: '7', currentYear: 600, previousYear: 1100 },
    { date: '8', currentYear: 1200, previousYear: 900 },
    { date: '9', currentYear: 1300, previousYear: 1000 },
    { date: '10', currentYear: 1000, previousYear: 900 },
    { date: '11', currentYear: 900, previousYear: 1100 },
    { date: '12', currentYear: 1700, previousYear: 1200 },
    { date: '13', currentYear: 1300, previousYear: 1300 },
    { date: '14', currentYear: 800, previousYear: 900 },
    { date: '15', currentYear: 700, previousYear: 800 },
    { date: '16', currentYear: 800, previousYear: 700 },
  ];

  const ordersChartData = [
    { date: '1', currentYear: 6, previousYear: 5 },
    { date: '2', currentYear: 8, previousYear: 6 },
    { date: '3', currentYear: 10, previousYear: 9 },
    { date: '4', currentYear: 13, previousYear: 11 },
    { date: '5', currentYear: 12, previousYear: 7 },
    { date: '6', currentYear: 9, previousYear: 8 },
    { date: '7', currentYear: 7, previousYear: 6 },
    { date: '8', currentYear: 5, previousYear: 10 },
    { date: '9', currentYear: 9, previousYear: 8 },
    { date: '10', currentYear: 10, previousYear: 7 },
    { date: '11', currentYear: 8, previousYear: 9 },
    { date: '12', currentYear: 11, previousYear: 10 },
    { date: '13', currentYear: 10, previousYear: 11 },
    { date: '14', currentYear: 7, previousYear: 9 },
    { date: '15', currentYear: 8, previousYear: 7 },
    { date: '16', currentYear: 9, previousYear: 8 },
  ];

  const currentYearLabel = 'February 16, 2026';
  const previousYearLabel = 'February 16, 2025';

  const netSalesCurrentTotal = netSalesChartData.reduce((sum, item) => sum + item.currentYear, 0);
  const netSalesPreviousTotal = netSalesChartData.reduce((sum, item) => sum + item.previousYear, 0);
  const ordersCurrentTotal = ordersChartData.reduce((sum, item) => sum + item.currentYear, 0);
  const ordersPreviousTotal = ordersChartData.reduce((sum, item) => sum + item.previousYear, 0);

  return (
    <div className="container-fluid space-y-6 lg:space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">General Sales Report</h1>
        <p className="text-muted-foreground mt-2">
          Overview of sales performance and key metrics across all clubs.
        </p>
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
            <select className="rounded-lg border border-input bg-background px-3 py-2 text-sm">
              <option>By day</option>
              <option>By week</option>
              <option>By month</option>
            </select>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <SalesChart
            title="Net sales"
            data={netSalesChartData}
            currentYearLabel={`Month to date (Feb 1 - 16, 2026)`}
            previousYearLabel={`Previous year (Feb 1 - 16, 2025)`}
            currentYearTotal={netSalesCurrentTotal}
            previousYearTotal={netSalesPreviousTotal}
            loading={loading}
            valuePrefix="$"
            formatValue={(value) => `$${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          />
          <SalesChart
            title="Orders"
            data={ordersChartData}
            currentYearLabel={`Month to date (Feb 1 - 16, 2026)`}
            previousYearLabel={`Previous year (Feb 1 - 16, 2025)`}
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
