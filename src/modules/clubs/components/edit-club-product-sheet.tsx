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
  const [stock, setStock] = useState<string>('0');
  const [isActive, setIsActive] = useState(true);

  const updateMutation = useUpdateClubProduct(clubId);

  // Reset form when clubProduct changes
  useEffect(() => {
    if (clubProduct) {
      setCustomName(clubProduct.name || '');
      setCustomPrice(
        clubProduct.price !== null && clubProduct.price !== undefined
          ? clubProduct.price.toString()
          : ''
      );
      setCustomDescription(clubProduct.description || '');
      setStock(clubProduct.stock?.toString() || '0');
      setIsActive(clubProduct.isActive);
    }
  }, [clubProduct]);

  const handleSave = async () => {
    if (!clubProduct) return;

    try {
      await updateMutation.mutateAsync({
        clubProductId: clubProduct.id,
        data: {
          name: customName || undefined,
          price: customPrice ? parseFloat(customPrice) : undefined,
          description: customDescription || undefined,
          stock: parseInt(stock) || 0,
          isActive,
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

  const hasCustomName = customName && customName !== baseName;
  const hasCustomPrice = customPrice && parseFloat(customPrice) !== basePrice;
  const hasCustomDescription =
    customDescription && customDescription !== baseDescription;

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
                  type="number"
                  step="0.01"
                  min="0"
                  value={customPrice}
                  onChange={(e) => setCustomPrice(e.target.value)}
                  placeholder={basePrice?.toString() || '0.00'}
                />
                {basePrice !== null &&
                  basePrice !== undefined &&
                  !hasCustomPrice && (
                    <p className="text-xs text-muted-foreground">
                      Default: ${basePrice.toFixed(2)}
                    </p>
                  )}
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

              {/* Stock */}
              <div className="space-y-2">
                <Label htmlFor="stock">Stock Quantity</Label>
                <Input
                  id="stock"
                  type="number"
                  min="0"
                  value={stock}
                  onChange={(e) => setStock(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  Current stock level for this club
                </p>
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
