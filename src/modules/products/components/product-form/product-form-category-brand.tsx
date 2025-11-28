import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Label } from '@/shared/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select';
import { ProductCategory } from '@/modules/products/types/product-category.type';
import { ProductBrand } from '@/modules/products/types/product-brand.type';

interface ProductFormCategoryBrandProps {
  categoryId: string;
  setCategoryId: (value: string) => void;
  brandId: string;
  setBrandId: (value: string) => void;
  categories: ProductCategory[];
  brands: ProductBrand[];
  categoriesLoading: boolean;
  brandsLoading: boolean;
  isLoading: boolean;
}

export function ProductFormCategoryBrand({
  categoryId,
  setCategoryId,
  brandId,
  setBrandId,
  categories,
  brands,
  categoriesLoading,
  brandsLoading,
  isLoading,
}: ProductFormCategoryBrandProps) {
  return (
    <Card className="rounded-md">
      <CardHeader className="min-h-[38px] bg-accent/50">
        <CardTitle className="text-2sm">Category & Brand</CardTitle>
      </CardHeader>

      <CardContent className="pt-4 space-y-3">
        <div className="flex flex-col gap-2">
          <Label className="text-xs">Product Category</Label>
          <Select
            value={categoryId || 'none'}
            onValueChange={(value) => setCategoryId(value === 'none' ? '' : value)}
            disabled={isLoading || categoriesLoading}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">None (Uncategorized)</SelectItem>
              {categories
                .filter((cat) => cat.isActive)
                .map((category) => (
                  <SelectItem key={category.id} value={category.id || ''}>
                    {category.name}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
          {categoriesLoading && (
            <span className="text-xs text-muted-foreground">Loading categories...</span>
          )}
        </div>

        <div className="flex flex-col gap-2">
          <Label className="text-xs">Product Brand</Label>
          <Select
            value={brandId || 'none'}
            onValueChange={(value) => setBrandId(value === 'none' ? '' : value)}
            disabled={isLoading || brandsLoading}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select Brand" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">None (No Brand)</SelectItem>
              {brands
                .filter((brand) => brand.isActive)
                .map((brand) => (
                  <SelectItem key={brand.id} value={brand.id || ''}>
                    {brand.name}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
          {brandsLoading && (
            <span className="text-xs text-muted-foreground">Loading brands...</span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
