import { useState, useMemo, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Check,
  Loader2,
  Minus,
  Package,
  Plus,
  Search,
  Trash2,
  X,
  Building2,
} from 'lucide-react';
import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
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
import { useClubPackage, useUpdateClubPackage } from '../hooks/use-club-packages';
import { ClubProduct } from '../types/club-product';
import { PackageItemDto } from '../types/club-package';
import { useDocumentTitle } from '@/shared/hooks/use-document-title';

interface SelectedItem {
  clubProduct: ClubProduct;
  quantity: number;
}

export function PackageEditPage() {
  useDocumentTitle('Edit Package');
  const { clubId, packageId } = useParams<{ clubId: string; packageId: string }>();
  const navigate = useNavigate();

  const { data: club, isLoading: clubLoading } = useClub(clubId);
  const { data: pkg, isLoading: packageLoading } = useClubPackage(clubId, packageId);
  const { data: clubProductsResponse, isLoading: productsLoading } = useClubProducts(clubId, {
    limit: 100,
  });
  const updateMutation = useUpdateClubPackage(clubId!);

  // State
  const [packageName, setPackageName] = useState('');
  const [packagePrice, setPackagePrice] = useState<string>('');
  const [packageDescription, setPackageDescription] = useState('');
  const [packageTags, setPackageTags] = useState<string>('');
  const [isActive, setIsActive] = useState(true);
  const [selectedItems, setSelectedItems] = useState<Map<string, SelectedItem>>(new Map());
  const [showAddProducts, setShowAddProducts] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [initialized, setInitialized] = useState(false);

  const allProducts = useMemo(() => {
    return clubProductsResponse?.data || [];
  }, [clubProductsResponse]);

  // Initialize form from package data
  useEffect(() => {
    if (pkg && allProducts.length > 0 && !initialized) {
      setPackageName(pkg.name || '');
      setPackagePrice(pkg.price?.toString() || '');
      setPackageDescription(pkg.description || '');
      setPackageTags(pkg.tags?.join(', ') || '');
      setIsActive(pkg.isActive);

      const items = new Map<string, SelectedItem>();
      for (const item of pkg.items || []) {
        const clubProduct =
          item.clubProduct || allProducts.find((p) => p.id === item.clubProductId);
        if (clubProduct) {
          items.set(item.clubProductId, {
            clubProduct,
            quantity: item.quantity,
          });
        }
      }
      setSelectedItems(items);
      setInitialized(true);
    }
  }, [pkg, allProducts, initialized]);

  const selectedItemsList = useMemo(() => {
    return Array.from(selectedItems.values());
  }, [selectedItems]);

  // Available products for adding (not already in package)
  const availableProducts = useMemo(() => {
    return allProducts.filter((p) => !selectedItems.has(p.id));
  }, [allProducts, selectedItems]);

  const filteredAvailable = useMemo(() => {
    if (!searchQuery) return availableProducts;
    const query = searchQuery.toLowerCase();
    return availableProducts.filter(
      (p) =>
        p.name?.toLowerCase().includes(query) ||
        p.product?.name?.toLowerCase().includes(query) ||
        p.product?.variants?.some((v) => v.sku?.toLowerCase().includes(query))
    );
  }, [availableProducts, searchQuery]);

  const isLoading = clubLoading || packageLoading || productsLoading;

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

  const removeItem = (productId: string) => {
    setSelectedItems((prev) => {
      const next = new Map(prev);
      next.delete(productId);
      return next;
    });
  };

  const addProduct = (product: ClubProduct) => {
    setSelectedItems((prev) => {
      const next = new Map(prev);
      next.set(product.id, { clubProduct: product, quantity: 1 });
      return next;
    });
  };

  const canSubmit =
    packageName.trim() &&
    selectedItems.size >= 1 &&
    packagePrice &&
    parseFloat(packagePrice) > 0;

  const handleSubmit = async () => {
    if (!canSubmit || !clubId || !packageId) return;

    const items: PackageItemDto[] = selectedItemsList.map((item, index) => ({
      clubProductId: item.clubProduct.id,
      quantity: item.quantity,
      sortOrder: index,
    }));

    const tags = packageTags
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    try {
      await updateMutation.mutateAsync({
        packageId,
        data: {
          name: packageName.trim(),
          description: packageDescription || undefined,
          price: parseFloat(packagePrice),
          tags: tags.length > 0 ? tags : undefined,
          isActive,
          items,
        },
      });
      navigate(`/clubs/${clubId}/packages`);
    } catch (error) {
      console.error('Error updating package:', error);
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

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center py-20">
          <Loader2 className="size-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  if (!club || !pkg) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <Building2 className="size-12 text-muted-foreground" />
          <h2 className="text-xl font-semibold">
            {!club ? 'Club not found' : 'Package not found'}
          </h2>
          <Button onClick={() => navigate(`/clubs/${clubId || ''}/packages`)}>
            Back to Packages
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
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
            <h1 className="text-2xl font-bold">Edit Package</h1>
            <p className="text-sm text-muted-foreground">{club.name}</p>
          </div>
        </div>
      </div>

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
                <Label htmlFor="editPackageName">
                  Package Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="editPackageName"
                  value={packageName}
                  onChange={(e) => setPackageName(e.target.value)}
                  placeholder="e.g., Field Player Kit"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="editPackagePrice">
                  Package Price <span className="text-destructive">*</span>
                </Label>
                <InputWrapper>
                  <span className="text-sm text-muted-foreground">$</span>
                  <Input
                    id="editPackagePrice"
                    type="number"
                    step="0.01"
                    min="0.01"
                    value={packagePrice}
                    onChange={(e) => setPackagePrice(e.target.value)}
                    placeholder="0.00"
                  />
                </InputWrapper>
              </div>

              <div className="space-y-2">
                <Label htmlFor="editPackageDescription">Package Description</Label>
                <Textarea
                  id="editPackageDescription"
                  value={packageDescription}
                  onChange={(e) => setPackageDescription(e.target.value)}
                  placeholder="Describe what's included in the package..."
                  rows={4}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="editPackageTags">Tags</Label>
                <Input
                  id="editPackageTags"
                  value={packageTags}
                  onChange={(e) => setPackageTags(e.target.value)}
                  placeholder="e.g., field-player, 2025-season (comma separated)"
                />
              </div>

              <div className="flex items-center gap-2">
                <Label htmlFor="editPackageActive">Status</Label>
                <Select
                  value={isActive ? 'active' : 'inactive'}
                  onValueChange={(v) => setIsActive(v === 'active')}
                >
                  <SelectTrigger className="w-[140px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Items in Package */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">
                  Items in Package ({selectedItemsList.length})
                </CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowAddProducts(!showAddProducts)}
                >
                  <Plus className="size-4 mr-1.5" />
                  Add Products
                </Button>
              </div>
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
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeItem(clubProduct.id)}
                        disabled={selectedItems.size <= 1}
                        title={
                          selectedItems.size > 1
                            ? 'Remove from package'
                            : 'A package must have at least 1 product'
                        }
                        className="shrink-0"
                      >
                        <Trash2 className="size-4 text-muted-foreground hover:text-destructive" />
                      </Button>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Add Products Panel */}
          {showAddProducts && (
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">Add Products</CardTitle>
                  <Button variant="ghost" size="sm" onClick={() => setShowAddProducts(false)}>
                    <X className="size-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="flex-1">
                    <Label className="text-xs mb-1.5 block">Quick Add</Label>
                    <Select
                      value=""
                      onValueChange={(value) => {
                        const product = availableProducts.find((p) => p.id === value);
                        if (product) addProduct(product);
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a product to add..." />
                      </SelectTrigger>
                      <SelectContent>
                        {availableProducts.map((product) => (
                          <SelectItem key={product.id} value={product.id}>
                            {getProductDisplayName(product)}
                          </SelectItem>
                        ))}
                        {availableProducts.length === 0 && (
                          <SelectItem value="__empty__" disabled>
                            No products available
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
                        placeholder="Search products..."
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

                {filteredAvailable.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-6">
                    No products available to add.
                  </p>
                ) : (
                  <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
                    {filteredAvailable.map((product) => {
                      const displayName = getProductDisplayName(product);
                      const imageUrl = getProductImage(product);

                      return (
                        <div
                          key={product.id}
                          className="flex items-center gap-3 p-2.5 rounded-lg border border-border hover:bg-accent/50 cursor-pointer transition-colors"
                          onClick={() => addProduct(product)}
                        >
                          <div className="flex items-center justify-center rounded-md bg-accent/50 h-8 w-10 shrink-0">
                            {imageUrl ? (
                              <img
                                src={imageUrl}
                                className="h-6 w-full object-contain"
                                alt={displayName}
                              />
                            ) : (
                              <Package className="size-4 text-muted-foreground" />
                            )}
                          </div>
                          <span className="text-sm font-medium flex-1 truncate">{displayName}</span>
                          <Button variant="outline" size="sm">
                            <Plus className="size-3.5 mr-1" />
                            Add
                          </Button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right: Preview */}
        <div className="space-y-6">
          <Card className="sticky top-6">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Package Preview</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-xs text-muted-foreground">Package Name</p>
                <p className="font-semibold">
                  {packageName || '-'}
                </p>
              </div>

              <div>
                <p className="text-xs text-muted-foreground">Package Price</p>
                <p className="text-xl font-bold text-foreground">
                  {packagePrice ? `$${parseFloat(packagePrice).toFixed(2)}` : '-'}
                </p>
              </div>

              <div>
                <p className="text-xs text-muted-foreground">Status</p>
                <Badge
                  variant={isActive ? 'success' : 'secondary'}
                  appearance="light"
                  className="text-xs mt-1"
                >
                  {isActive ? 'Active' : 'Inactive'}
                </Badge>
              </div>

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
            </CardContent>
          </Card>
        </div>

        {/* Actions */}
        <div className="lg:col-span-3 flex items-center justify-between pt-2">
          <Button
            variant="outline"
            onClick={() => navigate(`/clubs/${clubId}/packages`)}
          >
            Cancel
          </Button>
          <Button
            variant="mono"
            onClick={handleSubmit}
            disabled={!canSubmit || updateMutation.isPending}
          >
            {updateMutation.isPending ? (
              <>
                <Loader2 className="size-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Check className="size-4 mr-2" />
                Save Changes
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
