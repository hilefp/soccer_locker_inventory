import { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Loader2,
  Package,
  Search,
  Star,
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
import { RadioGroup, RadioGroupItem } from '@/shared/components/ui/radio-group';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select';
import { useClub } from '../hooks/use-clubs';
import { useClubProducts, useGroupClubProducts } from '../hooks/use-club-products';
import { ClubProduct } from '../types/club-product';
import { useDocumentTitle } from '@/shared/hooks/use-document-title';
import { toast } from 'sonner';

export function PackageCreatePage() {
  useDocumentTitle('Create Package');
  const { clubId } = useParams<{ clubId: string }>();
  const navigate = useNavigate();

  const { data: club, isLoading: clubLoading } = useClub(clubId);
  const { data: clubProductsResponse, isLoading: productsLoading } = useClubProducts(clubId, {
    limit: 100,
  });
  const groupMutation = useGroupClubProducts(clubId!);

  // Step management
  const [step, setStep] = useState<1 | 2>(1);

  // Step 1 state
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');

  // Step 2 state
  const [primaryId, setPrimaryId] = useState<string>('');
  const [packageName, setPackageName] = useState('');
  const [packagePrice, setPackagePrice] = useState<string>('');
  const [packageDescription, setPackageDescription] = useState('');

  const isLoading = clubLoading || productsLoading;

  // Filter products: only ungrouped
  const availableProducts = useMemo(() => {
    const all = clubProductsResponse?.data || [];
    return all.filter((p) => !p.groupId);
  }, [clubProductsResponse]);

  // Search filtered
  const filteredProducts = useMemo(() => {
    if (!searchQuery) return availableProducts;
    const query = searchQuery.toLowerCase();
    return availableProducts.filter(
      (p) =>
        p.name?.toLowerCase().includes(query) ||
        p.product?.name?.toLowerCase().includes(query) ||
        p.tags?.some((t) => t.toLowerCase().includes(query)) ||
        p.product?.variants?.some((v) => v.sku?.toLowerCase().includes(query))
    );
  }, [availableProducts, searchQuery]);

  const selectedProducts = useMemo(() => {
    return availableProducts.filter((p) => selectedIds.has(p.id));
  }, [availableProducts, selectedIds]);

  const toggleProduct = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
        if (primaryId === id) setPrimaryId('');
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const canProceedToStep2 = selectedIds.size >= 2;

  const handleGoToStep2 = () => {
    if (!canProceedToStep2) {
      toast.error('Please select at least 2 products');
      return;
    }
    // Auto-select first product as primary if not set
    if (!primaryId || !selectedIds.has(primaryId)) {
      setPrimaryId(Array.from(selectedIds)[0]);
    }
    setStep(2);
  };

  const canSubmit =
    primaryId &&
    selectedIds.has(primaryId) &&
    selectedIds.size >= 2 &&
    packagePrice &&
    parseFloat(packagePrice) > 0;

  const handleSubmit = async () => {
    if (!canSubmit || !clubId) return;

    try {
      await groupMutation.mutateAsync({
        clubProductIds: Array.from(selectedIds),
        primaryClubProductId: primaryId,
        packageName: packageName || undefined,
        packagePrice: parseFloat(packagePrice),
        packageDescription: packageDescription || undefined,
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
                  {selectedIds.size} selected (min 2)
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                Choose the products you want to bundle together. Only ungrouped products are shown.
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
                      if (value) toggleProduct(value);
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a product to add..." />
                    </SelectTrigger>
                    <SelectContent>
                      {availableProducts
                        .filter((p) => !selectedIds.has(p.id))
                        .map((product) => (
                          <SelectItem key={product.id} value={product.id}>
                            {getProductDisplayName(product)} — {getProductPrice(product)}
                          </SelectItem>
                        ))}
                      {availableProducts.filter((p) => !selectedIds.has(p.id)).length === 0 && (
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

              {/* Selected products summary */}
              {selectedIds.size > 0 && (
                <div className="flex flex-wrap gap-2">
                  {selectedProducts.map((product) => (
                    <Badge
                      key={product.id}
                      variant="outline"
                      className="flex items-center gap-1.5 py-1 px-2.5"
                    >
                      {getProductDisplayName(product)}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleProduct(product.id);
                        }}
                        className="ml-1 hover:text-destructive"
                      >
                        <X className="size-3" />
                      </button>
                    </Badge>
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
                      : 'No ungrouped products available'}
                  </p>
                </div>
              ) : (
                <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
                  {filteredProducts.map((product) => {
                    const isSelected = selectedIds.has(product.id);
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
                        onClick={() => toggleProduct(product.id)}
                      >
                        <Checkbox
                          checked={isSelected}
                          onCheckedChange={() => toggleProduct(product.id)}
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
            {/* Primary Product Selection */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Primary Product</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Select which product will be the display face of the package in the shop.
                </p>
              </CardHeader>
              <CardContent>
                <RadioGroup value={primaryId} onValueChange={setPrimaryId}>
                  <div className="space-y-2">
                    {selectedProducts.map((product) => {
                      const displayName = getProductDisplayName(product);
                      const imageUrl = getProductImage(product);
                      const isPrimary = primaryId === product.id;

                      return (
                        <div
                          key={product.id}
                          className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                            isPrimary
                              ? 'border-primary bg-primary/5'
                              : 'border-border hover:bg-accent/50'
                          }`}
                          onClick={() => setPrimaryId(product.id)}
                        >
                          <RadioGroupItem value={product.id} id={`primary-${product.id}`} />
                          <div className="flex items-center justify-center rounded-md bg-accent/50 h-[36px] w-[44px] shrink-0">
                            {imageUrl ? (
                              <img
                                src={imageUrl}
                                className="h-[28px] w-full object-contain"
                                alt={displayName}
                              />
                            ) : (
                              <Package className="size-4 text-muted-foreground" />
                            )}
                          </div>
                          <Label htmlFor={`primary-${product.id}`} className="flex-1 cursor-pointer">
                            <span className="text-sm font-medium">{displayName}</span>
                          </Label>
                          {isPrimary && (
                            <Badge variant="primary" className="text-xs">
                              <Star className="size-3 mr-1" />
                              Primary
                            </Badge>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </RadioGroup>
              </CardContent>
            </Card>

            {/* Package Details */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Package Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="packageName">Package Name</Label>
                  <Input
                    id="packageName"
                    value={packageName}
                    onChange={(e) => setPackageName(e.target.value)}
                    placeholder="e.g., Field Player Package"
                  />
                  <p className="text-xs text-muted-foreground">
                    A display name for this package. If empty, the primary product's name will be used.
                  </p>
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
                    The fixed price for the entire package. This will replace individual product prices.
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
                  <p className="text-xs text-muted-foreground">
                    Describe what's included in the package. This will be displayed in the shop.
                  </p>
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
                {/* Primary product image */}
                {primaryId && (
                  <div className="flex items-center justify-center bg-accent/30 rounded-lg h-[140px]">
                    {(() => {
                      const primary = selectedProducts.find((p) => p.id === primaryId);
                      const img = primary ? getProductImage(primary) : null;
                      return img ? (
                        <img src={img} alt="Package" className="h-full object-contain p-3" />
                      ) : (
                        <Package className="size-10 text-muted-foreground" />
                      );
                    })()}
                  </div>
                )}

                {/* Package name */}
                <div>
                  <p className="text-xs text-muted-foreground">Package Name</p>
                  <p className="font-semibold">
                    {packageName
                      || (primaryId
                        ? getProductDisplayName(
                            selectedProducts.find((p) => p.id === primaryId)!
                          )
                        : 'Select a primary product')}
                  </p>
                </div>

                {/* Package price */}
                <div>
                  <p className="text-xs text-muted-foreground">Package Price</p>
                  <p className="text-xl font-bold text-foreground">
                    {packagePrice ? `$${parseFloat(packagePrice).toFixed(2)}` : '-'}
                  </p>
                </div>

                {/* Products in package */}
                <div>
                  <p className="text-xs text-muted-foreground mb-2">
                    Products ({selectedProducts.length})
                  </p>
                  <div className="space-y-2">
                    {selectedProducts.map((product) => (
                      <div key={product.id} className="flex items-center gap-2 text-sm">
                        <div className="flex items-center justify-center rounded bg-accent/50 h-[24px] w-[30px] shrink-0">
                          {getProductImage(product) ? (
                            <img
                              src={getProductImage(product)!}
                              className="h-[18px] w-full object-contain"
                              alt=""
                            />
                          ) : (
                            <Package className="size-3 text-muted-foreground" />
                          )}
                        </div>
                        <span className="truncate">{getProductDisplayName(product)}</span>
                        {product.id === primaryId && (
                          <Star className="size-3 text-primary shrink-0" />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
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
              disabled={!canSubmit || groupMutation.isPending}
            >
              {groupMutation.isPending ? (
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
