import { useState, useEffect } from 'react';
import { Minus, Plus, Save, X } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import {
  Sheet,
  SheetBody,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/shared/components/ui/sheet';
import { Textarea } from '@/shared/components/ui/textarea';

interface StockOperationDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: 'count' | 'adjust';
  productName: string;
  sku: string;
  currentStock: number;
  onSave: (quantity: number, notes?: string) => void;
}

export function StockOperationDrawer({
  open,
  onOpenChange,
  mode,
  productName,
  sku,
  currentStock,
  onSave,
}: StockOperationDrawerProps) {
  const [quantity, setQuantity] = useState(currentStock);
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (open) {
      setQuantity(currentStock);
      setNotes('');
    }
  }, [open, currentStock]);

  const handleIncrement = () => {
    setQuantity((prev) => prev + 1);
  };

  const handleDecrement = () => {
    setQuantity((prev) => Math.max(0, prev - 1));
  };

  const handleQuantityChange = (value: string) => {
    const numValue = parseInt(value) || 0;
    setQuantity(Math.max(0, numValue));
  };

  const handleSave = () => {
    onSave(quantity, notes);
    onOpenChange(false);
  };

  const difference = quantity - currentStock;
  const isIncrease = difference > 0;
  const isDecrease = difference < 0;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        className="h-auto max-h-[85vh] rounded-t-2xl p-0"
      >
        <SheetHeader className="border-b p-6 pb-4">
          <div className="flex items-center justify-between">
            <SheetTitle className="text-xl">
              {mode === 'count' ? 'Physical Stock Count' : 'Adjust Stock'}
            </SheetTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onOpenChange(false)}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </SheetHeader>

        <SheetBody className="p-6 space-y-6">
          {/* Product Info */}
          <div className="bg-accent/50 p-4 rounded-lg space-y-1">
            <p className="text-sm font-medium text-foreground">{productName}</p>
            <p className="text-xs text-muted-foreground">SKU: {sku}</p>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-xs text-muted-foreground">Current Stock:</span>
              <span className="text-sm font-semibold">{currentStock}</span>
            </div>
          </div>

          {/* Quantity Controls */}
          <div className="space-y-4">
            <Label className="text-sm font-medium">
              {mode === 'count' ? 'Counted Quantity' : 'New Quantity'}
            </Label>

            {/* Big Counter Display */}
            <div className="flex items-center justify-center gap-4">
              <Button
                variant="outline"
                size="lg"
                onClick={handleDecrement}
                className="h-16 w-16 rounded-full p-0 text-2xl hover:bg-destructive hover:text-destructive-foreground"
              >
                <Minus className="h-8 w-8" />
              </Button>

              <div className="flex-1 max-w-[200px]">
                <Input
                  type="number"
                  value={quantity}
                  onChange={(e) => handleQuantityChange(e.target.value)}
                  className="text-center text-5xl font-bold h-24 border-2 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  min="0"
                />
              </div>

              <Button
                variant="outline"
                size="lg"
                onClick={handleIncrement}
                className="h-16 w-16 rounded-full p-0 text-2xl hover:bg-primary hover:text-primary-foreground"
              >
                <Plus className="h-8 w-8" />
              </Button>
            </div>

            {/* Difference Indicator */}
            {difference !== 0 && (
              <div
                className={`text-center p-3 rounded-lg ${
                  isIncrease
                    ? 'bg-green-50 text-green-700 border border-green-200'
                    : 'bg-red-50 text-red-700 border border-red-200'
                }`}
              >
                <p className="text-sm font-medium">
                  {isIncrease ? '+' : ''}
                  {difference} units
                </p>
                <p className="text-xs mt-1">
                  {isIncrease
                    ? `Adding ${difference} unit${difference > 1 ? 's' : ''}`
                    : `Removing ${Math.abs(difference)} unit${Math.abs(difference) > 1 ? 's' : ''}`}
                </p>
              </div>
            )}

            {difference === 0 && (
              <div className="text-center p-3 rounded-lg bg-accent/50">
                <p className="text-sm text-muted-foreground">No change in stock</p>
              </div>
            )}
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes" className="text-sm font-medium">
              Notes (Optional)
            </Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={
                mode === 'count'
                  ? 'Add any observations from the physical count...'
                  : 'Reason for adjustment...'
              }
              className="min-h-[80px]"
            />
          </div>
        </SheetBody>

        <SheetFooter className="border-t p-6 flex-row gap-3">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={difference === 0 && mode === 'count'}
            className="flex-1"
          >
            <Save className="h-4 w-4 mr-2" />
            {mode === 'count' ? 'Confirm Count' : 'Save Adjustment'}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
