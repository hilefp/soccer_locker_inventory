import { useState } from 'react';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Loader2, BarChart3 } from 'lucide-react';
import type { InventoryValueByCategory } from '../types';

interface InventoryValueCategoryChartProps {
  data: InventoryValueByCategory[];
  loading: boolean;
}

const COLORS = [
  'hsl(221, 83%, 53%)',
  'hsl(262, 83%, 58%)',
  'hsl(142, 71%, 45%)',
  'hsl(38, 92%, 50%)',
  'hsl(0, 84%, 60%)',
  'hsl(199, 89%, 48%)',
  'hsl(330, 81%, 60%)',
  'hsl(45, 93%, 47%)',
];

const fmt = (v: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(v);

type ViewMode = 'retail' | 'cost' | 'profit';

export function InventoryValueCategoryChart({ data, loading }: InventoryValueCategoryChartProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('retail');

  const dataKey: Record<ViewMode, keyof InventoryValueByCategory> = {
    retail: 'inventoryValueRetail',
    cost: 'inventoryValueCost',
    profit: 'potentialProfit',
  };

  const labels: Record<ViewMode, string> = {
    retail: 'Retail Value',
    cost: 'Cost Value',
    profit: 'Potential Profit',
  };

  return (
    <Card>
      <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <CardTitle className="flex items-center gap-2 text-base font-semibold">
          <BarChart3 className="h-4 w-4" /> Value by Category
        </CardTitle>
        <div className="flex gap-1">
          {(['retail', 'cost', 'profit'] as ViewMode[]).map((mode) => (
            <Button
              key={mode}
              variant={viewMode === mode ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setViewMode(mode)}
            >
              {labels[mode]}
            </Button>
          ))}
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : data.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">No data available</p>
        ) : (
          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data} layout="vertical" margin={{ left: 10, right: 30, top: 5, bottom: 5 }}>
                <CartesianGrid horizontal={false} strokeDasharray="3 3" />
                <YAxis
                  dataKey="categoryName"
                  type="category"
                  tickLine={false}
                  axisLine={false}
                  width={120}
                  tick={{ fontSize: 13 }}
                  tickFormatter={(v: string) => v.length > 18 ? `${v.slice(0, 18)}...` : v}
                />
                <XAxis
                  type="number"
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(v: number) => fmt(v)}
                  tick={{ fontSize: 12 }}
                />
                <Tooltip
                  formatter={(value: number) => [fmt(value), labels[viewMode]]}
                  labelFormatter={(label: string) => label}
                  contentStyle={{ borderRadius: '8px', border: '1px solid hsl(var(--border))' }}
                />
                <Bar dataKey={dataKey[viewMode]} radius={[0, 6, 6, 0]} barSize={28}>
                  {data.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
