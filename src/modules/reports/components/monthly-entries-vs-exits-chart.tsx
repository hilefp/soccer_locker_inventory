import { Card } from '@/shared/components/ui/card';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import type { MonthlyEntriesVsExitsChartData } from '../types/inventory-reports.types';
import { LoaderCircleIcon } from 'lucide-react';

interface MonthlyEntriesVsExitsChartProps {
  data: MonthlyEntriesVsExitsChartData[];
  isLoading?: boolean;
  error?: Error | null;
}

export function MonthlyEntriesVsExitsChart({
  data,
  isLoading,
  error,
}: MonthlyEntriesVsExitsChartProps) {
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
          <h3 className="text-lg font-semibold">Monthly Entries vs Exits</h3>
          <p className="text-sm text-muted-foreground">
            Monthly comparison of inventory inflow vs outflow movements
          </p>
        </div>

        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={data}>
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
            <Legend wrapperStyle={{ color: '#6B7280' }} />
            <Bar
              dataKey="entries"
              fill="#F87171"
              name="Entries"
              radius={[4, 4, 0, 0]}
            />
            <Bar
              dataKey="exits"
              fill="#6EE7B7"
              name="Exits"
              radius={[4, 4, 0, 0]}
            />
            <Bar
              dataKey="adjustments"
              fill="#A5B4FC"
              name="Adjustments"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
