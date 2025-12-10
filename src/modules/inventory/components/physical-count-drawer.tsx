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

interface PhysicalCountDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  variantId: string;
  sku: string;
  currentStock?: number;
}

export function PhysicalCountDrawer({
  open,
  onOpenChange,
  variantId,
  sku,
  currentStock = 0,
}: PhysicalCountDrawerProps) {
  const [countedQuantity, setCountedQuantity] = useState<number>(0);
  const [notes, setNotes] = useState<string>('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;

    if (value === '') {
      setCountedQuantity(0);
      return;
    }

    const numValue = parseInt(value, 10);
    if (!isNaN(numValue) && numValue >= 0) {
      setCountedQuantity(numValue);
    }
  };

  const handleConfirm = () => {
    // TODO: Implement actual physical count logic
    const difference = countedQuantity - currentStock;
    const action = difference > 0 ? 'increased' : difference < 0 ? 'decreased' : 'unchanged';

    toast.success(
      `Physical count recorded: ${countedQuantity} units (${action} by ${Math.abs(difference)} units)`
    );
    onOpenChange(false);
    resetForm();
  };

  const handleCancel = () => {
    onOpenChange(false);
    resetForm();
  };

  const resetForm = () => {
    setCountedQuantity(0);
    setNotes('');
  };

  const difference = countedQuantity - currentStock;
  const hasDifference = difference !== 0;
  const isIncrease = difference > 0;
  const isDecrease = difference < 0;

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="max-h-[90vh]">
        <DrawerHeader className="text-center">
          <DrawerTitle>Physical Stock Count</DrawerTitle>
          <DrawerDescription>
            Record the actual physical count for SKU: {sku}
          </DrawerDescription>
        </DrawerHeader>

        <div className="px-4 py-6 flex flex-col gap-6 overflow-y-auto">
          {/* System Stock Display */}
          <div className="w-full p-4 bg-accent/30 rounded-lg text-center">
            <p className="text-sm text-muted-foreground mb-1">System Stock</p>
            <p className="text-4xl font-bold">{currentStock} units</p>
          </div>

          {/* Physical Count Input */}
          <div className="space-y-2">
            <Label htmlFor="counted" className="text-base">
              Actual Physical Count
            </Label>
            <Input
              id="counted"
              type="number"
              value={countedQuantity}
              onChange={handleInputChange}
              className="text-center text-4xl font-bold h-20 border-2 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              placeholder="0"
              min="0"
            />
            <p className="text-xs text-muted-foreground text-center">
              Enter the exact quantity counted
            </p>
          </div>

          {/* Difference Display */}
          {hasDifference && (
            <div
              className={`w-full p-4 rounded-lg text-center border-2 ${
                isIncrease
                  ? 'bg-green-50 border-green-200 dark:bg-green-950/20'
                  : 'bg-red-50 border-red-200 dark:bg-red-950/20'
              }`}
            >
              <p className="text-sm text-muted-foreground mb-1">Difference</p>
              <p
                className={`text-3xl font-bold ${
                  isIncrease ? 'text-green-600' : 'text-red-600'
                }`}
              >
                {isIncrease ? '+' : ''}
                {difference} units
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                {isIncrease ? 'More' : 'Less'} than system stock
              </p>
            </div>
          )}

          {/* Notes Field */}
          <div className="space-y-2">
            <Label htmlFor="count-notes" className="text-base">
              Notes (Optional)
            </Label>
            <Textarea
              id="count-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g., Count performed by [name], location verified, etc."
              className="min-h-[100px] resize-none"
            />
          </div>

          {/* Warning for large differences */}
          {hasDifference && Math.abs(difference) > currentStock * 0.1 && (
            <div className="w-full p-3 bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
              <p className="text-sm text-yellow-800 dark:text-yellow-200 text-center">
                ⚠️ Large difference detected ({Math.abs(difference)} units). Please verify count.
              </p>
            </div>
          )}
        </div>

        <DrawerFooter className="gap-2 sm:gap-2">
          <Button
            onClick={handleConfirm}
            size="lg"
            className="w-full text-base h-12"
          >
            Confirm Physical Count
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
