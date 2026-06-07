import { useState } from 'react';
import { Check, ChevronDown, X } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Badge } from '@/shared/components/ui/badge';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/shared/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/shared/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select';
import { cn } from '@/shared/lib/utils';
import { useProductCategories } from '@/modules/products/hooks/use-product-categories';
import { useProductBrands } from '@/modules/products/hooks/use-product-brands';

// Size groups are stored as the KEY of the variant attributes JSON
// (e.g. { "Youth": "Youth X-Small" }), case-sensitive on the backend.
export const SIZE_TYPE_OPTIONS: { label: string; value: string }[] = [
  { label: 'Youth', value: 'Youth' },
  { label: 'Adult', value: 'Adult' },
  { label: "Women's", value: "Women's" },
  { label: 'Socks', value: 'Socks' },
  { label: 'Balls', value: 'Balls' },
];

export interface ProductFilterValues {
  categoryIds: string[];
  brandId: string;
  sizeType: string;
  color: string;
}

interface ProductFilterBarProps {
  values: ProductFilterValues;
  onToggleCategory: (id: string) => void;
  onBrandChange: (brandId: string) => void;
  onSizeTypeChange: (sizeType: string) => void;
  onColorChange: (color: string) => void;
}

/**
 * Reusable Categories / Brand / Size / Color filter controls.
 * Renders as a fragment so it can be dropped into any flex container.
 * Self-contained: fetches its own category and brand options.
 */
export function ProductFilterBar({
  values,
  onToggleCategory,
  onBrandChange,
  onSizeTypeChange,
  onColorChange,
}: ProductFilterBarProps) {
  const { categoryIds, brandId, sizeType, color } = values;
  const [categoryOpen, setCategoryOpen] = useState(false);
  const [brandOpen, setBrandOpen] = useState(false);

  const { data: categories } = useProductCategories();
  const { data: brands } = useProductBrands();

  return (
    <>
      {/* Category multiselect */}
      <Popover open={categoryOpen} onOpenChange={setCategoryOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm" className="h-8 gap-1.5">
            Categories
            {categoryIds.length > 0 && (
              <Badge variant="secondary" size="sm" className="rounded-full px-1.5">
                {categoryIds.length}
              </Badge>
            )}
            <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-56 p-0" align="start">
          <Command>
            <CommandInput placeholder="Search categories..." />
            <CommandList>
              <CommandEmpty>No categories found.</CommandEmpty>
              <CommandGroup>
                {categories?.map((cat) => (
                  <CommandItem
                    key={cat.id}
                    value={cat.name}
                    onSelect={() => onToggleCategory(cat.id!)}
                  >
                    <Check
                      className={cn(
                        'mr-2 h-4 w-4',
                        categoryIds.includes(cat.id!) ? 'opacity-100' : 'opacity-0'
                      )}
                    />
                    {cat.name}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {/* Brand single-select */}
      <Popover open={brandOpen} onOpenChange={setBrandOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm" className="h-8 gap-1.5">
            {brandId
              ? brands?.find((b) => b.id === brandId)?.name ?? 'Brand'
              : 'Brand'}
            {brandId && (
              <Badge variant="secondary" size="sm" className="rounded-full px-1.5">
                1
              </Badge>
            )}
            <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-56 p-0" align="start">
          <Command>
            <CommandInput placeholder="Search brands..." />
            <CommandList>
              <CommandEmpty>No brands found.</CommandEmpty>
              <CommandGroup>
                {brands?.map((brand) => (
                  <CommandItem
                    key={brand.id}
                    value={brand.name}
                    onSelect={() => {
                      onBrandChange(brandId === brand.id ? '' : brand.id!);
                      setBrandOpen(false);
                    }}
                  >
                    <Check
                      className={cn(
                        'mr-2 h-4 w-4',
                        brandId === brand.id ? 'opacity-100' : 'opacity-0'
                      )}
                    />
                    {brand.name}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {/* Size type */}
      <Select
        value={sizeType}
        onValueChange={(v) => onSizeTypeChange(v === 'all' ? '' : v)}
      >
        <SelectTrigger className="h-8 w-auto min-w-[130px] text-sm">
          <SelectValue placeholder="Size" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All sizes</SelectItem>
          {SIZE_TYPE_OPTIONS.map((opt) => (
            <SelectItem key={opt.value} value={opt.value}>
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Color */}
      <div className="relative">
        <Input
          placeholder="Color (e.g. navy)"
          value={color}
          onChange={(e) => onColorChange(e.target.value)}
          variant="sm"
          className="h-8 text-sm w-36 pr-7"
        />
        {color && (
          <Button
            variant="ghost"
            size="sm"
            className="absolute right-0 top-0 h-8 w-7 p-0"
            onClick={() => onColorChange('')}
          >
            <X className="h-3.5 w-3.5" />
          </Button>
        )}
      </div>
    </>
  );
}
