import { SalesKpiCard } from './sales-kpi-card';
import { DollarSign, TrendingUp, Percent, Boxes } from 'lucide-react';
import type { StockInventoryValueResponse } from '../types';

interface InventoryValueKPIsProps {
  data: StockInventoryValueResponse | null;
  loading: boolean;
}

const fmt = (v: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 }).format(v);

const fmtNum = (v: number) => new Intl.NumberFormat('en-US').format(v);

export function InventoryValueKPIs({ data, loading }: InventoryValueKPIsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
      <SalesKpiCard
        title="Inventory Value (Retail)"
        value={data ? fmt(data.totalInventoryValueRetail) : '$0.00'}
        icon={DollarSign}
        description="Total retail value"
        iconClassName="text-blue-600"
        loading={loading}
      />
      <SalesKpiCard
        title="Inventory Value (Cost)"
        value={data ? fmt(data.totalInventoryValueCost) : '$0.00'}
        icon={DollarSign}
        description="Total cost value"
        iconClassName="text-orange-600"
        loading={loading}
      />
      <SalesKpiCard
        title="Potential Profit"
        value={data ? fmt(data.totalPotentialProfit) : '$0.00'}
        icon={TrendingUp}
        description="Retail - Cost"
        iconClassName="text-green-600"
        loading={loading}
      />
      <SalesKpiCard
        title="Profit Margin"
        value={data ? `${data.overallProfitMargin.toFixed(2)}%` : '0%'}
        icon={Percent}
        description="Overall margin"
        iconClassName="text-emerald-600"
        loading={loading}
      />
      <SalesKpiCard
        title="Total Quantity"
        value={data ? fmtNum(data.totalQuantity) : '0'}
        icon={Boxes}
        description="Items in stock"
        iconClassName="text-purple-600"
        loading={loading}
      />
    </div>
  );
}
