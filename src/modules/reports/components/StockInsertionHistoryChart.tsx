import { CartesianGrid, Line, LineChart, XAxis } from 'recharts';

import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/shared/components/ui/chart';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { StockInsertionHistory } from '../types';

interface StockInsertionHistoryChartProps {
  data: StockInsertionHistory[];
}

const chartConfig = {
  insertionCount: {
    label: 'Times Inserted',
    color: 'hsl(var(--chart-1))',
  },
  totalQuantityInserted: {
    label: 'Total Qty',
    color: 'hsl(var(--chart-2))',
  },
} satisfies ChartConfig;

export function StockInsertionHistoryChart({ data }: StockInsertionHistoryChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Stock Insertion History</CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <LineChart
            accessibilityLayer
            data={data}
            margin={{
              left: 12,
              right: 12,
            }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="sku"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
            />
            <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
            <Line
              dataKey="insertionCount"
              type="monotone"
              stroke="var(--color-insertionCount)"
              strokeWidth={2}
              dot={false}
            />
            <Line
              dataKey="totalQuantityInserted"
              type="monotone"
              stroke="var(--color-totalQuantityInserted)"
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
