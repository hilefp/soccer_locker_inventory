import { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Loader2,
  Minus,
  Package,
  Plus,
  Search,
  X,
  Building2,
} from 'lucide-react';
import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Checkbox } from '@/shared/components/ui/checkbox';
import { Input, InputWrapper } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Textarea } from '@/shared/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select';
import { useClub } from '../hooks/use-clubs';
import { useClubProducts } from '../hooks/use-club-products';
import { useCreateClubPackage } from '../hooks/use-club-packages';
import { ClubProduct } from '../types/club-product';
import { PackageItemDto } from '../types/club-package';
import { useDocumentTitle } from '@/shared/hooks/use-document-title';
import { TagMultiSelect } from '@/modules/tags/components/tag-multi-select';
import { ProductFormImageUpload } from '@/modules/products/components/product-form-image-upload';
import { toast } from 'sonner';

interface SelectedItem {
  clubProduct: ClubProduct;
  quantity: number;
}

export function PackageCreatePage() {
  useDocumentTitle('Create Package');
  const { clubId } = useParams<{ clubId: string }>();
  const navigate = useNavigate();

  const { data: club, isLoading: clubLoading } = useClub(clubId);
  const { data: clubProductsResponse, isLoading: productsLoading } = useClubProducts(clubId, {
    limit: 100,
  });
  const createMutation = useCreateClubPackage(clubId!);

  // Step management
  const [step, setStep] = useState<1 | 2>(1);

  // Step 1 state - selected items with quantities
  const [selectedItems, setSelectedItems] = useState<Map<string, SelectedItem>>(new Map());
  const [searchQuery, setSearchQuery] = useState('');

  // Step 2 state
  const [packageName, setPackageName] = useState('');
  const [packagePrice, setPackagePrice] = useState<string>('');
  const [packageDescription, setPackageDescription] = useState('');
  const [packageTags, setPackageTags] = useState<string[]>([]);
  const [imageUrls, setImageUrls] = useState<string[]>([]);

  const isLoading = clubLoading || productsLoading;

  const allProducts = useMemo(() => {
    return clubProductsResponse?.data || [];
  }, [clubProductsResponse]);

  // Search filtered
  const filteredProducts = useMemo(() => {
    if (!searchQuery) return allProducts;
    const query = searchQuery.toLowerCase();
    return allProducts.filter(
      (p) =>
        p.name?.toLowerCase().includes(query) ||
        p.product?.name?.toLowerCase().includes(query) ||
        p.tags?.some((t) => t.toLowerCase().includes(query)) ||
        p.product?.variants?.some((v) => v.sku?.toLowerCase().includes(query))
    );
  }, [allProducts, searchQuery]);

  const selectedItemsList = useMemo(() => {
    return Array.from(selectedItems.values());
  }, [selectedItems]);

  const toggleProduct = (product: ClubProduct) => {
    setSelectedItems((prev) => {
      const next = new Map(prev);
      if (next.has(product.id)) {
        next.delete(product.id);
      } else {
        next.set(product.id, { clubProduct: product, quantity: 1 });
      }
      return next;
    });
  };

  const updateQuantity = (productId: string, delta: number) => {
    setSelectedItems((prev) => {
      const next = new Map(prev);
      const item = next.get(productId);
      if (!item) return prev;
      const newQty = Math.max(1, item.quantity + delta);
      next.set(productId, { ...item, quantity: newQty });
      return next;
    });
  };

  const canProceedToStep2 = selectedItems.size >= 1;

  const handleGoToStep2 = () => {
    if (!canProceedToStep2) {
      toast.error('Please select at least 1 product');
      return;
    }
    setStep(2);
  };

  const canSubmit =
    packageName.trim() &&
    selectedItems.size >= 1 &&
    packagePrice &&
    parseFloat(packagePrice) > 0;

  const handleSubmit = async () => {
    if (!canSubmit || !clubId) return;

    const items: PackageItemDto[] = selectedItemsList.map((item, index) => ({
      clubProductId: item.clubProduct.id,
      quantity: item.quantity,
      sortOrder: index,
    }));

    try {
      await createMutation.mutateAsync({
        name: packageName.trim(),
        description: packageDescription || undefined,
        price: parseFloat(packagePrice),
        tags: packageTags.length > 0 ? packageTags : undefined,
        imageUrls: imageUrls.length > 0 ? imageUrls : undefined,
        items,
      });
      navigate(`/clubs/${clubId}/packages`);
    } catch (error) {
      console.error('Error creating package:', error);
    }
  };

  const getProductDisplayName = (p: ClubProduct) => p.name || p.product?.name || 'Unnamed';
  const getProductImage = (p: ClubProduct) =>
    p.imageUrls?.[0] || p.product?.imageUrl || p.product?.imageUrls?.[0];
  const getProductSku = (p: ClubProduct) =>
    p.product?.variants?.reduce(
      (shortest, v) => (!shortest || v.sku.length < shortest.length ? v.sku : shortest),
      '' as string
    ) || 'N/A';
  const getProductPrice = (p: ClubProduct) => {
    if (p.price) return p.price;
    const basePrice = p.product?.defaultVariant?.price;
    if (basePrice) return `$${Number(basePrice).toFixed(2)}`;
    return '-';
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center py-20">
          <Loader2 className="size-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  if (!club) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <Building2 className="size-12 text-muted-foreground" />
          <h2 className="text-xl font-semibold">Club not found</h2>
          <Button onClick={() => navigate('/clubs')}>Back to Clubs</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate(`/clubs/${clubId}/packages`)}
        >
          <ArrowLeft className="size-4 mr-2" />
          Back
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Create Package</h1>
          <p className="text-sm text-muted-foreground">{club.name}</p>
        </div>
      </div>

      {/* Steps indicator */}
      <div className="flex items-center gap-3">
        <div
          className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
            step === 1
              ? 'bg-foreground text-background'
              : 'bg-accent text-muted-foreground'
          }`}
        >
          {step > 1 ? <Check className="size-4" /> : <span>1</span>}
          Select Products
        </div>
        <ArrowRight className="size-4 text-muted-foreground" />
        <div
          className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
            step === 2
              ? 'bg-foreground text-background'
              : 'bg-accent text-muted-foreground'
          }`}
        >
          <span>2</span>
          Configure Package
        </div>
      </div>

      {/* Step 1: Select Products */}
      {step === 1 && (
        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">
                  Select Products for Package
                </CardTitle>
                <Badge variant="outline">
                  {selectedItems.size} selected (min 1)
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                Choose the products to bundle together. You can set quantity for each item.
                Products can belong to multiple packages.
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Quick Add Select + Search */}
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex-1">
                  <Label className="text-xs mb-1.5 block">Quick Add</Label>
                  <Select
                    value=""
                    onValueChange={(value) => {
                      const product = allProducts.find((p) => p.id === value);
                      if (product) toggleProduct(product);
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a product to add..." />
                    </SelectTrigger>
                    <SelectContent>
                      {allProducts
                        .filter((p) => !selectedItems.has(p.id))
                        .map((product) => (
                          <SelectItem key={product.id} value={product.id}>
                            {getProductDisplayName(product)} — {getProductPrice(product)}
                          </SelectItem>
                        ))}
                      {allProducts.filter((p) => !selectedItems.has(p.id)).length === 0 && (
                        <SelectItem value="__empty__" disabled>
                          No more products available
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex-1">
                  <Label className="text-xs mb-1.5 block">Search</Label>
                  <InputWrapper className="w-full">
                    <Search className="size-4" />
                    <Input
                      placeholder="Search by name, SKU, or tag..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    {searchQuery && (
                      <Button
                        variant="dim"
                        size="sm"
                        className="-me-3.5"
                        onClick={() => setSearchQuery('')}
                      >
                        <X className="size-4" />
                      </Button>
                    )}
                  </InputWrapper>
                </div>
              </div>

              {/* Selected products with quantity controls */}
              {selectedItems.size > 0 && (
                <div className="space-y-2 border rounded-lg p-3">
                  <p className="text-xs font-medium text-muted-foreground mb-2">Selected Items</p>
                  {selectedItemsList.map(({ clubProduct, quantity }) => (
                    <div
                      key={clubProduct.id}
                      className="flex items-center gap-3 p-2 rounded-md bg-primary/5 border border-primary/20"
                    >
                      <div className="flex items-center justify-center rounded-md bg-accent/50 h-[32px] w-[40px] shrink-0">
                        {getProductImage(clubProduct) ? (
                          <img
                            src={getProductImage(clubProduct)!}
                            className="h-[24px] w-full object-contain"
                            alt=""
                          />
                        ) : (
                          <Package className="size-4 text-muted-foreground" />
                        )}
                      </div>
                      <span className="text-sm font-medium flex-1 truncate">
                        {getProductDisplayName(clubProduct)}
                      </span>
                      <div className="flex items-center gap-1.5">
                        <Button
                          variant="outline"
                          size="sm"
                          mode="icon"
                          className="size-7"
                          onClick={(e) => {
                            e.stopPropagation();
                            updateQuantity(clubProduct.id, -1);
                          }}
                          disabled={quantity <= 1}
                        >
                          <Minus className="size-3" />
                        </Button>
                        <span className="text-sm font-semibold w-6 text-center">{quantity}</span>
                        <Button
                          variant="outline"
                          size="sm"
                          mode="icon"
                          className="size-7"
                          onClick={(e) => {
                            e.stopPropagation();
                            updateQuantity(clubProduct.id, 1);
                          }}
                        >
                          <Plus className="size-3" />
                        </Button>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleProduct(clubProduct);
                        }}
                        className="ml-1 hover:text-destructive"
                      >
                        <X className="size-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Product list */}
              {filteredProducts.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 gap-3">
                  <Package className="size-10 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    {searchQuery
                      ? 'No products match your search'
                      : 'No products available'}
                  </p>
                </div>
              ) : (
                <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1">
                  {filteredProducts.map((product) => {
                    const isSelected = selectedItems.has(product.id);
                    const displayName = getProductDisplayName(product);
                    const imageUrl = getProductImage(product);
                    const sku = getProductSku(product);
                    const price = getProductPrice(product);

                    return (
                      <div
                        key={product.id}
                        className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                          isSelected
                            ? 'border-primary bg-primary/5'
                            : 'border-border hover:bg-accent/50'
                        }`}
                        onClick={() => toggleProduct(product)}
                      >
                        <Checkbox
                          checked={isSelected}
                          onCheckedChange={() => toggleProduct(product)}
                        />
                        <div className="flex items-center justify-center rounded-md bg-accent/50 h-[40px] w-[50px] shrink-0">
                          {imageUrl ? (
                            <img
                              src={imageUrl}
                              className="h-[30px] w-full object-contain"
                              alt={displayName}
                            />
                          ) : (
                            <Package className="size-5 text-muted-foreground" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{displayName}</p>
                          <p className="text-xs text-muted-foreground">SKU: {sku}</p>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="text-sm font-semibold">{price}</p>
                          {product.tags && product.tags.length > 0 && (
                            <div className="flex gap-1 mt-1 justify-end">
                              {product.tags.slice(0, 2).map((tag) => (
                                <Badge key={tag} variant="outline" className="text-[10px] px-1.5">
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              onClick={() => navigate(`/clubs/${clubId}/packages`)}
            >
              Cancel
            </Button>
            <Button
              variant="mono"
              onClick={handleGoToStep2}
              disabled={!canProceedToStep2}
            >
              Continue
              <ArrowRight className="size-4 ml-2" />
            </Button>
          </div>
        </div>
      )}

      {/* Step 2: Configure Package */}
      {step === 2 && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Configuration */}
          <div className="lg:col-span-2 space-y-6">
            {/* Package Details */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Package Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="packageName">
                    Package Name <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="packageName"
                    value={packageName}
                    onChange={(e) => setPackageName(e.target.value)}
                    placeholder="e.g., Field Player Kit"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="packagePrice">
                    Package Price <span className="text-destructive">*</span>
                  </Label>
                  <InputWrapper>
                    <span className="text-sm text-muted-foreground">$</span>
                    <Input
                      id="packagePrice"
                      type="number"
                      step="0.01"
                      min="0.01"
                      value={packagePrice}
                      onChange={(e) => setPackagePrice(e.target.value)}
                      placeholder="0.00"
                    />
                  </InputWrapper>
                  <p className="text-xs text-muted-foreground">
                    The fixed price for the entire package bundle.
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="packageDescription">Package Description</Label>
                  <Textarea
                    id="packageDescription"
                    value={packageDescription}
                    onChange={(e) => setPackageDescription(e.target.value)}
                    placeholder="e.g., FIELD PLAYER PACKAGE INCLUDES: 1 Navy Game Jersey, 1 White Game Jersey..."
                    rows={4}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Tags</Label>
                  <TagMultiSelect
                    selectedTags={packageTags}
                    onTagsChange={setPackageTags}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Package Images */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Package Images</CardTitle>
              </CardHeader>
              <CardContent>
                <ProductFormImageUpload
                  mode="new"
                  initialImages={imageUrls}
                  maxFiles={5}
                  onAllImagesChange={(urls) => setImageUrls(urls)}
                />
              </CardContent>
            </Card>

            {/* Items in Package */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">
                  Items in Package ({selectedItemsList.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {selectedItemsList.map(({ clubProduct, quantity }) => {
                    const displayName = getProductDisplayName(clubProduct);
                    const imageUrl = getProductImage(clubProduct);
                    const sku = getProductSku(clubProduct);

                    return (
                      <div
                        key={clubProduct.id}
                        className="flex items-center gap-3 p-3 rounded-lg border"
                      >
                        <div className="flex items-center justify-center rounded-md bg-accent/50 h-9 w-11 shrink-0">
                          {imageUrl ? (
                            <img
                              src={imageUrl}
                              className="h-7 w-full object-contain"
                              alt={displayName}
                            />
                          ) : (
                            <Package className="size-4 text-muted-foreground" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{displayName}</p>
                          <p className="text-xs text-muted-foreground">SKU: {sku}</p>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Button
                            variant="outline"
                            size="sm"
                            mode="icon"
                            className="size-7"
                            onClick={() => updateQuantity(clubProduct.id, -1)}
                            disabled={quantity <= 1}
                          >
                            <Minus className="size-3" />
                          </Button>
                          <span className="text-sm font-semibold w-6 text-center">{quantity}</span>
                          <Button
                            variant="outline"
                            size="sm"
                            mode="icon"
                            className="size-7"
                            onClick={() => updateQuantity(clubProduct.id, 1)}
                          >
                            <Plus className="size-3" />
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right: Preview */}
          <div className="space-y-6">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Package Preview</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Package name */}
                <div>
                  <p className="text-xs text-muted-foreground">Package Name</p>
                  <p className="font-semibold">
                    {packageName || 'Enter a package name'}
                  </p>
                </div>

                {/* Package price */}
                <div>
                  <p className="text-xs text-muted-foreground">Package Price</p>
                  <p className="text-xl font-bold text-foreground">
                    {packagePrice ? `$${parseFloat(packagePrice).toFixed(2)}` : '-'}
                  </p>
                </div>

                {/* Items in package */}
                <div>
                  <p className="text-xs text-muted-foreground mb-2">
                    Items ({selectedItemsList.reduce((sum, i) => sum + i.quantity, 0)} total)
                  </p>
                  <div className="space-y-2">
                    {selectedItemsList.map(({ clubProduct, quantity }) => (
                      <div key={clubProduct.id} className="flex items-center gap-2 text-sm">
                        <div className="flex items-center justify-center rounded bg-accent/50 h-6 w-[30px] shrink-0">
                          {getProductImage(clubProduct) ? (
                            <img
                              src={getProductImage(clubProduct)!}
                              className="h-[18px] w-full object-contain"
                              alt=""
                            />
                          ) : (
                            <Package className="size-3 text-muted-foreground" />
                          )}
                        </div>
                        <span className="truncate">{getProductDisplayName(clubProduct)}</span>
                        <Badge variant="outline" className="text-xs shrink-0">
                          x{quantity}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Tags preview */}
                {packageTags.length > 0 && (
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Tags</p>
                    <div className="flex flex-wrap gap-1">
                      {packageTags.map((tag) => (
                        <Badge key={tag} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Actions (full width) */}
          <div className="lg:col-span-3 flex items-center justify-between pt-2">
            <Button variant="outline" onClick={() => setStep(1)}>
              <ArrowLeft className="size-4 mr-2" />
              Back to Selection
            </Button>
            <Button
              variant="mono"
              onClick={handleSubmit}
              disabled={!canSubmit || createMutation.isPending}
            >
              {createMutation.isPending ? (
                <>
                  <Loader2 className="size-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Check className="size-4 mr-2" />
                  Create Package
                </>
              )}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
