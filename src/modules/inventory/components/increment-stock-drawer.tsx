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
import { Plus, Minus } from 'lucide-react';
import { toast } from 'sonner';

interface IncrementStockDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  variantId: string;
  sku: string;
  currentStock?: number;
}

export function IncrementStockDrawer({
  open,
  onOpenChange,
  variantId,
  sku,
  currentStock = 0,
}: IncrementStockDrawerProps) {
  const [quantity, setQuantity] = useState<number>(1);

  const handleIncrement = () => {
    setQuantity((prev) => prev + 1);
  };

  const handleDecrement = () => {
    setQuantity((prev) => Math.max(0, prev - 1));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Allow empty string for user to clear and type
    if (value === '') {
      setQuantity(0);
      return;
    }

    const numValue = parseInt(value, 10);
    if (!isNaN(numValue) && numValue >= 0) {
      setQuantity(numValue);
    }
  };

  const handleConfirm = () => {
    // TODO: Implement actual stock increment logic
    toast.success(`Stock incremented by ${quantity} units for SKU: ${sku}`);
    onOpenChange(false);
    // Reset quantity after successful increment
    setQuantity(1);
  };

  const handleCancel = () => {
    onOpenChange(false);
    // Reset quantity on cancel
    setQuantity(1);
  };

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="max-h-[85vh]">
        <DrawerHeader className="text-center">
          <DrawerTitle>Increment Stock</DrawerTitle>
          <DrawerDescription>
            SKU: {sku} | Current Stock: {currentStock} units
          </DrawerDescription>
        </DrawerHeader>

        <div className="px-4 py-8 flex flex-col items-center gap-8">
          {/* Increment/Decrement Controls */}
          <div className="flex items-center gap-4 w-full max-w-md">
            <Button
              variant="outline"
              size="lg"
              onClick={handleDecrement}
              className="h-16 w-16 rounded-full p-0 border-2"
            >
              <Minus className="h-8 w-8" />
            </Button>

            <div className="flex-1 flex flex-col items-center gap-2">
              <Input
                type="number"
                value={quantity}
                onChange={handleInputChange}
                className="text-center text-5xl font-bold h-24 border-2 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                min="0"
              />
              <span className="text-sm text-muted-foreground">
                units to add
              </span>
            </div>

            <Button
              variant="outline"
              size="lg"
              onClick={handleIncrement}
              className="h-16 w-16 rounded-full p-0 border-2"
            >
              <Plus className="h-8 w-8" />
            </Button>
          </div>

          {/* New Stock Preview */}
          <div className="w-full max-w-md p-4 bg-accent/50 rounded-lg text-center">
            <p className="text-sm text-muted-foreground mb-1">New Stock Total</p>
            <p className="text-3xl font-bold text-green-600">
              {currentStock + quantity} units
            </p>
          </div>
        </div>

        <DrawerFooter className="gap-2 sm:gap-2">
          <Button
            onClick={handleConfirm}
            size="lg"
            className="w-full text-base h-12"
            disabled={quantity === 0}
          >
            Confirm Increment
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
