import { useState } from 'react';
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from '@/shared/components/ui/drawer';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Textarea } from '@/shared/components/ui/textarea';
import { toast } from 'sonner';

interface AdjustStockDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  variantId: string;
  sku: string;
  currentStock?: number;
}

export function AdjustStockDrawer({
  open,
  onOpenChange,
  variantId,
  sku,
  currentStock = 0,
}: AdjustStockDrawerProps) {
  const [adjustmentQuantity, setAdjustmentQuantity] = useState<number>(0);
  const [reason, setReason] = useState<string>('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;

    // Allow empty string and minus sign for user to type
    if (value === '' || value === '-') {
      setAdjustmentQuantity(0);
      return;
    }

    const numValue = parseInt(value, 10);
    if (!isNaN(numValue)) {
      setAdjustmentQuantity(numValue);
    }
  };

  const handleConfirm = () => {
    if (adjustmentQuantity === 0) {
      toast.error('Please enter an adjustment quantity');
      return;
    }

    // TODO: Implement actual stock adjustment logic
    const action = adjustmentQuantity > 0 ? 'increased' : 'decreased';
    toast.success(
      `Stock ${action} by ${Math.abs(adjustmentQuantity)} units for SKU: ${sku}`
    );
    onOpenChange(false);
    // Reset form after successful adjustment
    resetForm();
  };

  const handleCancel = () => {
    onOpenChange(false);
    // Reset form on cancel
    resetForm();
  };

  const resetForm = () => {
    setAdjustmentQuantity(0);
    setReason('');
  };

  const newStockTotal = currentStock + adjustmentQuantity;
  const isIncrease = adjustmentQuantity > 0;
  const isDecrease = adjustmentQuantity < 0;

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="max-h-[90vh]">
        <DrawerHeader className="text-center">
          <DrawerTitle>Adjust Stock</DrawerTitle>
          <DrawerDescription>
            SKU: {sku} | Current Stock: {currentStock} units
          </DrawerDescription>
        </DrawerHeader>

        <div className="px-4 py-6 flex flex-col gap-6 overflow-y-auto">
          {/* Current Stock Display */}
          <div className="w-full p-4 bg-accent/30 rounded-lg text-center">
            <p className="text-sm text-muted-foreground mb-1">Current Stock</p>
            <p className="text-4xl font-bold">{currentStock} units</p>
          </div>

          {/* Adjustment Quantity Field */}
          <div className="space-y-2">
            <Label htmlFor="adjustment" className="text-base">
              Adjustment Quantity
            </Label>
            <Input
              id="adjustment"
              type="number"
              value={adjustmentQuantity}
              onChange={handleInputChange}
              className="text-center text-4xl font-bold h-20 border-2 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              placeholder="0"
            />
            <p className="text-xs text-muted-foreground text-center">
              Use positive for increase, negative for decrease
            </p>
          </div>

          {/* Reason/Notes Field */}
          <div className="space-y-2">
            <Label htmlFor="reason" className="text-base">
              Reason for Adjustment (Optional)
            </Label>
            <Textarea
              id="reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g., Physical count correction, damaged goods, etc."
              className="min-h-[100px] resize-none"
            />
          </div>

          {/* New Stock Preview */}
          {adjustmentQuantity !== 0 && (
            <div
              className={`w-full p-4 rounded-lg text-center border-2 ${
                isIncrease
                  ? 'bg-green-50 border-green-200 dark:bg-green-950/20'
                  : isDecrease
                    ? 'bg-red-50 border-red-200 dark:bg-red-950/20'
                    : 'bg-accent/50'
              }`}
            >
              <p className="text-sm text-muted-foreground mb-1">
                New Stock Total
              </p>
              <p
                className={`text-3xl font-bold ${
                  isIncrease
                    ? 'text-green-600'
                    : isDecrease
                      ? 'text-red-600'
                      : ''
                }`}
              >
                {newStockTotal} units
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                {isIncrease ? '+' : ''}
                {adjustmentQuantity} units
              </p>
            </div>
          )}
        </div>

        <DrawerFooter className="gap-2 sm:gap-2">
          <Button
            onClick={handleConfirm}
            size="lg"
            className="w-full text-base h-12"
            disabled={adjustmentQuantity === 0}
          >
            Confirm Adjustment
          </Button>
          <DrawerClose asChild>
            <Button
              variant="outline"
              size="lg"
              onClick={handleCancel}
              className="w-full text-base h-12"
            >
              Cancel
            </Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
