import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { ProductVariantDimensions } from '@/modules/products/types/product.type';

interface VariantDetailPhysicalAttributesProps {
  weight?: number;
  setWeight: (value: number | undefined) => void;
  weightUnit: string;
  setWeightUnit: (value: string) => void;
  dimensions?: ProductVariantDimensions;
  setDimensions: (value: ProductVariantDimensions) => void;
  dimensionUnit: string;
  setDimensionUnit: (value: string) => void;
  isSaving: boolean;
}

export function VariantDetailPhysicalAttributes({
  weight,
  setWeight,
  weightUnit,
  setWeightUnit,
  dimensions,
  setDimensions,
  dimensionUnit,
  setDimensionUnit,
  isSaving,
}: VariantDetailPhysicalAttributesProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Physical Attributes</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="weight" className="text-xs">
            Weight
          </Label>
          <div className="flex gap-2">
            <Input
              id="weight"
              type="number"
              step="0.01"
              value={weight || ''}
              onChange={(e) =>
                setWeight(e.target.value ? parseFloat(e.target.value) : undefined)
              }
              placeholder="0.00"
              className="flex-1"
              disabled={isSaving}
            />
            <Input
              value={weightUnit}
              onChange={(e) => setWeightUnit(e.target.value)}
              placeholder="kg"
              className="w-20"
              disabled={isSaving}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label className="text-xs">Dimensions (L × W × H)</Label>
          <div className="flex gap-2">
            <Input
              type="number"
              step="0.01"
              value={dimensions?.length || ''}
              onChange={(e) =>
                setDimensions({
                  ...dimensions,
                  length: e.target.value ? parseFloat(e.target.value) : undefined,
                })
              }
              placeholder="L"
              className="flex-1"
              disabled={isSaving}
            />
            <Input
              type="number"
              step="0.01"
              value={dimensions?.width || ''}
              onChange={(e) =>
                setDimensions({
                  ...dimensions,
                  width: e.target.value ? parseFloat(e.target.value) : undefined,
                })
              }
              placeholder="W"
              className="flex-1"
              disabled={isSaving}
            />
            <Input
              type="number"
              step="0.01"
              value={dimensions?.height || ''}
              onChange={(e) =>
                setDimensions({
                  ...dimensions,
                  height: e.target.value ? parseFloat(e.target.value) : undefined,
                })
              }
              placeholder="H"
              className="flex-1"
              disabled={isSaving}
            />
            <Input
              value={dimensionUnit}
              onChange={(e) => setDimensionUnit(e.target.value)}
              placeholder="cm"
              className="w-16"
              disabled={isSaving}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
