import { useState } from 'react';
import { useDocumentTitle } from '@/shared/hooks/use-document-title';
import { useClubSalesReport } from '../hooks/use-club-sales-report';
import { SalesKpiCard } from '../components/sales-kpi-card';
import { TopProductCard } from '../components/top-product-card';
import { DollarSign, ShoppingCart, Package } from 'lucide-react';
import { Alert, AlertDescription } from '@/shared/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Search, X, Calendar } from 'lucide-react';

export default function ClubSalesReportPage() {
  useDocumentTitle('Club Sales Report');

  const [clubId, setClubId] = useState<string>('');
  const [clubIdInput, setClubIdInput] = useState<string>('');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [dateError, setDateError] = useState<string>('');

  const { data, loading, error } = useClubSalesReport(
    clubId
      ? {
          clubId,
          startDate: startDate || undefined,
          endDate: endDate || undefined,
        }
      : null
  );

  const handleSearch = () => {
    if (!clubIdInput.trim()) {
      return;
    }
    setClubId(clubIdInput.trim());
  };

  const handleClearFilters = () => {
    setStartDate('');
    setEndDate('');
  };

  const handleClearAll = () => {
    setClubId('');
    setClubIdInput('');
    setStartDate('');
    setEndDate('');
    setDateError('');
  };

  const handleDateChange = (type: 'start' | 'end', value: string) => {
    if (type === 'start') {
      setStartDate(value);
      if (endDate && value && new Date(value) > new Date(endDate)) {
        setDateError('Start date cannot be after end date');
      } else {
        setDateError('');
      }
    } else {
      setEndDate(value);
      if (startDate && value && new Date(value) < new Date(startDate)) {
        setDateError('End date cannot be before start date');
      } else {
        setDateError('');
      }
    }
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

  const hasDateFilters = startDate || endDate;

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
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Search className="h-5 w-5" />
            Select Club
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <div className="flex-1 space-y-2">
              <Label htmlFor="clubIdInput">Club ID *</Label>
              <Input
                id="clubIdInput"
                type="text"
                placeholder="Enter club ID (required)..."
                value={clubIdInput}
                onChange={(e) => setClubIdInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                aria-label="Club ID input"
                aria-required="true"
              />
            </div>
            <div className="flex items-end">
              <Button onClick={handleSearch} disabled={!clubIdInput.trim()}>
                <Search className="mr-2 h-4 w-4" />
                Search
              </Button>
            </div>
          </div>

          {clubId && (
            <Button variant="outline" size="sm" onClick={handleClearAll} className="w-full">
              <X className="mr-2 h-4 w-4" />
              Clear All
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Date Filters - Only show when club is selected */}
      {clubId && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Calendar className="h-5 w-5" />
              Date Filters (Optional)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="startDate">Start Date</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={startDate}
                  onChange={(e) => handleDateChange('start', e.target.value)}
                  aria-label="Start date filter"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endDate">End Date</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={endDate}
                  onChange={(e) => handleDateChange('end', e.target.value)}
                  aria-label="End date filter"
                />
              </div>
            </div>

            {dateError && (
              <p className="text-sm text-destructive" role="alert">
                {dateError}
              </p>
            )}

            {hasDateFilters && (
              <Button variant="outline" size="sm" onClick={handleClearFilters} className="w-full">
                <X className="mr-2 h-4 w-4" />
                Clear Date Filters
              </Button>
            )}
          </CardContent>
        </Card>
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
          <p className="text-sm text-muted-foreground">Showing results for:</p>
          <h2 className="text-2xl font-bold text-primary">{data.clubName}</h2>
        </div>
      )}

      {/* KPI Cards - Only show when club is selected and data is loaded */}
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
            <h3 className="text-lg font-semibold mb-2">No Club Selected</h3>
            <p className="text-sm text-muted-foreground max-w-md">
              Enter a club ID above to view detailed sales metrics and performance data for that
              specific club.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
