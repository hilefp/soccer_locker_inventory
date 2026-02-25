import { useState } from 'react';
import { useDocumentTitle } from '@/shared/hooks/use-document-title';
import { useGeneralSalesReport } from '../hooks/use-general-sales-report';
import { SalesKpiCard } from '../components/sales-kpi-card';
import { SalesDateFilters } from '../components/sales-date-filters';
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
