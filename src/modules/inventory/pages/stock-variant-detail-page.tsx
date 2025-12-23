import {
  Alert,
  AlertDescription,
  AlertTitle,
} from '@/shared/components/ui/alert';
import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/shared/components/ui/tabs';
import {
  AlertTriangle,
  ArrowLeft,
  BarChart3,
  Hash,
  Tag,
  Warehouse,
} from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { PricingInformationCard } from '../components/pricing-information-card';
import { ProductDetailsCard } from '../components/product-details-card';
import { ProductImageCard } from '../components/product-image-card';
import { QRCodeCard } from '../components/qr-code-card';
import { QuickActionsCard } from '../components/quick-actions-card';
import { StockAlertsSection } from '../components/stock-alerts-section';
import { StockMovementsTab } from '../components/stock-movements-tab';
// Import all the new components
import { StockSummaryCards } from '../components/stock-summary-cards';
import { WarehouseStocksTab } from '../components/warehouse-stocks-tab';
import { useStockVariantDetail } from '../hooks/use-stock-variants';
import { StockStatus } from '../types/stock-variant.types';
import { useDocumentTitle } from '@/shared/hooks/use-document-title';

export function StockVariantDetailPage() {
  useDocumentTitle('Stock Variant Details');
  const { variantId } = useParams<{ variantId: string }>();
  const navigate = useNavigate();

  const { data, isLoading, error } = useStockVariantDetail(variantId || '');

  if (isLoading) {
    return (
      <div className="container-fluid space-y-5 lg:space-y-9">
        <div className="flex items-center justify-center py-20">
          <span className="text-muted-foreground text-lg">
            Loading variant details...
          </span>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="container-fluid space-y-5 lg:space-y-9">
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            {error instanceof Error
              ? error.message
              : 'Failed to load variant details'}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const {
    variant,
    product,
    stockSummary,
    warehouseStocks,
    recentMovements,
    alerts,
  } = data;

  const getStatusBadgeVariant = (status: StockStatus) => {
    switch (status) {
      case StockStatus.IN_STOCK:
        return 'success';
      case StockStatus.LOW_STOCK:
        return 'warning';
      case StockStatus.OUT_OF_STOCK:
        return 'destructive';
      default:
        return 'default';
    }
  };

  // Calculate additional metrics
  const totalValue = variant.price * stockSummary.totalQuantity;
  const totalCostValue = variant.cost
    ? variant.cost * stockSummary.totalQuantity
    : undefined;
  const profitMargin =
    variant.cost && variant.cost > 0
      ? ((variant.price - variant.cost) / variant.cost) * 100
      : undefined;

  return (
    <div className="container-fluid space-y-6 lg:space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-4">
          <Button
            variant="outline"
            size="icon"
            onClick={() => navigate(-1)}
            
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>

          <div className="flex-1">
            <div className="flex items-center justify-between gap-2 mb-2">
              <h1 className="text-3xl font-bold tracking-tight">
                {product.name}
              </h1>
              <Badge
                variant={getStatusBadgeVariant(stockSummary.status) as any}
                appearance="light"
                className="text-sm px-3 py-1"
              >
                {stockSummary.status.replace('_', ' ')}
              </Badge>
              {!variant.isActive && (
                <Badge variant="outline" className="text-sm px-3 py-1">
                  Inactive
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-4 text-base text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <Hash className="h-4 w-4" />
                SKU:{' '}
                <span className="font-semibold text-foreground">
                  {variant.sku}
                </span>
              </span>
              <span className="flex items-center gap-1.5">
                <Tag className="h-4 w-4" />
                {variant.variantName}
              </span>
              {variant.barcode && (
                <span className="flex items-center gap-1.5">
                  Barcode:{' '}
                  <span className="font-semibold text-foreground">
                    {variant.barcode}
                  </span>
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Active Alerts */}
      <StockAlertsSection alerts={alerts} />

      {/* Stock Summary Cards */}
      <StockSummaryCards
        totalQuantity={stockSummary.totalQuantity}
        totalReserved={stockSummary.totalReserved}
        totalAvailable={stockSummary.totalAvailable}
        warehouseCount={stockSummary.warehouseCount}
        totalValue={totalValue}
        costValue={totalCostValue}
        profitMargin={profitMargin}
      />

      <div className="grid grid-cols-1 md:grid-cols-3  gap-6">
        <div className="col-span-2">
          <PricingInformationCard
            price={variant.price}
            compareAtPrice={variant.compareAtPrice}
            cost={variant.cost}
            totalQuantity={stockSummary.totalQuantity}
          />
        </div>

        <div className="">
          {/* Pricing Information */}
          <ProductImageCard
            imageUrl={variant.imageUrl}
            productName={product.name}
            imageUrls={variant.imageUrls}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Tabs for Warehouses and Movements */}
          <Tabs defaultValue="warehouses" className="w-full">
            <TabsList className="w-full justify-start h-12">
              <TabsTrigger value="warehouses" className="gap-2 text-base px-6">
                <Warehouse className="h-5 w-5" />
                Warehouse Stock
              </TabsTrigger>
              <TabsTrigger value="movements" className="gap-2 text-base px-6">
                <BarChart3 className="h-5 w-5" />
                Recent Movements ({data.movementStatistics.recentMovementsShown}
                )
              </TabsTrigger>
            </TabsList>

            <TabsContent value="warehouses" className="mt-6">
              <WarehouseStocksTab warehouseStocks={warehouseStocks} />
            </TabsContent>

            <TabsContent value="movements" className="mt-6">
              <StockMovementsTab
                movements={recentMovements}
                totalMovements={data.movementStatistics.totalMovements}
                recentMovementsShown={
                  data.movementStatistics.recentMovementsShown
                }
              />
            </TabsContent>
          </Tabs>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
        <QRCodeCard
            sku={variant.sku}
            productName={product.name}
            variantId={variant.id}
          />


          {/* Quick Actions */}
          <QuickActionsCard
            variantId={variant.id}
            sku={variant.sku}
            currentStock={stockSummary.totalQuantity}
          />


          {/* Product Details */}
          <ProductDetailsCard
            category={product.category}
            brand={product.brand}
            model={product.model}
            attributes={variant.attributes}
            weight={variant.weight}
            weightUnit={variant.weightUnit}
            dimensions={variant.dimensions}
            dimensionUnit={variant.dimensionUnit}
            createdAt={variant.createdAt}
            updatedAt={variant.updatedAt}
            tags={product.tags}
          />
        </div>
      </div>
    </div>
  );
}
