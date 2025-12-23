import { Card } from '@/shared/components/ui/card';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import type { MonthlyTotalStockChartData } from '../types/inventory-reports.types';
import { LoaderCircleIcon } from 'lucide-react';

interface MonthlyTotalStockChartProps {
  data: MonthlyTotalStockChartData[];
  isLoading?: boolean;
  error?: Error | null;
}

export function MonthlyTotalStockChart({
  data,
  isLoading,
  error,
}: MonthlyTotalStockChartProps) {
  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-center h-96">
          <LoaderCircleIcon className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-center h-96">
          <div className="text-center space-y-2">
            <p className="text-sm font-medium text-destructive">Error loading chart</p>
            <p className="text-sm text-muted-foreground">{error.message}</p>
          </div>
        </div>
      </Card>
    );
  }

  if (!data || data.length === 0) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-center h-96">
          <p className="text-sm text-muted-foreground">No data available</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold">Total Stock Over Time</h3>
          <p className="text-sm text-muted-foreground">
            Evolution of total inventory stock by month
          </p>
        </div>

        <ResponsiveContainer width="100%" height={400}>
          <AreaChart data={data}>
            <defs>
              <linearGradient id="stockGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#60A5FA" stopOpacity={0.4} />
                <stop offset="100%" stopColor="#60A5FA" stopOpacity={0.05} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis
              dataKey="month"
              className="text-xs"
              tick={{ fill: '#6B7280' }}
            />
            <YAxis
              className="text-xs"
              tick={{ fill: '#6B7280' }}
              domain={[0, 'auto']}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px',
                color: '#6B7280',
              }}
              labelStyle={{ color: '#374151' }}
              itemStyle={{ color: '#6B7280' }}
            />
            <Area
              type="monotone"
              dataKey="totalStock"
              stroke="#60A5FA"
              strokeWidth={3}
              fill="url(#stockGradient)"
              dot={{ fill: '#60A5FA', stroke: '#60A5FA', r: 5 }}
              activeDot={{ r: 7, fill: '#3B82F6' }}
              name="Total Stock"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
