import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Input, InputWrapper } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';

interface VariantDetailPricingProps {
  price: number;
  setPrice: (value: number) => void;
  compareAtPrice?: number;
  setCompareAtPrice: (value: number | undefined) => void;
  cost?: number;
  setCost: (value: number | undefined) => void;
  isSaving: boolean;
}

export function VariantDetailPricing({
  price,
  setPrice,
  compareAtPrice,
  setCompareAtPrice,
  cost,
  setCost,
  isSaving,
}: VariantDetailPricingProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Pricing</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="price" className="text-xs">
            Price *
          </Label>
          <InputWrapper>
            <span className="text-xs text-muted-foreground">$</span>
            <Input
              id="price"
              type="number"
              step="0.01"
              value={price}
              onChange={(e) => setPrice(parseFloat(e.target.value) || 0)}
              placeholder="0.00"
              disabled={isSaving}
            />
          </InputWrapper>
        </div>

        <div className="space-y-2">
          <Label htmlFor="compareAtPrice" className="text-xs">
            Compare At Price
          </Label>
          <InputWrapper>
            <span className="text-xs text-muted-foreground">$</span>
            <Input
              id="compareAtPrice"
              type="number"
              step="0.01"
              value={compareAtPrice || ''}
              onChange={(e) =>
                setCompareAtPrice(e.target.value ? parseFloat(e.target.value) : undefined)
              }
              placeholder="0.00"
              disabled={isSaving}
            />
          </InputWrapper>
        </div>

        <div className="space-y-2">
          <Label htmlFor="cost" className="text-xs">
            Cost
          </Label>
          <InputWrapper>
            <span className="text-xs text-muted-foreground">$</span>
            <Input
              id="cost"
              type="number"
              step="0.01"
              value={cost || ''}
              onChange={(e) => setCost(e.target.value ? parseFloat(e.target.value) : undefined)}
              placeholder="0.00"
              disabled={isSaving}
            />
          </InputWrapper>
        </div>
      </CardContent>
    </Card>
  );
}
