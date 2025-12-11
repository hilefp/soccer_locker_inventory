import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts';

import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/shared/components/ui/chart';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/shared/components/ui/card';
import { StockRankingDto } from '../types';
import { Button } from '@/shared/components/ui/button';
import { ArrowDownAZ, ArrowUpAZ } from 'lucide-react';

interface StockRankingChartProps {
  data: StockRankingDto[];
  sortOrder: 'asc' | 'desc';
  onSortChange: (order: 'asc' | 'desc') => void;
}

const chartConfig = {
  quantity: {
    label: 'Stock Quantity',
    color: 'hsl(var(--chart-1))',
  },
} satisfies ChartConfig;

export function StockRankingChart({ data, sortOrder, onSortChange }: StockRankingChartProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
           <CardTitle>Stock Ranking</CardTitle>
           <CardDescription>Top 10 Products by Stock Level</CardDescription>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onSortChange(sortOrder === 'asc' ? 'desc' : 'asc')}
        >
          {sortOrder === 'desc' ? (
             <>
               <ArrowDownAZ className="mr-2 h-4 w-4" />
               Highest First
             </>
          ) : (
             <>
               <ArrowUpAZ className="mr-2 h-4 w-4" />
               Lowest First
             </>
          )}
        </Button>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="min-h-[300px] w-full">
          <BarChart accessibilityLayer data={data} layout="vertical" margin={{ left: 20 }}>
            <CartesianGrid horizontal={false} />
            <YAxis
              dataKey="name"
              type="category"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              width={150}
              tickFormatter={(value) => value.length > 20 ? `${value.slice(0, 20)}...` : value}
            />
            <XAxis dataKey="quantity" type="number" hide />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Bar dataKey="quantity" fill="var(--color-quantity)" radius={5} barSize={24}/>
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
