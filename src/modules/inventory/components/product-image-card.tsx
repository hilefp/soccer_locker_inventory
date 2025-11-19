import { Card, CardContent } from '@/shared/components/ui/card';
import { Package } from 'lucide-react';

interface ProductImageCardProps {
  imageUrl: string | null;
  productName: string;
  imageUrls?: string[];
}

export function ProductImageCard({ imageUrl, productName, imageUrls }: ProductImageCardProps) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="aspect-square rounded-lg bg-accent/50 flex items-center justify-center overflow-hidden">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={productName}
              className="w-full h-full object-contain"
            />
          ) : (
            <Package className="h-24 w-24 text-muted-foreground" />
          )}
        </div>

        {/* Thumbnail gallery if multiple images */}
        {imageUrls && imageUrls.length > 1 && (
          <div className="grid grid-cols-4 gap-2 mt-4">
            {imageUrls.slice(0, 4).map((url, index) => (
              <div
                key={index}
                className="aspect-square rounded-md bg-accent/30 overflow-hidden cursor-pointer hover:ring-2 hover:ring-primary transition-all"
              >
                <img
                  src={url}
                  alt={`${productName} ${index + 1}`}
                  className="w-full h-full object-contain"
                />
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
