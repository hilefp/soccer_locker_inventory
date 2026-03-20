import { useState, useMemo } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select';
import { ArrowUpDown, ChevronLeft, ChevronRight, Search } from 'lucide-react';
import type { InventoryValueBySku } from '../types';

interface InventoryValueBySkuTableProps {
  data: InventoryValueBySku[];
  loading: boolean;
}

type SortKey = keyof InventoryValueBySku;
type SortDir = 'asc' | 'desc';

const PAGE_SIZE_OPTIONS = [10, 25, 50, 100];

const fmt = (v: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 }).format(v);

const fmtNum = (v: number) => new Intl.NumberFormat('en-US').format(v);

export function InventoryValueBySkuTable({ data, loading }: InventoryValueBySkuTableProps) {
  const [search, setSearch] = useState('');
  const [sortKey, setSortKey] = useState<SortKey>('inventoryValueRetail');
  const [sortDir, setSortDir] = useState<SortDir>('desc');
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(10);

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

  // Reset to first page when search or sort changes
  useMemo(() => {
    setPageIndex(0);
  }, [search, sortKey, sortDir]);

  const pageCount = Math.ceil(filtered.length / pageSize);
  const paginatedRows = filtered.slice(pageIndex * pageSize, (pageIndex + 1) * pageSize);
  const from = filtered.length === 0 ? 0 : pageIndex * pageSize + 1;
  const to = Math.min((pageIndex + 1) * pageSize, filtered.length);

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
            onChange={(e) => {
              setSearch(e.target.value);
              setPageIndex(0);
            }}
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
                {paginatedRows.map((row) => (
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
      {!loading && filtered.length > 0 && (
        <CardFooter className="flex flex-col sm:flex-row items-center justify-between gap-2.5 py-4">
          <div className="flex items-center gap-2.5">
            <span className="text-sm text-muted-foreground">Rows per page</span>
            <Select
              value={`${pageSize}`}
              onValueChange={(value) => {
                setPageSize(Number(value));
                setPageIndex(0);
              }}
            >
              <SelectTrigger className="w-fit" size="sm">
                <SelectValue placeholder={`${pageSize}`} />
              </SelectTrigger>
              <SelectContent side="top" className="min-w-[50px]">
                {PAGE_SIZE_OPTIONS.map((size) => (
                  <SelectItem key={size} value={`${size}`}>
                    {size}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-2.5">
            <span className="text-sm text-muted-foreground">
              {from} - {to} of {filtered.length}
            </span>
            {pageCount > 1 && (
              <div className="flex items-center gap-1">
                <Button
                  size="sm"
                  mode="icon"
                  variant="ghost"
                  className="size-7 p-0"
                  onClick={() => setPageIndex((p) => p - 1)}
                  disabled={pageIndex === 0}
                >
                  <ChevronLeft className="size-4" />
                </Button>
                {(() => {
                  const maxVisible = 5;
                  const groupStart = Math.floor(pageIndex / maxVisible) * maxVisible;
                  const groupEnd = Math.min(groupStart + maxVisible, pageCount);
                  return (
                    <>
                      {groupStart > 0 && (
                        <Button
                          size="sm"
                          mode="icon"
                          variant="ghost"
                          className="size-7 p-0 text-sm"
                          onClick={() => setPageIndex(groupStart - 1)}
                        >
                          ...
                        </Button>
                      )}
                      {Array.from({ length: groupEnd - groupStart }, (_, i) => {
                        const idx = groupStart + i;
                        return (
                          <Button
                            key={idx}
                            size="sm"
                            mode="icon"
                            variant="ghost"
                            className={`size-7 p-0 text-sm text-muted-foreground ${pageIndex === idx ? 'bg-accent text-accent-foreground' : ''}`}
                            onClick={() => setPageIndex(idx)}
                          >
                            {idx + 1}
                          </Button>
                        );
                      })}
                      {groupEnd < pageCount && (
                        <Button
                          size="sm"
                          mode="icon"
                          variant="ghost"
                          className="size-7 p-0 text-sm"
                          onClick={() => setPageIndex(groupEnd)}
                        >
                          ...
                        </Button>
                      )}
                    </>
                  );
                })()}
                <Button
                  size="sm"
                  mode="icon"
                  variant="ghost"
                  className="size-7 p-0"
                  onClick={() => setPageIndex((p) => p + 1)}
                  disabled={pageIndex >= pageCount - 1}
                >
                  <ChevronRight className="size-4" />
                </Button>
              </div>
            )}
          </div>
        </CardFooter>
      )}
    </Card>
  );
}
