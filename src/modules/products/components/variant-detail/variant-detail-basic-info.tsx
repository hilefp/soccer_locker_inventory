import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';

interface VariantDetailBasicInfoProps {
  sku: string;
  setSku: (value: string) => void;
  imageUrl: string;
  setImageUrl: (value: string) => void;
  isSaving: boolean;
}

export function VariantDetailBasicInfo({
  sku,
  setSku,
  imageUrl,
  setImageUrl,
  isSaving,
}: VariantDetailBasicInfoProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Basic Information</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="sku" className="text-xs">
            SKU *
          </Label>
          <Input
            id="sku"
            value={sku}
            onChange={(e) => setSku(e.target.value)}
            placeholder="Enter SKU"
            disabled={isSaving}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="imageUrl" className="text-xs">
            Image URL
          </Label>
          <Input
            id="imageUrl"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            placeholder="https://example.com/image.jpg"
            disabled={isSaving}
          />
        </div>
      </CardContent>
    </Card>
  );
}
