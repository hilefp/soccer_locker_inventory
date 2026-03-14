import { useState } from 'react';
import { ClubProduct } from '../types/club-product';
import { useGroupClubProducts } from '../hooks/use-club-products';
import { Button } from '@/shared/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog';
import { RadioGroup, RadioGroupItem } from '@/shared/components/ui/radio-group';
import { Label } from '@/shared/components/ui/label';
import { Badge } from '@/shared/components/ui/badge';
import { Package, Star } from 'lucide-react';

interface GroupProductsDialogProps {
  clubId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedProducts: ClubProduct[];
  onSuccess?: () => void;
}

export function GroupProductsDialog({
  clubId,
  open,
  onOpenChange,
  selectedProducts,
  onSuccess,
}: GroupProductsDialogProps) {
  const [primaryId, setPrimaryId] = useState<string>('');
  const groupMutation = useGroupClubProducts(clubId);

  const handleGroup = async () => {
    if (!primaryId || selectedProducts.length < 2) return;

    try {
      await groupMutation.mutateAsync({
        clubProductIds: selectedProducts.map((p) => p.id),
        primaryClubProductId: primaryId,
      });
      setPrimaryId('');
      onOpenChange(false);
      onSuccess?.();
    } catch (error) {
      console.error('Error grouping products:', error);
    }
  };

  const handleClose = () => {
    setPrimaryId('');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Group Products</DialogTitle>
          <DialogDescription>
            These products will appear as a single item in the shop with all
            sizes merged. Select which product should be the primary (its name,
            images, and description will be used for the shop display).
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <p className="text-sm font-medium">
            Select the primary product ({selectedProducts.length} products
            selected):
          </p>

          <RadioGroup value={primaryId} onValueChange={setPrimaryId}>
            <div className="space-y-3">
              {selectedProducts.map((cp) => {
                const displayName = cp.name || cp.product?.name || 'Unnamed';
                const sku = cp.product?.defaultVariant?.sku || 'N/A';
                const imageUrl =
                  cp.imageUrls?.[0] || cp.product?.imageUrls?.[0];
                const variantCount = cp.product?.variants?.length || 0;

                return (
                  <div
                    key={cp.id}
                    className="flex items-center gap-3 rounded-lg border p-3 cursor-pointer hover:bg-accent/50 transition-colors"
                    onClick={() => setPrimaryId(cp.id)}
                  >
                    <RadioGroupItem value={cp.id} id={`primary-${cp.id}`} />
                    <div className="flex items-center justify-center rounded-md bg-accent/50 h-[40px] w-[50px] shrink-0">
                      {imageUrl ? (
                        <img
                          src={imageUrl}
                          className="h-[30px] w-full object-contain"
                          alt={displayName}
                        />
                      ) : (
                        <Package className="size-5 text-muted-foreground" />
                      )}
                    </div>
                    <Label
                      htmlFor={`primary-${cp.id}`}
                      className="flex-1 cursor-pointer"
                    >
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">
                            {displayName}
                          </span>
                          {primaryId === cp.id && (
                            <Badge variant="default" className="text-xs">
                              <Star className="size-3 mr-1" />
                              Primary
                            </Badge>
                          )}
                        </div>
                        <span className="text-xs text-muted-foreground">
                          SKU: {sku} · {variantCount} variant
                          {variantCount !== 1 ? 's' : ''}
                        </span>
                      </div>
                    </Label>
                  </div>
                );
              })}
            </div>
          </RadioGroup>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={handleClose}>
            Cancel
          </Button>
          <Button
            variant="mono"
            onClick={handleGroup}
            disabled={!primaryId || groupMutation.isPending}
          >
            {groupMutation.isPending ? 'Grouping...' : 'Group Products'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
