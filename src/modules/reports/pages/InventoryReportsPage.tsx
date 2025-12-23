import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/components/ui/tabs';
import { InventoryReportFilters } from '../components/inventory-report-filters';
import { MonthlyEntriesVsExitsChart } from '../components/monthly-entries-vs-exits-chart';
import { MonthlyTotalStockChart } from '../components/monthly-total-stock-chart';
import { ObsoleteVariantsTable } from '../components/obsolete-variants-table';
import {
  useMonthlyEntriesVsExits,
  useObsoleteVariants,
  useMonthlyTotalStock,
} from '../hooks/use-inventory-reports';
import type { InventoryReportFilters as FilterTypes } from '../types/inventory-reports.types';
import { useDocumentTitle } from '@/shared/hooks/use-document-title';

export function InventoryReportsPage() {
  useDocumentTitle('Inventory Reports');

  const [activeTab, setActiveTab] = useState<'movements' | 'stock' | 'obsolete'>('movements');
  const [filters, setFilters] = useState<FilterTypes>();

  // Fetch data for all tabs
  const entriesVsExitsQuery = useMonthlyEntriesVsExits(filters);
  const totalStockQuery = useMonthlyTotalStock(filters);
  const obsoleteVariantsQuery = useObsoleteVariants(filters);

  const handleApplyFilters = (newFilters: FilterTypes) => {
    setFilters(newFilters);
  };

  const handleResetFilters = () => {
    setFilters({
      daysInactive: 90,
    });
  };

  return (
    <div className="container-fluid space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Inventory Reports</h1>
          <p className="text-muted-foreground">
            Analytics and insights for inventory movements and stock levels
          </p>
        </div>
      </div>

      {/* Filters */}
      <InventoryReportFilters
        onApply={handleApplyFilters}
        onReset={handleResetFilters}
        showDaysInactive={activeTab === 'obsolete'}
      />

      {/* Reports Tabs */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as typeof activeTab)}>
        <TabsList className="grid w-full max-w-md grid-cols-3">
          <TabsTrigger value="movements">Movements</TabsTrigger>
          <TabsTrigger value="stock">Stock</TabsTrigger>
          <TabsTrigger value="obsolete">Obsolete</TabsTrigger>
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

        {/* Obsolete Tab */}
        <TabsContent value="obsolete" className="space-y-6 mt-6">
          <ObsoleteVariantsTable
            data={obsoleteVariantsQuery.data}
            isLoading={obsoleteVariantsQuery.isLoading}
            error={obsoleteVariantsQuery.error}
          />
        </TabsContent>
      </Tabs> 
    </div>
  );
}
