import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { stockReportsService } from '../services/stock-reports.service';
import { InventoryValue } from '../types';
import { SummaryCard } from '../components/SummaryCard';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/shared/components/ui/card';
import { DollarSign, Package, Boxes } from 'lucide-react';
import { useDocumentTitle } from '@/shared/hooks/use-document-title';

export default function GeneralReportsPage() {
  useDocumentTitle('General Reports');
  const navigate = useNavigate();
  const [inventoryValue, setInventoryValue] = useState<InventoryValue | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await stockReportsService.getInventoryValue();
        setInventoryValue(data);
      } catch (error) {
        console.error('Failed to fetch inventory value', error);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="container-fluid space-y-8 lg:space-y-10">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Reports Dashboard</h1>
        <p className="text-muted-foreground mt-2">
          Overview of inventory performance and metrics.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <SummaryCard
          title="Total Inventory Value"
          value={`$${inventoryValue?.totalValue?.toLocaleString() ?? '0.00'}`}
          icon={DollarSign}
          description="Current total value of all stock"
        />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="hover:bg-muted/50 transition-colors cursor-pointer" onClick={() => navigate('products')}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-6 w-6" />
              Products Reports
            </CardTitle>
            <CardDescription>
              View detailed metrics about products, average prices, and variant pricing charts.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full" onClick={(e) => { e.stopPropagation(); navigate('products'); }}>
              Go to Products Reports
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:bg-muted/50 transition-colors cursor-pointer" onClick={() => navigate('stock')}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Boxes className="h-6 w-6" />
              Stock Reports
            </CardTitle>
            <CardDescription>
              View stock levels, rankings, insertion history, and damaged product reports.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full" onClick={(e) => { e.stopPropagation(); navigate('stock'); }}>
              Go to Stock Reports
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
