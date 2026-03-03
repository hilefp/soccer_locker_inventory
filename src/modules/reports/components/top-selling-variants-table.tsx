import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Checkbox } from '@/shared/components/ui/checkbox';
import { ArrowUpDown, Download, Loader2 } from 'lucide-react';
import type { TopSellingVariant, ClubSalesFilters } from '../types/sales-reports.types';
import { salesReportsService } from '../services/sales-reports.service';
import { toast } from 'sonner';

interface TopSellingVariantsTableProps {
  data: TopSellingVariant[];
  filters: ClubSalesFilters;
  loading?: boolean;
}

type SortKey = keyof TopSellingVariant;
type SortDir = 'asc' | 'desc';

export function TopSellingVariantsTable({ data, filters, loading = false }: TopSellingVariantsTableProps) {
  const [selectedRows, setSelectedRows] = useState<Set<number>>(new Set());
  const [sortKey, setSortKey] = useState<SortKey>('quantitySold');
  const [sortDir, setSortDir] = useState<SortDir>('desc');
  const [exporting, setExporting] = useState(false);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir('desc');
    }
  };

  const sorted = useMemo(() => {
    return [...data].sort((a, b) => {
      const aVal = a[sortKey];
      const bVal = b[sortKey];
      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return sortDir === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
      }
      return sortDir === 'asc' ? (aVal as number) - (bVal as number) : (bVal as number) - (aVal as number);
    });
  }, [data, sortKey, sortDir]);

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedRows(new Set(sorted.map((_, idx) => idx)));
    } else {
      setSelectedRows(new Set());
    }
  };

  const handleSelectRow = (index: number, checked: boolean) => {
    const newSelected = new Set(selectedRows);
    if (checked) {
      newSelected.add(index);
    } else {
      newSelected.delete(index);
    }
    setSelectedRows(newSelected);
  };

  const handleExport = async () => {
    try {
      setExporting(true);
      const blob = await salesReportsService.exportClubSalesVariations(filters);
      
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `club-sales-variations-${new Date().toISOString().split('T')[0]}.xlsx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      toast.success('Variations exported successfully');
    } catch (error) {
      console.error('Export failed:', error);
      toast.error('Failed to export variations');
    } finally {
      setExporting(false);
    }
  };

  const allSelected = sorted.length > 0 && selectedRows.size === sorted.length;
  const someSelected = selectedRows.size > 0 && selectedRows.size < sorted.length;

  return (
    <Card>
      <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <CardTitle className="text-lg font-semibold">Variations</CardTitle>
        <Button
          onClick={handleExport}
          disabled={exporting || loading || data.length === 0}
          size="sm"
          variant="outline"
        >
          {exporting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Exporting...
            </>
          ) : (
            <>
              <Download className="mr-2 h-4 w-4" />
              Export Excel
            </>
          )}
        </Button>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-12 animate-pulse rounded bg-muted" />
            ))}
          </div>
        ) : sorted.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">No variations available</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="pb-3 pr-4 text-left w-12">
                    <Checkbox
                      checked={allSelected}
                      onCheckedChange={handleSelectAll}
                      aria-label="Select all"
                      className={someSelected ? 'data-[state=checked]:bg-primary/50' : ''}
                    />
                  </th>
                  <th
                    className="pb-3 pr-4 text-left font-medium cursor-pointer hover:text-foreground select-none"
                    onClick={() => handleSort('productName')}
                  >
                    <span className="inline-flex items-center gap-1">
                      Product / Variation title
                      {sortKey === 'productName' && (
                        <ArrowUpDown className="h-3 w-3" />
                      )}
                    </span>
                  </th>
                  <th
                    className="pb-3 pr-4 text-left font-medium cursor-pointer hover:text-foreground select-none"
                    onClick={() => handleSort('sku')}
                  >
                    <span className="inline-flex items-center gap-1">
                      SKU
                      {sortKey === 'sku' && (
                        <ArrowUpDown className="h-3 w-3" />
                      )}
                    </span>
                  </th>
                  <th
                    className="pb-3 text-right font-medium cursor-pointer hover:text-foreground select-none"
                    onClick={() => handleSort('quantitySold')}
                  >
                    <span className="inline-flex items-center gap-1 justify-end">
                      Items sold
                      {sortKey === 'quantitySold' && (
                        <ArrowUpDown className="h-3 w-3" />
                      )}
                    </span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {sorted.map((row, index) => (
                  <tr
                    key={index}
                    className="border-b last:border-0 hover:bg-muted/30 transition-colors"
                  >
                    <td className="py-3 pr-4">
                      <Checkbox
                        checked={selectedRows.has(index)}
                        onCheckedChange={(checked) => handleSelectRow(index, checked as boolean)}
                        aria-label={`Select ${row.productName}`}
                      />
                    </td>
                    <td className="py-3 pr-4">
                      <a href="#" className="text-blue-600 hover:underline">
                        {row.productName}
                      </a>
                    </td>
                    <td className="py-3 pr-4 text-muted-foreground">{row.sku}</td>
                    <td className="py-3 text-right font-medium">{row.quantitySold.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
