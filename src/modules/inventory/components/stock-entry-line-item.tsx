import { Control, Controller, UseFormRegister, UseFormWatch, UseFormSetValue, FieldErrors } from 'react-hook-form';
import { Card, CardContent } from '@/shared/components/ui/card';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select';
import { Button } from '@/shared/components/ui/button';
import { Trash2 } from 'lucide-react';
import { StockEntrySchemaType } from '../schemas/stock-entry-schema';
import { StockVariantItem } from '../types/stock-variant.types';

interface StockEntryLineItemProps {
  index: number;
  register: UseFormRegister<StockEntrySchemaType>;
  control: Control<StockEntrySchemaType>;
  watch: UseFormWatch<StockEntrySchemaType>;
  setValue: UseFormSetValue<StockEntrySchemaType>;
  errors: FieldErrors<StockEntrySchemaType>;
  variants?: StockVariantItem[];
  onRemove: () => void;
  onProductChange: (variantId: string) => void;
  onQuantityChange: (quantity: number) => void;
  onCostChange: (cost: number) => void;
}

export function StockEntryLineItem({
  index,
  register,
  control,
  watch,
  setValue,
  errors,
  variants,
  onRemove,
  onProductChange,
  onQuantityChange,
  onCostChange,
}: StockEntryLineItemProps) {
  return (
    <Card className="border-2">
      <CardContent className="pt-6">
        <div className="flex items-start gap-4">
          <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Product Selector */}
            <div className="space-y-2 md:col-span-2">
              <Label>Product *</Label>
              <Controller
                name={`details.${index}.productVariantId`}
                control={control}
                render={({ field: selectField }) => (
                  <Select
                    value={selectField.value}
                    onValueChange={onProductChange}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select product" />
                    </SelectTrigger>
                    <SelectContent>
                      {variants?.map((variant) => (
                        <SelectItem key={variant.productVariantId} value={variant.productVariantId}>
                          <div className="flex flex-col">
                            <span className="font-medium">{variant.productName}</span>
                            <span className="text-xs text-muted-foreground">
                              SKU: {variant.sku} | {variant.variantName}
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.details?.[index]?.productVariantId && (
                <p className="text-sm text-destructive">
                  {errors.details[index]?.productVariantId?.message}
                </p>
              )}
            </div>

            {/* Quantity */}
            <div className="space-y-2">
              <Label>Quantity *</Label>
              <Input
                type="number"
                min="1"
                {...register(`details.${index}.quantity`, {
                  valueAsNumber: true,
                })}
                onChange={(e) => onQuantityChange(parseInt(e.target.value) || 0)}
              />
              {errors.details?.[index]?.quantity && (
                <p className="text-sm text-destructive">
                  {errors.details[index]?.quantity?.message}
                </p>
              )}
            </div>

            {/* Cost Per Unit */}
            <div className="space-y-2">
              <Label>Cost Per Unit *</Label>
              <Input
                type="number"
                min="0"
                step="0.01"
                {...register(`details.${index}.costPerUnit`, {
                  valueAsNumber: true,
                })}
                onChange={(e) => onCostChange(parseFloat(e.target.value) || 0)}
              />
              {errors.details?.[index]?.costPerUnit && (
                <p className="text-sm text-destructive">
                  {errors.details[index]?.costPerUnit?.message}
                </p>
              )}
            </div>

            {/* Lot Number */}
            <div className="space-y-2">
              <Label>Lot Number</Label>
              <Input {...register(`details.${index}.lotNumber`)} placeholder="LOT-2024-001" />
            </div>

            {/* Expiration Date */}
            <div className="space-y-2">
              <Label>Expiration Date</Label>
              <Input type="date" {...register(`details.${index}.expirationDate`)} />
            </div>

            {/* Total Cost */}
            <div className="space-y-2 md:col-span-2">
              <Label>Total Cost</Label>
              <Input
                value={`$${(watch(`details.${index}.totalCost`) || 0).toFixed(2)}`}
                readOnly
                className="font-bold bg-accent"
              />
            </div>
          </div>

          {/* Remove Button */}
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={onRemove}
            className="text-destructive hover:text-destructive"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
