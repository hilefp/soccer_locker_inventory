import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Label } from '@/shared/components/ui/label';
import { Switch } from '@/shared/components/ui/switch';
import { ProductVariantAttributes } from '@/modules/products/types/product.type';

interface VariantDetailAttributesStatusProps {
  attributes: ProductVariantAttributes;
  isActive: boolean;
  setIsActive: (value: boolean) => void;
  isSaving: boolean;
}

export function VariantDetailAttributesStatus({
  attributes,
  isActive,
  setIsActive,
  isSaving,
}: VariantDetailAttributesStatusProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Attributes & Status</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label className="text-xs">Attributes</Label>
          <div className="flex flex-wrap gap-2 p-3 rounded-md border border-border bg-accent/20">
            {Object.entries(attributes).map(([key, value]) => (
              <span
                key={key}
                className="px-2 py-1 text-xs rounded-full bg-accent text-foreground"
              >
                {key}: {value}
              </span>
            ))}
          </div>
          <p className="text-xs text-muted-foreground">
            Attributes cannot be edited. Delete and regenerate the variant to change
            attributes.
          </p>
        </div>

        <div className="flex items-center justify-between p-3 rounded-md border border-border">
          <div className="space-y-0.5">
            <Label htmlFor="isActive" className="text-sm font-medium">
              Active Status
            </Label>
            <p className="text-xs text-muted-foreground">
              Enable or disable this variant
            </p>
          </div>
          <Switch
            id="isActive"
            checked={isActive}
            onCheckedChange={setIsActive}
            disabled={isSaving}
          />
        </div>
      </CardContent>
    </Card>
  );
}
