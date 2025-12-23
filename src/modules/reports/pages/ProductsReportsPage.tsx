import { useEffect, useState } from 'react';
import { productsReportsService } from '../services/products-reports.service';
import {
  ProductReportAveragePrice,
  ProductReportCount,
  ProductVariantData,
} from '../types';
import { SummaryCard } from '../components/SummaryCard';
import { ProductVariantsChart } from '../components/ProductVariantsChart';
import { Input } from '@/shared/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { DollarSign, Package } from 'lucide-react';
import { useDocumentTitle } from '@/shared/hooks/use-document-title';

export default function ProductsReportsPage() {
  useDocumentTitle('Products Reports');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');

  const [countData, setCountData] = useState<ProductReportCount | null>(null);
  const [avgPriceData, setAvgPriceData] = useState<ProductReportAveragePrice | null>(
    null
  );

  useEffect(() => {
    const filters = {
      startDate: startDate || undefined,
      endDate: endDate || undefined,
    };

    const fetchData = async () => {
      try {
        const [count, avgPrice] = await Promise.all([
          productsReportsService.getProductsCount(filters),
          productsReportsService.getAveragePrice(filters),
        ]);
        setCountData(count);
        setAvgPriceData(avgPrice);
      } catch (error) {
        console.error('Failed to fetch product reports', error);
      }
    };

    fetchData();
  }, [startDate, endDate]);

  return (

    <div className="container-fluid space-y-5 lg:space-y-9">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Products Reports</h1>
        
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2">
        <SummaryCard
          title="Total Products"
          value={countData?.count ?? 0}
          icon={Package}
          description="Total active products"
        />
        <SummaryCard
          title="Average Price"
          value={`$${Number(avgPriceData?.averagePrice || 0).toFixed(2)}`}
          icon={DollarSign}
          description="Average product price"
        />
      </div>

    </div>
  );
}
