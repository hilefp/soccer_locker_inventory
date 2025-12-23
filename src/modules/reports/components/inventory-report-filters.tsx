import { useState } from 'react';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Card } from '@/shared/components/ui/card';
import { Label } from '@/shared/components/ui/label';
import type { InventoryReportFilters } from '../types/inventory-reports.types';

interface InventoryReportFiltersProps {
  onApply: (filters: InventoryReportFilters) => void;
  onReset: () => void;
  showDaysInactive?: boolean;
}

const DEFAULT_DAYS_INACTIVE = 90;

export function InventoryReportFilters({
  onApply,
  onReset,
  showDaysInactive = false,
}: InventoryReportFiltersProps) {
  const [filters, setFilters] = useState<InventoryReportFilters>({
    dateFrom: '',
    dateTo: '',
    categoryId: '',
  });

  const handleInputChange = (field: keyof InventoryReportFilters, value: string | number) => {
    setFilters((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleApply = () => {
    // Remove empty values
    const cleanFilters = Object.entries(filters).reduce((acc, [key, value]) => {
      if (value !== '' && value !== undefined) {
        (acc as any)[key] = value;
      }
      return acc;
    }, {} as InventoryReportFilters);

    // Always include daysInactive with default if showDaysInactive is true
    if (showDaysInactive && !cleanFilters.daysInactive) {
      cleanFilters.daysInactive = DEFAULT_DAYS_INACTIVE;
    }

    onApply(cleanFilters);
  };

  const handleReset = () => {
    setFilters({
      dateFrom: '',
      dateTo: '',
      warehouseId: '',
      productVariantId: '',
      categoryId: '',
      daysInactive: DEFAULT_DAYS_INACTIVE,
    });
    onReset();
  };

  return (
    <Card className="p-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Filters</h3>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleReset}>
              Reset
            </Button>
            <Button size="sm" onClick={handleApply}>
              Apply
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Date From */}
          <div className="space-y-2">
            <Label htmlFor="dateFrom">Date From</Label>
            <Input
              id="dateFrom"
              type="date"
              value={filters.dateFrom}
              onChange={(e) => handleInputChange('dateFrom', e.target.value)}
              placeholder="YYYY-MM-DD"
            />
          </div>

          {/* Date To */}
          <div className="space-y-2">
            <Label htmlFor="dateTo">Date To</Label>
            <Input
              id="dateTo"
              type="date"
              value={filters.dateTo}
              onChange={(e) => handleInputChange('dateTo', e.target.value)}
              placeholder="YYYY-MM-DD"
            />
          </div>

      

          {/* Product Variant ID */}
          <div className="space-y-2">
            <Label htmlFor="productVariantId">Product Variant ID</Label>
            <Input
              id="productVariantId"
              type="text"
              value={filters.productVariantId}
              onChange={(e) => handleInputChange('productVariantId', e.target.value)}
              placeholder="Enter variant ID"
            />
          </div>

          {/* Days Inactive (only for obsolete tab) */}
          {showDaysInactive && (
            <div className="space-y-2">
              <Label htmlFor="daysInactive">Days Inactive</Label>
              <Input
                id="daysInactive"
                type="number"
                value={filters.daysInactive}
                onChange={(e) => handleInputChange('daysInactive', Number(e.target.value))}
                placeholder="90"
                min="1"
              />
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
