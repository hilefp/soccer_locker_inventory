import { Card, CardContent, CardHeader, CardTitle, CardToolbar } from '@/shared/components/ui/card';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Switch } from '@/shared/components/ui/switch';
import { Textarea } from '@/shared/components/ui/textarea';

interface ProductFormBasicInfoProps {
  productName: string;
  setProductName: (value: string) => void;
  slug: string;
  setSlug: (value: string) => void;
  sku: string;
  setSku: (value: string) => void;
  price: number;
  setPrice: (value: number) => void;
  cost?: number;
  setCost?: (value: number) => void;
  description: string;
  setDescription: (value: string) => void;
  isFeatured: boolean;
  setIsFeatured: (value: boolean) => void;
  isLoading: boolean;
}

export function ProductFormBasicInfo({
  productName,
  setProductName,
  slug,
  setSlug,
  sku,
  setSku,
  price,
  setPrice,
  cost,
  setCost,
  description,
  setDescription,
  isFeatured,
  setIsFeatured,
  isLoading,
}: ProductFormBasicInfoProps) {
  return (
    <Card className="rounded-md">
      <CardHeader className="min-h-[38px] bg-accent/50">
        <CardTitle className="text-2sm">Basic Info</CardTitle>
        <CardToolbar>
          <div className="flex items-center space-x-2">
            <Label htmlFor="featured-switch" className="text-xs">
              Featured
            </Label>
            <Switch
              size="sm"
              id="featured-switch"
              checked={isFeatured}
              onCheckedChange={setIsFeatured}
              disabled={isLoading}
            />
          </div>
        </CardToolbar>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="flex flex-col gap-2 mb-3">
          <Label className="text-xs">Product Name *</Label>
          <Input
            placeholder="Product Name"
            value={productName}
            onChange={(e) => setProductName(e.target.value)}
            disabled={isLoading}
          />
        </div>
        <div className="grid grid-cols-2 gap-5 mb-2.5">
          <div className="flex flex-col gap-2">
            <Label className="text-xs">Slug *</Label>
            <Input
              placeholder="product-slug"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              disabled={isLoading}
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label className="text-xs">SKU</Label>
            <Input
              placeholder="SKU"
              value={sku}
              onChange={(e) => setSku(e.target.value)}
              disabled={isLoading}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-5 mb-2.5">
          <div className="flex flex-col gap-2">
            <Label className="text-xs">Price *</Label>
            <Input
              type="number"
              step="0.01"
              placeholder="0.00"
              value={price}
              onChange={(e) => setPrice(parseFloat(e.target.value) || 0)}
              disabled={isLoading}
            />
          </div>
          {setCost !== undefined && (
            <div className="flex flex-col gap-2">
              <Label className="text-xs">Cost</Label>
              <Input
                type="number"
                step="0.01"
                placeholder="0.00"
                value={cost || ''}
                onChange={(e) => setCost(parseFloat(e.target.value) || 0)}
                disabled={isLoading}
              />
            </div>
          )}
        </div>

        <div className="flex flex-col gap-2">
          <Label className="text-xs">Product Description</Label>
          <Textarea
            className="min-h-[100px]"
            placeholder="Product Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            disabled={isLoading}
          />
        </div>
      </CardContent>
    </Card>
  );
}
