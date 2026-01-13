import { useEffect, useState } from 'react';
import { ClubProduct } from '../types/club-product';
import { useUpdateClubProduct } from '../hooks/use-club-products';
import { Button } from '@/shared/components/ui/button';
import {
  Sheet,
  SheetBody,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/shared/components/ui/sheet';
import { Label } from '@/shared/components/ui/label';
import { Input } from '@/shared/components/ui/input';
import { Textarea } from '@/shared/components/ui/textarea';
import { Switch } from '@/shared/components/ui/switch';
import { ScrollArea } from '@/shared/components/ui/scroll-area';
import { Badge } from '@/shared/components/ui/badge';
import { ProductFormImageUpload } from '@/modules/products/components/product-form-image-upload';

interface EditClubProductSheetProps {
  clubId: string;
  clubProduct: ClubProduct | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditClubProductSheet({
  clubId,
  clubProduct,
  open,
  onOpenChange,
}: EditClubProductSheetProps) {
  // Form state
  const [customName, setCustomName] = useState<string>('');
  const [customPrice, setCustomPrice] = useState<string>('');
  const [customDescription, setCustomDescription] = useState<string>('');
  const [isActive, setIsActive] = useState(true);
  const [imageUrls, setImageUrls] = useState<string[]>([]);

  const updateMutation = useUpdateClubProduct(clubId);

  // Reset form when clubProduct changes
  useEffect(() => {
    if (clubProduct) {
      setCustomName(clubProduct.name || '');
      setCustomPrice(clubProduct.price || '');
      setCustomDescription(clubProduct.description || '');
      setIsActive(clubProduct.isActive);
      setImageUrls(clubProduct.imageUrls || []);
    }
  }, [clubProduct]);

  const handleSave = async () => {
    if (!clubProduct) return;

    try {
      await updateMutation.mutateAsync({
        clubProductId: clubProduct.id,
        data: {
          name: customName || undefined,
          price: customPrice || undefined,
          description: customDescription || undefined,
          isActive,
          imageUrls: imageUrls.length > 0 ? imageUrls : undefined,
        },
      });
      onOpenChange(false);
    } catch (error) {
      console.error('Error updating club product:', error);
    }
  };

  const handleClose = () => {
    onOpenChange(false);
  };

  const handleResetName = () => {
    setCustomName('');
  };

  const handleResetPrice = () => {
    setCustomPrice('');
  };

  const handleResetDescription = () => {
    setCustomDescription('');
  };

  if (!clubProduct) return null;

  const baseProduct = clubProduct.product;
  const baseName = baseProduct?.name || '';
  const basePrice = baseProduct?.defaultVariant?.price;
  const baseDescription = baseProduct?.description || '';
  const baseImageUrls = baseProduct?.imageUrls || [];

  const hasCustomName = customName && customName !== baseName;
  const hasCustomPrice = !!customPrice;
  const hasCustomDescription =
    customDescription && customDescription !== baseDescription;
  const hasCustomImages = imageUrls.length > 0 && JSON.stringify(imageUrls) !== JSON.stringify(baseImageUrls);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-[500px]">
        <SheetHeader>
          <SheetTitle>Edit Club Product</SheetTitle>
        </SheetHeader>
        <SheetBody>
          <ScrollArea className="h-[calc(100vh-180px)]">
            <div className="space-y-6 pr-4">
              {/* Product Name */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="customName">
                    Product Name
                    {hasCustomName && (
                      <Badge variant="outline" className="ml-2">
                        Custom
                      </Badge>
                    )}
                  </Label>
                  {hasCustomName && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleResetName}
                      className="h-6 text-xs"
                    >
                      Reset to default
                    </Button>
                  )}
                </div>
                <Input
                  id="customName"
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  placeholder={baseName}
                />
                {baseName && !hasCustomName && (
                  <p className="text-xs text-muted-foreground">
                    Default: {baseName}
                  </p>
                )}
              </div>

              {/* Price */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="customPrice">
                    Price
                    {hasCustomPrice && (
                      <Badge variant="outline" className="ml-2">
                        Custom
                      </Badge>
                    )}
                  </Label>
                  {hasCustomPrice && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleResetPrice}
                      className="h-6 text-xs"
                    >
                      Reset to default
                    </Button>
                  )}
                </div>
                <Input
                  id="customPrice"
                  type="text"
                  value={customPrice}
                  onChange={(e) => setCustomPrice(e.target.value)}
                  placeholder={basePrice !== null && basePrice !== undefined ? `$${basePrice.toFixed(2)}` : 'Auto-calculated from variants'}
                />
                <p className="text-xs text-muted-foreground">
                  {!hasCustomPrice && basePrice !== null && basePrice !== undefined
                    ? `Default: $${basePrice.toFixed(2)} (from base product)`
                    : 'Enter a custom price or price range (e.g., "$20.00" or "$20.00 - $40.00")'}
                </p>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="customDescription">
                    Description
                    {hasCustomDescription && (
                      <Badge variant="outline" className="ml-2">
                        Custom
                      </Badge>
                    )}
                  </Label>
                  {hasCustomDescription && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleResetDescription}
                      className="h-6 text-xs"
                    >
                      Reset to default
                    </Button>
                  )}
                </div>
                <Textarea
                  id="customDescription"
                  value={customDescription}
                  onChange={(e) => setCustomDescription(e.target.value)}
                  placeholder={baseDescription || 'No description'}
                  rows={4}
                />
                {baseDescription && !hasCustomDescription && (
                  <p className="text-xs text-muted-foreground line-clamp-2">
                    Default: {baseDescription}
                  </p>
                )}
              </div>

              {/* Active Status */}
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="isActive">Active Status</Label>
                  <p className="text-xs text-muted-foreground">
                    Controls whether this product is visible for this club
                  </p>
                </div>
                <Switch
                  id="isActive"
                  checked={isActive}
                  onCheckedChange={setIsActive}
                />
              </div>

              {/* Images */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>
                    Product Images
                    {hasCustomImages && (
                      <Badge variant="outline" className="ml-2">
                        Custom
                      </Badge>
                    )}
                  </Label>
                  {hasCustomImages && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setImageUrls(baseImageUrls)}
                      className="h-6 text-xs"
                    >
                      Reset to default
                    </Button>
                  )}
                </div>
                <ProductFormImageUpload
                  mode="edit"
                  initialImages={imageUrls.length > 0 ? imageUrls : baseImageUrls}
                  maxFiles={5}
                  onAllImagesChange={(urls) => setImageUrls(urls)}
                />
                {baseImageUrls.length > 0 && !hasCustomImages && (
                  <p className="text-xs text-muted-foreground">
                    Using default product images ({baseImageUrls.length} image{baseImageUrls.length !== 1 ? 's' : ''})
                  </p>
                )}
              </div>

              {/* Product Info */}
              <div className="pt-4 border-t">
                <h4 className="text-sm font-medium mb-2">Base Product Info</h4>
                <div className="space-y-1 text-xs text-muted-foreground">
                  <p>
                    <span className="font-medium">SKU:</span>{' '}
                    {baseProduct?.defaultVariant?.sku || 'N/A'}
                  </p>
                  {baseProduct?.category && (
                    <p>
                      <span className="font-medium">Category:</span>{' '}
                      {baseProduct.category.name}
                    </p>
                  )}
                  {baseProduct?.brand && (
                    <p>
                      <span className="font-medium">Brand:</span>{' '}
                      {baseProduct.brand.name}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </ScrollArea>
        </SheetBody>
        <SheetFooter>
          <Button variant="ghost" onClick={handleClose}>
            Cancel
          </Button>
          <Button
            variant="mono"
            onClick={handleSave}
            disabled={updateMutation.isPending}
          >
            {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
