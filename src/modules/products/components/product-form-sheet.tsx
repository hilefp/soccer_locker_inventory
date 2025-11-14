'use client';

import { useState, useEffect, useCallback } from 'react';
import { CircleX, DollarSign } from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { Badge, BadgeButton } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardToolbar,
} from '@/shared/components/ui/card';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { ScrollArea } from '@/shared/components/ui/scroll-area';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select';
import { Separator } from '@/shared/components/ui/separator';
import {
  Sheet,
  SheetBody,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/shared/components/ui/sheet';
import { Switch } from '@/shared/components/ui/switch';
import { Textarea } from '@/shared/components/ui/textarea';
import { ImageFile, ProductFormImageUpload } from '@/modules/products/components/product-form-image-upload';
import { ProductFormVariants } from '@/modules/products/components/product-form-variants';
import { useProductCategories } from '@/modules/products/hooks/use-product-categories';
import { useProductBrands } from '@/modules/products/hooks/use-product-brands';
import { useProducts, useCreateProduct, useUpdateProduct, useProduct } from '@/modules/products/hooks/use-products';
import { ProductRequest } from '../types/product.type';

function ProductFormTagInput({
  tags,
  setTags
}: {
  tags: string[];
  setTags: (tags: string[]) => void;
}) {
  const [inputValue, setInputValue] = useState('');

  const addTag = (tag: string) => {
    if (tag.trim() && !tags.includes(tag.trim())) {
      setTags([...tags, tag.trim()]);
      setInputValue('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addTag(inputValue);
    }
  };

  return (
    <div>
      <div className="flex flex-col gap-2.5 mb-2.5">
        <Label className="text-xs leading-3">Tags</Label>
        <Input
          placeholder="Add tags (press Enter or comma)"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
        />
      </div>
      <div className="flex flex-wrap items-center gap-2.5">
        {tags.map((tag) => (
          <Badge
            key={tag}
            variant="secondary"
            appearance="light"
            className="flex items-center gap-1"
          >
            {tag}
            <BadgeButton onClick={() => removeTag(tag)}>
              <CircleX className="size-3.5 text-muted-foreground" />
            </BadgeButton>
          </Badge>
        ))}
      </div>
    </div>
  );
}

export function ProductFormSheet({
  mode,
  open,
  onOpenChange,
  productId,
  onSuccess,
}: {
  mode: 'new' | 'edit';
  open: boolean;
  onOpenChange: (open: boolean) => void;
  productId?: string;
  onSuccess?: () => void;
}) {
  const isNewMode = mode === 'new';
  const isEditMode = mode === 'edit';

  // Form state
  const [productName, setProductName] = useState('');
  const [slug, setSlug] = useState('');
  const [sku, setSku] = useState('');
  const [price, setPrice] = useState(0);
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState<string>('');
  const [brandId, setBrandId] = useState<string>('');
  const [status, setStatus] = useState('draft');
  const [isFeatured, setIsFeatured] = useState(false);
  const [tags, setTags] = useState<string[]>([]);
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [variants, setVariants] = useState<any[]>([]); // Store variants

  // Fetch data
  const { data: categories = [], isLoading: categoriesLoading } = useProductCategories();
  const { data: brands = [], isLoading: brandsLoading } = useProductBrands();
  const { data: product = null } = useProduct(productId || '');

  // Mutations
  const createMutation = useCreateProduct();
  const updateMutation = useUpdateProduct();

  const isLoading = createMutation.isPending || updateMutation.isPending;

  useEffect(() => {
    if (!isEditMode || !productId || !open) {
      return;
    }

    console.log('Loading product for edit. ProductId:', productId);

    if (product) {
      console.log('Found product:', product);
      setProductName(product.name);
      setSlug(product.slug);
      setSku(product.defaultVariant.sku || '');
      setPrice(product.defaultVariant.price || 0);
      setDescription(product.description || '');
      setCategoryId(product.categoryId || '');
      setBrandId(product.brandId || '');
      setStatus(product.isActive ? 'published' : 'draft');
      setIsFeatured(product.isFeatured || false);
      setTags(product.tags || []);
      setVariants(product.variants || []);
    } else {
      console.log('Product not found with id:', productId);
      toast.error('Product not found');
    }
  }, [isEditMode, productId, open, product]);

  // Reset form when closed
  useEffect(() => {
    if (!open) {
      setProductName('');
      setSlug('');
      setDescription('');
      setCategoryId('');
      setBrandId('');
      setStatus('draft');
      setIsFeatured(false);
      setTags([]);
      setVariants([]);
    }
  }, [open]);

  // Auto-generate slug from product name
  useEffect(() => {
    if (isNewMode && productName) {
      const generatedSlug = productName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
      setSlug(generatedSlug);
    }
  }, [productName, isNewMode]);

  const handleSave = async () => {
    if (!productName.trim() || !slug.trim()) {
      toast.error('Please fill in required fields (Product Name)');
      return;
    }

    const productData: ProductRequest = {
      name: productName,
      slug: slug,
      description: description || undefined,
      sku: sku,
      price: parseFloat(price.toString()),
      categoryId: categoryId || undefined,
      brandId: brandId || undefined,
      isActive: status === 'published',
      isFeatured: isFeatured,
      imageUrl: imageUrls.length > 0 ? imageUrls[0] : null,
      imageUrls: imageUrls,
      tags: tags.length > 0 ? tags : undefined,
    };

    try {
      if (isNewMode) {
        await createMutation.mutateAsync(productData);
      } else if (productId) {
        await updateMutation.mutateAsync({ id: productId, data: productData });
      }

      onSuccess?.();
      onOpenChange(false);
    } catch (error) {
      console.error('Error saving product:', error);
    }
  };

  const handleUploadComplete = useCallback((images: ImageFile[]) => {
    // Get URLs from uploaded images
    const uploadedUrls = images
      .map(img => img.uploadResponse?.url)
      .filter((url): url is string => !!url);

    setImageUrls(uploadedUrls);
  }, []);

  const handleAllImagesChange = useCallback((urls: string[]) => {
    // Update imageUrls with all image URLs in order
    setImageUrls(urls);
  }, []);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="gap-0 lg:w-[1080px] sm:max-w-none inset-5 border start-auto h-auto rounded-lg p-0 [&_[data-slot=sheet-close]]:top-4.5 [&_[data-slot=sheet-close]]:end-5">
        <SheetHeader className="border-b py-3.5 px-5 border-border">
          <SheetTitle className="font-medium">
            {isNewMode ? 'Create New Product' : `Edit Product${productId ? ` (ID: ${productId.slice(0, 8)}...)` : ''}`}
          </SheetTitle>
        </SheetHeader>

        <SheetBody className="p-0 grow">
          <div className="flex justify-between gap-2 flex-wrap border-b border-border p-5">
            <Select value={status} onValueChange={setStatus} indicatorPosition="right">
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Select Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="published">Published</SelectItem>
                <SelectItem value="archived">Archived</SelectItem>
              </SelectContent>
            </Select>

            <div className="flex items-center gap-2.5 text-xs text-gray-800 font-medium">
              Read about
              <Link to="#" className="text-primary">
                How to Create Product
              </Link>
              <Button variant="outline" className="text-dark" onClick={() => onOpenChange(false)} disabled={isLoading}>
                Cancel
              </Button>
              <Button variant="mono" onClick={handleSave} disabled={isLoading}>
                {isLoading ? 'Saving...' : isNewMode ? 'Create' : 'Save'}
              </Button>
            </div>
          </div>

          {/* Scroll */}
          <ScrollArea
            className="flex flex-col h-[calc(100dvh-15.2rem)] mx-1.5"
            viewportClassName="[&>div]:h-full [&>div>div]:h-full"
          >
            <div className="flex flex-wrap lg:flex-nowrap px-3.5 grow">
              <div className="grow lg:border-e border-border lg:pe-5 space-y-5 py-5">
                {/* Basic Info */}
                <Card className="rounded-md">
                  <CardHeader className="min-h-[38px] bg-accent/50">
                    <CardTitle className="text-2sm">Basic Info</CardTitle>
                    <CardToolbar>
                      <div className="flex items-center space-x-2">
                        <Label htmlFor="featured-switch" className="text-xs">
                          Featured
                        </Label>
                        <Switch
                          size="sm"
                          id="featured-switch"
                          checked={isFeatured}
                          onCheckedChange={setIsFeatured}
                          disabled={isLoading}
                        />
                      </div>
                    </CardToolbar>
                  </CardHeader>
                  <CardContent className="pt-4">
                    <div className="flex flex-col gap-2 mb-3">
                      <Label className="text-xs">Product Name *</Label>
                      <Input
                        placeholder="Product Name"
                        value={productName}
                        onChange={(e) => setProductName(e.target.value)}
                        disabled={isLoading}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-5 mb-2.5">
                      <div className="flex flex-col gap-2">
                        <Label className="text-xs">Slug *</Label>
                        <Input
                          placeholder="product-slug"
                          value={slug}
                          onChange={(e) => setSlug(e.target.value)}
                          disabled={isLoading}
                        />
                      </div>
                      <div className="flex flex-col gap-2">
                        <Label className="text-xs">Sku</Label>
                        <Input
                          placeholder="SKU"
                          value={sku}
                          onChange={(e) => setSku(e.target.value)}
                          disabled={isLoading}
                        />
                      </div>
                    </div>

                    <div className="flex flex-col gap-2 mb-2.5">
                      <Label className="text-xs">Price *</Label>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        value={price}
                        onChange={(e) => setPrice(parseFloat(e.target.value))}
                        disabled={isLoading}
                      />
                    </div>

                    <div className="flex flex-col gap-2">
                      <Label className="text-xs">Product Description</Label>
                      <Textarea
                        className="min-h-[100px]"
                        placeholder="Product Description"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        disabled={isLoading}
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Category & Brand */}
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
                            .filter(cat => cat.isActive)
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
                            .filter(brand => brand.isActive)
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

                <ProductFormVariants productId={productId || null} mode={mode} variants={variants} onVariantsChange={setVariants} />
              </div>

              <div className="w-full lg:w-[420px] shrink-0 lg:mt-5 space-y-5 lg:ps-5">
                <ProductFormImageUpload
                  mode={mode}
                  initialImages={
                    isEditMode && productId && product
                      ? (product.imageUrls || [])
                      : []
                  }
                  onUploadComplete={handleUploadComplete}
                  onAllImagesChange={handleAllImagesChange}
                />

                <Separator className="w-full"></Separator>

                <ProductFormTagInput tags={tags} setTags={setTags} />
              </div>
            </div>
          </ScrollArea>
        </SheetBody>

        <SheetFooter className="flex-row border-t not-only-of-type:justify-between items-center p-5 border-border gap-2">
          <Select value={status} onValueChange={setStatus} indicatorPosition="right" disabled={isLoading}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Select Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="published">Published</SelectItem>
              <SelectItem value="archived">Archived</SelectItem>
            </SelectContent>
          </Select>

          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
              Cancel
            </Button>
            <Button variant="mono" onClick={handleSave} disabled={isLoading}>
              {isLoading ? 'Saving...' : isNewMode ? 'Create' : 'Save'}
            </Button>
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
