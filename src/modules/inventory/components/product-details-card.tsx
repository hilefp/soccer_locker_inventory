import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';
import { Separator } from '@/shared/components/ui/separator';
import { Info, Weight, Ruler, Calendar } from 'lucide-react';

interface ProductDetailsCardProps {
  category: { name: string } | null;
  brand: { name: string } | null;
  model: string | null;
  attributes: Record<string, string>;
  weight: number | null;
  weightUnit: string | null;
  dimensions: any;
  dimensionUnit: string | null;
  createdAt: string;
  updatedAt: string;
  tags: string[];
}

export function ProductDetailsCard({
  category,
  brand,
  model,
  attributes,
  weight,
  weightUnit,
  dimensions,
  dimensionUnit,
  createdAt,
  updatedAt,
  tags,
}: ProductDetailsCardProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Info className="h-5 w-5" />
            Product Details
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Basic Info */}
          <div className="space-y-3 text-base">
            {category && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Category:</span>
                <span className="font-semibold">{category.name}</span>
              </div>
            )}
            {brand && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Brand:</span>
                <span className="font-semibold">{brand.name}</span>
              </div>
            )}
            {model && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Model:</span>
                <span className="font-semibold">{model}</span>
              </div>
            )}
          </div>

          {/* Variant Attributes */}
          {Object.entries(attributes).length > 0 && (
            <>
              <Separator />
              <div className="space-y-3 text-base">
                <p className="text-sm font-medium text-muted-foreground">Variant Attributes</p>
                {Object.entries(attributes).map(([key, value]) => (
                  <div key={key} className="flex justify-between">
                    <span className="text-muted-foreground capitalize">{key}:</span>
                    <span className="font-semibold">{value}</span>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* Physical Specs */}
          {(weight || dimensions) && (
            <>
              <Separator />
              <div className="space-y-3 text-base">
                <p className="text-sm font-medium text-muted-foreground">Physical Specifications</p>
                {weight && (
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground flex items-center gap-1.5">
                      <Weight className="h-4 w-4" />
                      Weight:
                    </span>
                    <span className="font-semibold">
                      {weight} {weightUnit}
                    </span>
                  </div>
                )}
                {dimensions && (
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground flex items-center gap-1.5">
                      <Ruler className="h-4 w-4" />
                      Dimensions:
                    </span>
                    <span className="font-semibold text-sm">
                      {dimensions.length} × {dimensions.width} × {dimensions.height} {dimensionUnit}
                    </span>
                  </div>
                )}
              </div>
            </>
          )}

          {/* Dates */}
          <Separator />
          <div className="space-y-3 text-sm">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground flex items-center gap-1.5">
                <Calendar className="h-4 w-4" />
                Created:
              </span>
              <span className="font-medium">{formatDate(createdAt)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground flex items-center gap-1.5">
                <Calendar className="h-4 w-4" />
                Updated:
              </span>
              <span className="font-medium">{formatDate(updatedAt)}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Product Tags */}
      {tags.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Tags</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => (
                <Badge key={tag} variant="outline" size="sm">
                  {tag}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
