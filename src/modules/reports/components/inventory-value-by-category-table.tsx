import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { ArrowUpDown, BarChart3 } from 'lucide-react';
import type { InventoryValueByCategory } from '../types';

interface InventoryValueByCategoryTableProps {
  data: InventoryValueByCategory[];
  loading: boolean;
}

type SortKey = keyof InventoryValueByCategory;
type SortDir = 'asc' | 'desc';

const fmt = (v: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 }).format(v);

const fmtNum = (v: number) => new Intl.NumberFormat('en-US').format(v);

const fmtPct = (v: number) => `${v.toFixed(2)}%`;

export function InventoryValueByCategoryTable({ data, loading }: InventoryValueByCategoryTableProps) {
  const [sortKey, setSortKey] = useState<SortKey>('inventoryValueRetail');
  const [sortDir, setSortDir] = useState<SortDir>('desc');

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

  const totals = useMemo(() => {
    return data.reduce(
      (acc, r) => ({
        totalQuantity: acc.totalQuantity + r.totalQuantity,
        productCount: acc.productCount + r.productCount,
        variantCount: acc.variantCount + r.variantCount,
        inventoryValueCost: acc.inventoryValueCost + r.inventoryValueCost,
        inventoryValueRetail: acc.inventoryValueRetail + r.inventoryValueRetail,
        potentialProfit: acc.potentialProfit + r.potentialProfit,
      }),
      { totalQuantity: 0, productCount: 0, variantCount: 0, inventoryValueCost: 0, inventoryValueRetail: 0, potentialProfit: 0 }
    );
  }, [data]);

  const columns: { key: SortKey; label: string; align?: 'right' }[] = [
    { key: 'categoryName', label: 'Category' },
    { key: 'totalQuantity', label: 'Quantity', align: 'right' },
    { key: 'productCount', label: 'Products', align: 'right' },
    { key: 'variantCount', label: 'Variants', align: 'right' },
    { key: 'inventoryValueCost', label: 'Value (Cost)', align: 'right' },
    { key: 'inventoryValueRetail', label: 'Value (Retail)', align: 'right' },
    { key: 'potentialProfit', label: 'Profit', align: 'right' },
    { key: 'profitMargin', label: 'Margin %', align: 'right' },
    { key: 'percentageOfTotal', label: '% of Total', align: 'right' },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base font-semibold">
          <BarChart3 className="h-4 w-4" /> Inventory Value by Category
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-10 animate-pulse rounded bg-muted" />
            ))}
          </div>
        ) : sorted.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">No data available</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-muted-foreground">
                  {columns.map((col) => (
                    <th
                      key={col.key}
                      className={`pb-3 font-medium cursor-pointer hover:text-foreground select-none ${col.align === 'right' ? 'text-right' : ''}`}
                      onClick={() => handleSort(col.key)}
                    >
                      <span className="inline-flex items-center gap-1">
                        {col.label}
                        {sortKey === col.key && (
                          <ArrowUpDown className="h-3 w-3" />
                        )}
                      </span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {sorted.map((row) => (
                  <tr key={row.categoryId} className="border-b last:border-0 hover:bg-muted/50">
                    <td className="py-3 font-medium">{row.categoryName}</td>
                    <td className="py-3 text-right">{fmtNum(row.totalQuantity)}</td>
                    <td className="py-3 text-right">{fmtNum(row.productCount)}</td>
                    <td className="py-3 text-right">{fmtNum(row.variantCount)}</td>
                    <td className="py-3 text-right">{fmt(row.inventoryValueCost)}</td>
                    <td className="py-3 text-right">{fmt(row.inventoryValueRetail)}</td>
                    <td className="py-3 text-right font-semibold text-green-600">{fmt(row.potentialProfit)}</td>
                    <td className="py-3 text-right">{fmtPct(row.profitMargin)}</td>
                    <td className="py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <div className="h-2 w-16 rounded-full bg-muted">
                          <div className="h-2 rounded-full bg-primary" style={{ width: `${row.percentageOfTotal}%` }} />
                        </div>
                        <span>{fmtPct(row.percentageOfTotal)}</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t-2 font-semibold">
                  <td className="py-3">Totals</td>
                  <td className="py-3 text-right">{fmtNum(totals.totalQuantity)}</td>
                  <td className="py-3 text-right">{fmtNum(totals.productCount)}</td>
                  <td className="py-3 text-right">{fmtNum(totals.variantCount)}</td>
                  <td className="py-3 text-right">{fmt(totals.inventoryValueCost)}</td>
                  <td className="py-3 text-right">{fmt(totals.inventoryValueRetail)}</td>
                  <td className="py-3 text-right text-green-600">{fmt(totals.potentialProfit)}</td>
                  <td className="py-3" colSpan={2}></td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
