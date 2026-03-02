import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Input } from '@/shared/components/ui/input';
import { ArrowUpDown, Search } from 'lucide-react';
import type { InventoryValueBySku } from '../types';

interface InventoryValueBySkuTableProps {
  data: InventoryValueBySku[];
  loading: boolean;
}

type SortKey = keyof InventoryValueBySku;
type SortDir = 'asc' | 'desc';

const fmt = (v: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 }).format(v);

const fmtNum = (v: number) => new Intl.NumberFormat('en-US').format(v);

export function InventoryValueBySkuTable({ data, loading }: InventoryValueBySkuTableProps) {
  const [search, setSearch] = useState('');
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

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return data
      .filter((r) => r.productName.toLowerCase().includes(q) || r.sku.toLowerCase().includes(q) || r.categoryName.toLowerCase().includes(q))
      .sort((a, b) => {
        const aVal = a[sortKey];
        const bVal = b[sortKey];
        if (typeof aVal === 'string' && typeof bVal === 'string') {
          return sortDir === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
        }
        return sortDir === 'asc' ? (aVal as number) - (bVal as number) : (bVal as number) - (aVal as number);
      });
  }, [data, search, sortKey, sortDir]);

  const totals = useMemo(() => {
    return filtered.reduce(
      (acc, r) => ({
        quantity: acc.quantity + r.quantity,
        inventoryValueCost: acc.inventoryValueCost + r.inventoryValueCost,
        inventoryValueRetail: acc.inventoryValueRetail + r.inventoryValueRetail,
        potentialProfit: acc.potentialProfit + r.potentialProfit,
      }),
      { quantity: 0, inventoryValueCost: 0, inventoryValueRetail: 0, potentialProfit: 0 }
    );
  }, [filtered]);

  const columns: { key: SortKey; label: string; align?: 'right' }[] = [
    { key: 'productName', label: 'Product' },
    { key: 'sku', label: 'SKU' },
    { key: 'categoryName', label: 'Category' },
    { key: 'quantity', label: 'Qty', align: 'right' },
    { key: 'unitCost', label: 'Unit Cost', align: 'right' },
    { key: 'unitPrice', label: 'Unit Price', align: 'right' },
    { key: 'inventoryValueCost', label: 'Value (Cost)', align: 'right' },
    { key: 'inventoryValueRetail', label: 'Value (Retail)', align: 'right' },
    { key: 'potentialProfit', label: 'Profit', align: 'right' },
  ];

  return (
    <Card>
      <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <CardTitle className="text-base font-semibold">Inventory Value by SKU</CardTitle>
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, SKU or category..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-10 animate-pulse rounded bg-muted" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
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
                {filtered.map((row) => (
                  <tr key={row.variantId} className="border-b last:border-0 hover:bg-muted/50">
                    <td className="py-3 font-medium">{row.productName}</td>
                    <td className="py-3 text-muted-foreground">{row.sku}</td>
                    <td className="py-3">{row.categoryName}</td>
                    <td className="py-3 text-right">{fmtNum(row.quantity)}</td>
                    <td className="py-3 text-right">{fmt(row.unitCost)}</td>
                    <td className="py-3 text-right">{fmt(row.unitPrice)}</td>
                    <td className="py-3 text-right">{fmt(row.inventoryValueCost)}</td>
                    <td className="py-3 text-right">{fmt(row.inventoryValueRetail)}</td>
                    <td className="py-3 text-right font-semibold text-green-600">{fmt(row.potentialProfit)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t-2 font-semibold">
                  <td className="py-3" colSpan={3}>Totals</td>
                  <td className="py-3 text-right">{fmtNum(totals.quantity)}</td>
                  <td className="py-3" colSpan={2}></td>
                  <td className="py-3 text-right">{fmt(totals.inventoryValueCost)}</td>
                  <td className="py-3 text-right">{fmt(totals.inventoryValueRetail)}</td>
                  <td className="py-3 text-right text-green-600">{fmt(totals.potentialProfit)}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
