import { useState, useMemo, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Check,
  Loader2,
  Package,
  Plus,
  Search,
  Star,
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
import { RadioGroup, RadioGroupItem } from '@/shared/components/ui/radio-group';
import { useClub } from '../hooks/use-clubs';
import {
  useClubProducts,
  useClubProductGroups,
  useUpdateGroup,
} from '../hooks/use-club-products';
import { ClubProduct } from '../types/club-product';
import { useDocumentTitle } from '@/shared/hooks/use-document-title';
import { toast } from 'sonner';

export function PackageEditPage() {
  useDocumentTitle('Edit Package');
  const { clubId, groupId } = useParams<{ clubId: string; groupId: string }>();
  const navigate = useNavigate();

  const { data: club, isLoading: clubLoading } = useClub(clubId);
  const { data: groups = [], isLoading: groupsLoading } = useClubProductGroups(clubId);
  const { data: clubProductsResponse, isLoading: productsLoading } = useClubProducts(clubId, {
    limit: 200,
  });
  const updateMutation = useUpdateGroup(clubId!);

  // Find the current group
  const currentGroup = useMemo(() => {
    return groups.find((g) => g.groupId === groupId);
  }, [groups, groupId]);

  // State
  const [primaryId, setPrimaryId] = useState<string>('');
  const [packagePrice, setPackagePrice] = useState<string>('');
  const [packageDescription, setPackageDescription] = useState('');
  const [currentMemberIds, setCurrentMemberIds] = useState<Set<string>>(new Set());
  const [addProductIds, setAddProductIds] = useState<Set<string>>(new Set());
  const [removeProductIds, setRemoveProductIds] = useState<Set<string>>(new Set());
  const [showAddProducts, setShowAddProducts] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [initialized, setInitialized] = useState(false);

  // Initialize form from current group data
  useEffect(() => {
    if (currentGroup && !initialized) {
      const primary = currentGroup.primaryProduct;
      setPrimaryId(primary?.id || '');
      setPackagePrice(primary?.packagePrice?.toString() || '');
      setPackageDescription(primary?.packageDescription || '');
      setCurrentMemberIds(new Set(currentGroup.members?.map((m) => m.id) || []));
      setInitialized(true);
    }
  }, [currentGroup, initialized]);

  // Current members (original minus removed)
  const currentMembers = useMemo(() => {
    if (!currentGroup) return [];
    return (currentGroup.members || []).filter((m) => !removeProductIds.has(m.id));
  }, [currentGroup, removeProductIds]);

  // Products to add (selected from available)
  const productsToAdd = useMemo(() => {
    const all = clubProductsResponse?.data || [];
    return all.filter((p) => addProductIds.has(p.id));
  }, [clubProductsResponse, addProductIds]);

  // All products in the package after edits
  const allPackageProducts = useMemo(() => {
    return [...currentMembers, ...productsToAdd];
  }, [currentMembers, productsToAdd]);

  // Available ungrouped products (for the add dialog)
  const availableProducts = useMemo(() => {
    const all = clubProductsResponse?.data || [];
    return all.filter((p) => !p.groupId && !addProductIds.has(p.id));
  }, [clubProductsResponse, addProductIds]);

  // Filtered available products
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

  const isLoading = clubLoading || groupsLoading || productsLoading;

  // Validation
  const totalMembers = allPackageProducts.length;
  const canRemoveMember = totalMembers > 2;
  const priceValid = packagePrice && parseFloat(packagePrice) > 0;
  const primaryValid = primaryId && allPackageProducts.some((p) => p.id === primaryId);

  const hasChanges = useMemo(() => {
    if (!currentGroup) return false;
    const originalPrimary = currentGroup.primaryProduct?.id;
    const originalPrice = currentGroup.primaryProduct?.packagePrice;
    const originalDesc = currentGroup.primaryProduct?.packageDescription || '';
    return (
      primaryId !== originalPrimary ||
      parseFloat(packagePrice || '0') !== (originalPrice || 0) ||
      packageDescription !== originalDesc ||
      addProductIds.size > 0 ||
      removeProductIds.size > 0
    );
  }, [currentGroup, primaryId, packagePrice, packageDescription, addProductIds, removeProductIds]);

  const canSubmit = priceValid && primaryValid && totalMembers >= 2 && hasChanges;

  const handleRemoveMember = (id: string) => {
    if (!canRemoveMember) {
      toast.error('A package must have at least 2 products');
      return;
    }

    // If it's an original member, mark for removal
    if (currentMemberIds.has(id)) {
      setRemoveProductIds((prev) => new Set(prev).add(id));
    } else {
      // If it's a newly added product, just remove from add list
      setAddProductIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }

    // If removing the primary, reset primary
    if (primaryId === id) {
      const remaining = allPackageProducts.filter((p) => p.id !== id);
      setPrimaryId(remaining[0]?.id || '');
    }
  };

  const handleAddProduct = (id: string) => {
    setAddProductIds((prev) => new Set(prev).add(id));
  };

  const handleSubmit = async () => {
    if (!canSubmit || !clubId || !groupId) return;

    try {
      await updateMutation.mutateAsync({
        groupId,
        data: {
          addClubProductIds: addProductIds.size > 0 ? Array.from(addProductIds) : undefined,
          removeClubProductIds: removeProductIds.size > 0 ? Array.from(removeProductIds) : undefined,
          primaryClubProductId: primaryId !== currentGroup?.primaryProduct?.id ? primaryId : undefined,
          packagePrice: parseFloat(packagePrice),
          packageDescription: packageDescription || undefined,
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

  if (!club || !currentGroup) {
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
          {/* Current Members */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">
                  Products in Package ({totalMembers})
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
              <RadioGroup value={primaryId} onValueChange={setPrimaryId}>
                <div className="space-y-2">
                  {allPackageProducts.map((product) => {
                    const displayName = getProductDisplayName(product);
                    const imageUrl = getProductImage(product);
                    const sku = getProductSku(product);
                    const isPrimary = primaryId === product.id;
                    const isNew = addProductIds.has(product.id);

                    return (
                      <div
                        key={product.id}
                        className={`flex items-center gap-3 p-3 rounded-lg border transition-colors ${
                          isPrimary
                            ? 'border-primary bg-primary/5'
                            : 'border-border'
                        }`}
                      >
                        <RadioGroupItem value={product.id} id={`edit-primary-${product.id}`} />
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
                        <Label
                          htmlFor={`edit-primary-${product.id}`}
                          className="flex-1 cursor-pointer min-w-0"
                        >
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium truncate">{displayName}</span>
                            {isPrimary && (
                              <Badge variant="primary" className="text-xs shrink-0">
                                <Star className="size-3 mr-1" />
                                Primary
                              </Badge>
                            )}
                            {isNew && (
                              <Badge variant="success" appearance="light" className="text-xs shrink-0">
                                New
                              </Badge>
                            )}
                          </div>
                          <span className="text-xs text-muted-foreground">SKU: {sku}</span>
                        </Label>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveMember(product.id)}
                          disabled={!canRemoveMember}
                          title={
                            canRemoveMember
                              ? 'Remove from package'
                              : 'A package must have at least 2 products'
                          }
                          className="shrink-0"
                        >
                          <Trash2 className="size-4 text-muted-foreground hover:text-destructive" />
                        </Button>
                      </div>
                    );
                  })}
                </div>
              </RadioGroup>
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
                <InputWrapper className="w-full lg:w-[350px]">
                  <Search className="size-4" />
                  <Input
                    placeholder="Search ungrouped products..."
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

                {filteredAvailable.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-6">
                    No ungrouped products available to add.
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
                          onClick={() => handleAddProduct(product.id)}
                        >
                          <div className="flex items-center justify-center rounded-md bg-accent/50 h-[32px] w-[40px] shrink-0">
                            {imageUrl ? (
                              <img
                                src={imageUrl}
                                className="h-[24px] w-full object-contain"
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

          {/* Package Details */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Package Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
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
            </CardContent>
          </Card>
        </div>

        {/* Right: Preview */}
        <div className="space-y-6">
          <Card className="sticky top-6">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Package Preview</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Primary image */}
              {primaryId && (
                <div className="flex items-center justify-center bg-accent/30 rounded-lg h-[140px]">
                  {(() => {
                    const primary = allPackageProducts.find((p) => p.id === primaryId);
                    const img = primary ? getProductImage(primary) : null;
                    return img ? (
                      <img src={img} alt="Package" className="h-full object-contain p-3" />
                    ) : (
                      <Package className="size-10 text-muted-foreground" />
                    );
                  })()}
                </div>
              )}

              <div>
                <p className="text-xs text-muted-foreground">Package Name</p>
                <p className="font-semibold">
                  {primaryId
                    ? getProductDisplayName(
                        allPackageProducts.find((p) => p.id === primaryId)!
                      )
                    : '-'}
                </p>
              </div>

              <div>
                <p className="text-xs text-muted-foreground">Package Price</p>
                <p className="text-xl font-bold text-foreground">
                  {packagePrice ? `$${parseFloat(packagePrice).toFixed(2)}` : '-'}
                </p>
              </div>

              <div>
                <p className="text-xs text-muted-foreground mb-2">
                  Products ({totalMembers})
                </p>
                <div className="space-y-2">
                  {allPackageProducts.map((product) => (
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

              {/* Changes summary */}
              {hasChanges && (
                <div className="pt-3 border-t">
                  <p className="text-xs font-medium text-muted-foreground mb-1.5">Pending Changes</p>
                  <div className="space-y-1">
                    {addProductIds.size > 0 && (
                      <p className="text-xs text-green-600">
                        + {addProductIds.size} product{addProductIds.size > 1 ? 's' : ''} to add
                      </p>
                    )}
                    {removeProductIds.size > 0 && (
                      <p className="text-xs text-red-600">
                        - {removeProductIds.size} product{removeProductIds.size > 1 ? 's' : ''} to remove
                      </p>
                    )}
                    {primaryId !== currentGroup?.primaryProduct?.id && (
                      <p className="text-xs text-blue-600">Primary product changed</p>
                    )}
                  </div>
                </div>
              )}
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
