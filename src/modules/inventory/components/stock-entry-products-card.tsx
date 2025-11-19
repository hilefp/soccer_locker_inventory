import { Control, UseFormRegister, UseFormWatch, UseFormSetValue, UseFieldArrayRemove, FieldErrors } from 'react-hook-form';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Plus, Package } from 'lucide-react';
import { StockEntrySchemaType } from '../schemas/stock-entry-schema';
import { StockVariantItem } from '../types/stock-variant.types';
import { StockEntryLineItem } from './stock-entry-line-item';

interface StockEntryProductsCardProps {
  fields: Array<{ id: string }>;
  register: UseFormRegister<StockEntrySchemaType>;
  control: Control<StockEntrySchemaType>;
  watch: UseFormWatch<StockEntrySchemaType>;
  setValue: UseFormSetValue<StockEntrySchemaType>;
  errors: FieldErrors<StockEntrySchemaType>;
  variants?: StockVariantItem[];
  loadingVariants: boolean;
  onAddProduct: () => void;
  onRemove: UseFieldArrayRemove;
  onProductChange: (index: number, variantId: string) => void;
  onQuantityChange: (index: number, quantity: number) => void;
  onCostChange: (index: number, cost: number) => void;
}

export function StockEntryProductsCard({
  fields,
  register,
  control,
  watch,
  setValue,
  errors,
  variants,
  loadingVariants,
  onAddProduct,
  onRemove,
  onProductChange,
  onQuantityChange,
  onCostChange,
}: StockEntryProductsCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-xl">Products</CardTitle>
          <CardDescription>Add products to this entry</CardDescription>
        </div>
        <Button
          type="button"
          onClick={onAddProduct}
          variant="outline"
          size="sm"
          className="gap-2"
          disabled={loadingVariants}
        >
          <Plus className="h-4 w-4" />
          Add Product
        </Button>
      </CardHeader>
      <CardContent>
        {fields.length === 0 ? (
          <div className="text-center py-12">
            <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-lg font-medium text-muted-foreground mb-2">No products added</p>
            <p className="text-sm text-muted-foreground mb-4">
              Add products to create a stock entry
            </p>
            <Button
              type="button"
              onClick={onAddProduct}
              variant="outline"
              className="gap-2"
              disabled={loadingVariants}
            >
              <Plus className="h-4 w-4" />
              Add First Product
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {fields.map((field, index) => (
              <StockEntryLineItem
                key={field.id}
                index={index}
                register={register}
                control={control}
                watch={watch}
                setValue={setValue}
                errors={errors}
                variants={variants}
                onRemove={() => onRemove(index)}
                onProductChange={(variantId) => onProductChange(index, variantId)}
                onQuantityChange={(quantity) => onQuantityChange(index, quantity)}
                onCostChange={(cost) => onCostChange(index, cost)}
              />
            ))}

            {errors.details?.root && (
              <p className="text-sm text-destructive">{errors.details.root.message}</p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
