'use client';

import { useEffect, useState } from 'react';
import { useProducts } from '@/modules/products/hooks/use-products';
import { Product } from '@/modules/products/types/product.type';
import { Badge, BadgeDot } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardToolbar,
} from '@/shared/components/ui/card';
import { Rating } from '@/shared/components/ui/rating';
import { ScrollArea } from '@/shared/components/ui/scroll-area';
import {
  Sheet,
  SheetBody,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/shared/components/ui/sheet';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/components/ui/table';
import {
  ToggleGroup,
  ToggleGroupItem,
} from '@/shared/components/ui/toggle-group';
import { toAbsoluteUrl } from '@/shared/lib/helpers';
import { Package, SquarePen, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Area, AreaChart, ResponsiveContainer, Tooltip } from 'recharts';

interface ProductDetailsAnalyticsSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  productId?: string;
}

export function ProductDetailsAnalyticsSheet({
  open,
  onOpenChange,
  productId,
}: ProductDetailsAnalyticsSheetProps) {
  // Fetch products
  const { data: products = [] } = useProducts();

  // Find the current product
  const product: Product | undefined = productId
    ? products.find((p) => p.id === productId)
    : undefined;

  // Chart data for Recharts
  const salesPriceData = [
    { value: 30 },
    { value: 38 },
    { value: 35 },
    { value: 42 },
    { value: 40 },
    { value: 45 },
    { value: 55 },
  ];

  const salesData = [
    { value: 28 },
    { value: 50 },
    { value: 36 },
    { value: 42 },
    { value: 38 },
    { value: 45 },
    { value: 50 },
  ];

  // Use real variants from product
  const variants = product?.variants || [];

  // Use product images or show placeholder
  // Combine imageUrl and imageUrls, prioritizing imageUrl as the main image
  const productImages = product
    ? [
        ...(product.imageUrl ? [product.imageUrl] : []),
        ...(product.imageUrls || [])
      ].filter(Boolean) // Remove any null/undefined values
    : [];

  const [selectedImage, setSelectedImage] = useState(productImages[0] || '');

  // Update selected image when product changes
  useEffect(() => {
    if (productImages.length > 0) {
      setSelectedImage(productImages[0]);
    } else {
      setSelectedImage('');
    }
  }, [product?.id]);

  // Prevent auto-focus when sheet opens
  useEffect(() => {
    if (open) {
      // Blur any focused element when sheet opens
      if (document.activeElement instanceof HTMLElement) {
        document.activeElement.blur();
      }
    }
  }, [open]);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="gap-0 lg:w-[1080px] sm:max-w-none inset-5 border start-auto h-auto rounded-lg p-0 [&_[data-slot=sheet-close]]:top-4.5 [&_[data-slot=sheet-close]]:end-5">
        <SheetHeader className="border-b py-3.5 px-5 border-border">
          <SheetTitle tabIndex={0} className="focus:outline-none font-medium">
            Product Details & Analytics
          </SheetTitle>
        </SheetHeader>

        <SheetBody className="p-0 grow">
          <div className="flex justify-between gap-2 border-b border-border px-5 py-4">
            {product ? (
              <>
                <div className="flex flex-col gap-3">
                  <div className="flex items-center gap-2.5">
                    <span className="lg:text-[22px] font-semibold text-foreground leading-none">
                      {product.name}
                    </span>
                    <Badge
                      size="sm"
                      variant={product.isActive ? 'success' : 'warning'}
                      appearance="light"
                    >
                      {product.isActive ? 'Live' : 'Draft'}
                    </Badge>
                  </div>
                  <div className="flex items-center flex-wrap gap-1.5 text-2sm">
                    <span className="font-normal text-muted-foreground">
                      SKU
                    </span>
                    <span className="font-medium text-foreground/80">
                      {product.slug}
                    </span>
                    {product.createdAt && (
                      <>
                        <BadgeDot className="bg-muted-foreground/60 size-1 mx-1" />
                        <span className="font-normal text-muted-foreground">
                          Created
                        </span>
                        <span className="font-medium text-foreground/80">
                          {product.createdAt}
                        </span>
                      </>
                    )}
                    {product.updatedAt && (
                      <>
                        <BadgeDot className="bg-muted-foreground/60 size-1 mx-1" />
                        <span className="font-normal text-muted-foreground">
                          Last Updated
                        </span>
                        <span className="font-medium text-foreground/80">
                          {product.updatedAt}
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </>
            ) : (
              <div className="flex flex-col gap-3">
                <span className="text-muted-foreground">
                  No product selected
                </span>
              </div>
            )}
            {/* <div className="flex items-center gap-2.5">
              <Button variant="ghost">Customer View</Button>
              <Button variant="outline">Remove</Button>
              <Button variant="mono">Edit Product</Button>
            </div> */}
          </div>
          <ScrollArea
            className="flex flex-col h-[calc(100dvh-15.8rem)] mx-1.5"
            viewportClassName="[&>div]:h-full [&>div>div]:h-full"
          >
            <div className="flex flex-wrap lg:flex-nowrap px-3.5 grow">
              <div className="grow lg:border-e border-border lg:pe-5 space-y-5 py-5">
                {/* Inventory */}
                <Card className="rounded-md">
                  <CardHeader className="min-h-[34px] bg-accent/50">
                    <CardTitle className="text-2sm">Inventory</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-start flex-wrap lg:gap-10 gap-5">
                      {[
                        { label: 'Status', value: 'In Stock' },
                        { label: 'In Stock', value: '1263' },
                        { label: 'Delta', value: '+289' },
                        { label: 'Velocity', value: '0.24 items/day' },
                        { label: 'Updated By', value: 'Jason Taytum' },
                      ].map((item) => (
                        <div key={item.label} className="flex flex-col gap-1.5">
                          <span className="text-2sm font-normal text-secondary-foreground">
                            {item.label}
                          </span>
                          <span className="text-2sm font-medium text-foreground">
                            {item.label === 'Status' ? (
                              <Badge variant="success" appearance="light">
                                {item.value}
                              </Badge>
                            ) : item.label === 'Delta' ? (
                              <Badge variant="success" appearance="light">
                                {item.value}
                              </Badge>
                            ) : (
                              item.value
                            )}
                          </span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Analytics
                <Card className="rounded-md">
                  <CardHeader className="min-h-[34px] bg-accent/50">
                    <CardTitle className="text-2sm">Analytics</CardTitle>
                  </CardHeader>
                  <CardContent className="grid grid-cols-2 gap-5 lg:gap-7.5 pt-4 pb-5">
                    <div className="space-y-1">
                      <div className="text-2sm font-normal text-secondary-foreground">
                        Salesprice
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-lg font-semibold text-foreground">
                          $96.23
                        </span>
                        <Badge size="xs" variant="success" appearance="light">
                          <TrendingUp />
                          3.5%
                        </Badge>
                      </div>

                      <div className="relative">
                        <div className="h-[100px] w-full">
                          <ResponsiveContainer width="100%" height="100%">
                            <AreaChart
                              data={salesPriceData}
                              margin={{
                                top: 5,
                                right: 5,
                                left: 5,
                                bottom: 5,
                              }}
                            >
                              <defs>
                                <linearGradient
                                  id="salesPriceGradient"
                                  x1="0"
                                  y1="0"
                                  x2="0"
                                  y2="1"
                                >
                                  <stop
                                    offset="0%"
                                    stopColor="#4921EA"
                                    stopOpacity={0.15}
                                  />
                                  <stop
                                    offset="100%"
                                    stopColor="#4921EA"
                                    stopOpacity={0.02}
                                  />
                                </linearGradient>
                              </defs>
                              <Tooltip
                                cursor={{
                                  stroke: '#4921EA',
                                  strokeWidth: 1,
                                  strokeDasharray: '2 2',
                                }}
                                content={({ active, payload }) => {
                                  if (active && payload && payload.length) {
                                    const value = payload[0].value as number;
                                    return (
                                      <div className="bg-background/95 backdrop-blur-sm border border-border shadow-lg rounded-lg p-2 pointer-events-none">
                                        <p className="text-sm font-semibold text-foreground">
                                          ${value}
                                        </p>
                                      </div>
                                    );
                                  }
                                  return null;
                                }}
                              />
                              <Area
                                type="monotone"
                                dataKey="value"
                                stroke="#4921EA"
                                fill="url(#salesPriceGradient)"
                                strokeWidth={1}
                                dot={false}
                                activeDot={{
                                  r: 4,
                                  fill: '#4921EA',
                                  stroke: 'white',
                                  strokeWidth: 2,
                                }}
                              />
                            </AreaChart>
                          </ResponsiveContainer>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <div className="text-2sm font-normal text-secondary-foreground">
                        Sales
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-lg font-semibold text-foreground">
                          6346
                        </span>
                        <Badge size="xs" variant="success" appearance="light">
                          <TrendingUp />
                          18%
                        </Badge>
                        <span className="text-2sm font-normal text-secondary-foreground ps-2.5">
                          $43,784,02
                        </span>
                      </div>

                      <div className="relative">
                        <div className="h-[100px] w-full">
                          <ResponsiveContainer width="100%" height="100%">
                            <AreaChart
                              data={salesData}
                              margin={{
                                top: 5,
                                right: 5,
                                left: 5,
                                bottom: 5,
                              }}
                            >
                              <defs>
                                <linearGradient
                                  id="salesGradient"
                                  x1="0"
                                  y1="0"
                                  x2="0"
                                  y2="1"
                                >
                                  <stop
                                    offset="0%"
                                    stopColor="#4921EA"
                                    stopOpacity={0.15}
                                  />
                                  <stop
                                    offset="100%"
                                    stopColor="#4921EA"
                                    stopOpacity={0.02}
                                  />
                                </linearGradient>
                              </defs>
                              <Tooltip
                                cursor={{
                                  stroke: '#4921EA',
                                  strokeWidth: 1,
                                  strokeDasharray: '2 2',
                                }}
                                content={({ active, payload }) => {
                                  if (active && payload && payload.length) {
                                    const value = payload[0].value as number;
                                    return (
                                      <div className="bg-background/95 backdrop-blur-sm border border-border shadow-lg rounded-lg p-2 pointer-events-none">
                                        <p className="text-sm font-semibold text-foreground">
                                          {value}
                                        </p>
                                      </div>
                                    );
                                  }
                                  return null;
                                }}
                              />
                              <Area
                                type="monotone"
                                dataKey="value"
                                stroke="#4921EA"
                                fill="url(#salesGradient)"
                                strokeWidth={1}
                                dot={false}
                                activeDot={{
                                  r: 4,
                                  fill: '#4921EA',
                                  stroke: 'white',
                                  strokeWidth: 2,
                                }}
                              />
                            </AreaChart>
                          </ResponsiveContainer>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card> */}

                {/* Variants table */}
                <Card className="rounded-md">
                  <CardHeader className="min-h-[34px] bg-accent/50">
                    <CardTitle className="text-2sm">Analytics</CardTitle>
                    <CardToolbar>
                      <Button mode="link" className="text-primary">
                        Manage Variants
                      </Button>
                    </CardToolbar>
                  </CardHeader>

                  <CardContent className="p-0">
                    <Table className="overflow-x-auto">
                      <TableHeader>
                        <TableRow className="text-secondary-foreground font-normal text-2sm">
                          <TableHead className="w-[100px] h-8.5 border-e border-border ps-5">
                            Size
                          </TableHead>
                          <TableHead className="w-[100px] h-8.5 border-e border-border">
                            Color
                          </TableHead>
                          <TableHead className="w-[100px] h-8.5 border-e border-border">
                            Price
                          </TableHead>
                          <TableHead className="w-[100px] h-8.5 border-e border-border">
                            Available
                          </TableHead>
                          <TableHead className="w-[100px] h-8.5 border-e border-border">
                            On Hand
                          </TableHead>
                          <TableHead className="w-[50px] h-8.5"></TableHead>
                        </TableRow>
                      </TableHeader>

                      <TableBody>
                        {variants.length === 0 ? (
                          <TableRow>
                            <TableCell
                              colSpan={6}
                              className="text-center py-4 text-muted-foreground"
                            >
                              No variants found
                            </TableCell>
                          </TableRow>
                        ) : (
                          variants.map((variant, index) => (
                            <TableRow
                              key={variant.id || index}
                              className={`text-secondary-foreground font-normal text-2sm ${index % 2 === 0 ? 'bg-accent/50' : ''}`}
                            >
                              <TableCell className="py-1 border-e border-border ps-5">
                                {variant.sku}
                              </TableCell>
                              <TableCell className="py-1 border-e border-border">
                                {Object.entries(variant.attributes || {})
                                  .map(([key, value]) => `${key}: ${value}`)
                                  .join(', ') || 'N/A'}
                              </TableCell>
                              <TableCell className="py-1 border-e border-border">
                                ${(variant?.price && variant.price) || '0.00'}
                              </TableCell>
                              <TableCell className="py-1 border-e border-border">
                                {variant.isActive ? 'Yes' : 'No'}
                              </TableCell>
                              <TableCell className="py-1 border-e border-border">
                                N/A
                              </TableCell>
                              <TableCell className="text-center py-1">
                                <Button variant="ghost" mode="icon" size="sm">
                                  <SquarePen />
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </div>

              <div className="w-full shrink-0 lg:w-[420px] py-5 lg:ps-5">
                <div className="mb-5">
                  <Card className="flex items-center justify-center rounded-md bg-accent/50 shadow-none shrink-0 mb-5">
                    {selectedImage ? (
                      <img
                        src={selectedImage}
                        className="h-[250px] shrink-0 object-cover"
                        alt="Main product image"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    ) : (
                      <div className="flex flex-col items-center justify-center h-[250px] text-muted-foreground">
                        <Package className="size-12 mb-2" />
                        <span className="text-sm">No image available</span>
                      </div>
                    )}
                  </Card>

                  {productImages.length > 0 && (
                    <ToggleGroup
                      className={`grid gap-4 ${productImages.length > 5 ? 'grid-cols-5' : `grid-cols-${productImages.length}`}`}
                      type="single"
                      value={selectedImage}
                      onValueChange={(newValue) => {
                        if (newValue) setSelectedImage(newValue);
                      }}
                    >
                      {productImages.slice(0, 5).map((imageUrl, index) => (
                        <ToggleGroupItem
                          key={index}
                          value={imageUrl}
                          className="rounded-md border border-border shrink-0 h-[50px] p-0 bg-accent/50 hover:bg-accent/50 data-[state=on]:border-zinc-950 dark:data-[state=on]:border-zinc-50"
                        >
                          <img
                            src={imageUrl}
                            className="h-[50px] w-[50px] object-cover rounded-md"
                            alt={`Product image ${index + 1}`}
                            onError={(e) => {
                              e.currentTarget.src = '';
                              e.currentTarget.style.display = 'none';
                            }}
                          />
                        </ToggleGroupItem>
                      ))}
                    </ToggleGroup>
                  )}
                </div>
                {product?.description && (
                  <p className="text-2sm font-normal text-secondary-foreground leading-5 mb-5">
                    {product.description}
                  </p>
                )}

                <div className="space-y-3">
                  {product?.category && (
                    <div className="flex items-center lg:gap-13 gap-5">
                      <div className="text-2sm text-secondary-foreground font-normal min-w-[60px]">
                        Category
                      </div>
                      <div className="text-2sm text-secondary-foreground font-medium">
                        {product.category.name}
                      </div>
                    </div>
                  )}
                  {product?.brand && (
                    <div className="flex items-center lg:gap-13 gap-5">
                      <div className="text-2sm text-secondary-foreground font-normal min-w-[60px]">
                        Brand
                      </div>
                      <div className="text-2sm text-secondary-foreground font-medium">
                        {product.brand.name}
                      </div>
                    </div>
                  )}
                
                  
                 
                </div>
              </div>
            </div>
          </ScrollArea>
        </SheetBody>

        {/* <SheetFooter className="flex-row border-t pb-4 p-5 border-border gap-2.5 lg:gap-0">
          <Button variant="ghost">Customer View</Button>
          <Button variant="outline">Remove</Button>
          <Button variant="mono">Edit Product</Button>
        </SheetFooter> */}
      </SheetContent>
    </Sheet>
  );
}
