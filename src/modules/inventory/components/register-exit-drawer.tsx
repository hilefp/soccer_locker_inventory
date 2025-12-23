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
import { Plus, Minus } from 'lucide-react';
import { toast } from 'sonner';
import { useRegisterStockExit } from '../hooks/use-stock-operations';
import { useAuth } from '@/modules/auth/hooks/use-auth';

interface RegisterExitDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  variantId: string;
  warehouseId: string;
  sku: string;
  currentStock?: number;
}

export function RegisterExitDrawer({
  open,
  onOpenChange,
  variantId,
  warehouseId,
  sku,
  currentStock = 0,
}: RegisterExitDrawerProps) {
  const { user } = useAuth();
  const registerExitMutation = useRegisterStockExit();
  const [exitQuantity, setExitQuantity] = useState<number>(1);
  const [reason, setReason] = useState<string>('');

  const handleIncrement = () => {
    if (exitQuantity < currentStock) {
      setExitQuantity((prev) => prev + 1);
    }
  };

  const handleDecrement = () => {
    setExitQuantity((prev) => Math.max(1, prev - 1));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;

    if (value === '') {
      setExitQuantity(1);
      return;
    }

    const numValue = parseInt(value, 10);
    if (!isNaN(numValue) && numValue >= 1 && numValue <= currentStock) {
      setExitQuantity(numValue);
    }
  };

  const handleConfirm = async () => {
    if (exitQuantity === 0) {
      toast.error('Please enter an exit quantity');
      return;
    }

    if (exitQuantity > currentStock) {
      toast.error('Exit quantity cannot exceed current stock');
      return;
    }

    if (!reason.trim()) {
      toast.error('Please provide a reason for the exit');
      return;
    }

    if (!user?.id) {
      toast.error('User not authenticated');
      return;
    }

    try {
      await registerExitMutation.mutateAsync({
        productVariantId: variantId,
        warehouseId,
        quantity: exitQuantity,
        reason: reason.trim(),
        createdBy: user.id,
      });

      toast.success(
        `Stock exit registered: ${exitQuantity} units for SKU: ${sku}`
      );
      onOpenChange(false);
      resetForm();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Failed to register stock exit'
      );
    }
  };

  const handleCancel = () => {
    onOpenChange(false);
    resetForm();
  };

  const resetForm = () => {
    setExitQuantity(1);
    setReason('');
  };

  const newStockTotal = currentStock - exitQuantity;

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="max-h-[90vh]">
        <DrawerHeader className="text-center">
          <DrawerTitle>Register Stock Exit</DrawerTitle>
          <DrawerDescription>
            SKU: {sku} | Current Stock: {currentStock} units
          </DrawerDescription>
        </DrawerHeader>

        <div className="px-4 py-6 flex flex-col gap-6 overflow-y-auto">
          {/* Exit Quantity Controls */}
          <div className="space-y-2">
            <Label htmlFor="exit-quantity" className="text-base">
              Exit Quantity
            </Label>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="lg"
                onClick={handleDecrement}
                className="h-14 w-14 rounded-full p-0 border-2"
              >
                <Minus className="h-6 w-6" />
              </Button>

              <div className="flex-1">
                <Input
                  id="exit-quantity"
                  type="number"
                  value={exitQuantity}
                  onChange={handleInputChange}
                  className="text-center text-4xl font-bold h-20 border-2 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  placeholder="0"
                  min="1"
                  max={currentStock}
                />
                <p className="text-xs text-muted-foreground text-center mt-2">
                  Units to remove from stock
                </p>
              </div>

              <Button
                variant="outline"
                size="lg"
                onClick={handleIncrement}
                className="h-14 w-14 rounded-full p-0 border-2"
                disabled={exitQuantity >= currentStock}
              >
                <Plus className="h-6 w-6" />
              </Button>
            </div>
          </div>

          {/* Reason Field - Required */}
          <div className="space-y-2">
            <Label htmlFor="exit-reason" className="text-base">
              Reason for Exit <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="exit-reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g., Sale, customer return, damaged goods, transfer to another location, etc."
              className="min-h-[120px] resize-none"
              required
            />
            <p className="text-xs text-muted-foreground">
              Please provide a clear reason for this stock exit
            </p>
          </div>

          {/* New Stock Preview */}
          <div className="w-full p-4 bg-red-50 border-2 border-red-200 dark:bg-red-950/20 dark:border-red-800 rounded-lg text-center">
            <p className="text-sm text-muted-foreground mb-1">
              New Stock Total
            </p>
            <p className="text-3xl font-bold text-red-600">
              {newStockTotal} units
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              -{exitQuantity} units
            </p>
          </div>

          {/* Warning for low stock */}
          {newStockTotal === 0 && (
            <div className="w-full p-3 bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
              <p className="text-sm text-yellow-800 dark:text-yellow-200 text-center">
                ⚠️ This will result in zero stock for this variant
              </p>
            </div>
          )}
        </div>

        <DrawerFooter className="gap-2 sm:gap-2">
          <Button
            onClick={handleConfirm}
            size="lg"
            className="w-full text-base h-12"
            disabled={exitQuantity === 0 || !reason.trim() || registerExitMutation.isPending}
          >
            {registerExitMutation.isPending ? 'Registering...' : 'Confirm Exit'}
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
