import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
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
import { Skeleton } from '@/shared/components/ui/skeleton';

interface ChartDataPoint {
  date: string;
  currentYear: number;
  previousYear: number;
}

interface SalesChartProps {
  title: string;
  data: ChartDataPoint[];
  currentYearLabel: string;
  previousYearLabel: string;
  currentYearTotal: number;
  previousYearTotal: number;
  loading?: boolean;
  valuePrefix?: string;
  formatValue?: (value: number) => string;
}

export function SalesChart({
  title,
  data,
  currentYearLabel,
  previousYearLabel,
  currentYearTotal,
  previousYearTotal,
  loading = false,
  valuePrefix = '',
  formatValue,
}: SalesChartProps) {
  if (loading) {
    return (
      <Card className="border-none shadow-md">
        <CardHeader>
          <CardTitle className="text-base font-semibold">{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[300px] w-full" />
        </CardContent>
      </Card>
    );
  }

  const formatTooltipValue = (value: number) => {
    if (formatValue) {
      return formatValue(value);
    }
    return `${valuePrefix}${value.toLocaleString()}`;
  };

  const formatYAxisValue = (value: number) => {
    if (value >= 1000) {
      return `${valuePrefix}${(value / 1000).toFixed(1)}k`;
    }
    return `${valuePrefix}${value}`;
  };

  return (
    <Card className="border-none shadow-md">
      <CardHeader>
        <CardTitle className="text-base font-semibold">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart
            data={data}
            margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 12, fill: '#6b7280' }}
              axisLine={{ stroke: '#e5e7eb' }}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 12, fill: '#6b7280' }}
              axisLine={false}
              tickLine={false}
              tickFormatter={formatYAxisValue}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'white',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
              }}
              formatter={formatTooltipValue}
              labelStyle={{ fontWeight: 600, marginBottom: '4px' }}
            />
            <Legend
              wrapperStyle={{ paddingTop: '20px' }}
              iconType="square"
              iconSize={12}
            />
            <Bar
              dataKey="previousYear"
              name={previousYearLabel}
              fill="#10b981"
              radius={[4, 4, 0, 0]}
              maxBarSize={40}
            />
            <Bar
              dataKey="currentYear"
              name={currentYearLabel}
              fill="#3b82f6"
              radius={[4, 4, 0, 0]}
              maxBarSize={40}
            />
          </BarChart>
        </ResponsiveContainer>

        <div className="mt-6 space-y-2 border-t pt-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked
                readOnly
                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-muted-foreground">
                {currentYearLabel}
              </span>
            </div>
            <span className="text-sm font-semibold">
              {formatValue ? formatValue(currentYearTotal) : `${valuePrefix}${currentYearTotal.toLocaleString()}`}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked
                readOnly
                className="h-4 w-4 rounded border-gray-300 text-green-600 focus:ring-green-500"
              />
              <span className="text-sm text-muted-foreground">
                {previousYearLabel}
              </span>
            </div>
            <span className="text-sm font-semibold">
              {formatValue ? formatValue(previousYearTotal) : `${valuePrefix}${previousYearTotal.toLocaleString()}`}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
