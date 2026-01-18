import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Loader2, Package, Save } from 'lucide-react';
import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Label } from '@/shared/components/ui/label';
import { Input } from '@/shared/components/ui/input';
import { Textarea } from '@/shared/components/ui/textarea';
import { Switch } from '@/shared/components/ui/switch';
import { useClubProduct, useUpdateClubProduct } from '../hooks/use-club-products';
import { useClub } from '../hooks/use-clubs';
import { ProductFormImageUpload } from '@/modules/products/components/product-form-image-upload';
import { useDocumentTitle } from '@/shared/hooks/use-document-title';
import { defaultFieldsMap } from '../services/club-products.service';
import { CustomFields } from '../types';

export function EditClubProductPage() {
  useDocumentTitle('Edit Club Product');
  const { clubId, clubProductId } = useParams<{
    clubId: string;
    clubProductId: string;
  }>();
  const navigate = useNavigate();

  // Form state
  const [customName, setCustomName] = useState<string>('');
  const [customPrice, setCustomPrice] = useState<string>('');
  const [customDescription, setCustomDescription] = useState<string>('');
  const [isActive, setIsActive] = useState(true);
  const [imageUrls, setImageUrls] = useState<string[]>([]);

  const [playerName, setPlayerName] = useState(false);
  const [playerNumber, setPlayerNumber] = useState(false);
  const [coachName, setCoachName] = useState(false);
  const [playerBirthday, setPlayerBirthday] = useState(false);

  // Fetch data
  const { data: club } = useClub(clubId);
  const { data: clubProduct, isLoading } = useClubProduct(clubId, clubProductId);
  const updateMutation = useUpdateClubProduct(clubId || '');

  // Reset form when clubProduct changes
  useEffect(() => {
    if (clubProduct) {
      setCustomName(clubProduct.name || '');
      setCustomPrice(clubProduct.price || '');
      setCustomDescription(clubProduct.description || '');
      setIsActive(clubProduct.isActive);
      setImageUrls(clubProduct.imageUrls || []);

      setPlayerName(
        !!clubProduct.customFields?.some((field) => field.key === 'playerName')
      );
      setPlayerNumber(
        !!clubProduct.customFields?.some((field) => field.key === 'playerNumber')
      );
      setCoachName(
        !!clubProduct.customFields?.some((field) => field.key === 'coachName')
      );
      setPlayerBirthday(
        !!clubProduct.customFields?.some((field) => field.key === 'playerBirthday')
      );
    }
  }, [clubProduct]);

  const handleSave = async () => {
    if (!clubProduct || !clubId) return;
    const customFields: CustomFields[] = [];
    if (playerName) {
      const playerNameField = defaultFieldsMap.get('playerName');
      if (playerNameField) {
        (playerNameField as any).value = customName;
        customFields.push(playerNameField);
      }
    }
    if (playerNumber) {
      const playerNumberField = defaultFieldsMap.get('playerNumber');
      if (playerNumberField) {
        (playerNumberField as any).value = customName;
        customFields.push(playerNumberField);
      }
    }
    if (coachName) {
      const coachNameField = defaultFieldsMap.get('coachName');
      if (coachNameField) {
        (coachNameField as any).value = customName;
        customFields.push(coachNameField);
      }
    }
    if (playerBirthday) {
      const playerBirthdayField = defaultFieldsMap.get('playerBirthday');
      if (playerBirthdayField) {
        (playerBirthdayField as any).value = customName;
        customFields.push(playerBirthdayField);
      }
    }

    try {
      await updateMutation.mutateAsync({
        clubProductId: clubProduct.id,
        data: {
          name: customName || undefined,
          price: customPrice || undefined,
          description: customDescription || undefined,
          customFields: customFields,
          isActive,
          imageUrls: imageUrls.length > 0 ? imageUrls : undefined,

        },
      });
      navigate(`/clubs/${clubId}`);
    } catch (error) {
      console.error('Error updating club product:', error);
    }
  };

  const handleResetName = () => {
    setCustomName('');
  };

  const handleResetPrice = () => {
    setCustomPrice('');
  };

  const handleResetDescription = () => {
    setCustomDescription('');
  };

  
  

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="size-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!clubProduct) {
    return (
      <div className="flex flex-col items-center justify-center h-screen gap-4">
        <Package className="size-12 text-muted-foreground" />
        <h2 className="text-xl font-semibold">Club product not found</h2>
        <Button onClick={() => navigate(`/clubs/${clubId}`)}>
          Back to Club
        </Button>
      </div>
    );
  }

  const baseProduct = clubProduct.product;
  const baseName = baseProduct?.name || '';
  const basePrice = baseProduct?.defaultVariant?.price;
  const baseDescription = baseProduct?.description || '';
  const baseImageUrls = baseProduct?.imageUrls || [];

  const hasCustomName = customName && customName !== baseName;
  const hasCustomPrice = !!customPrice;
  const hasCustomDescription =
    customDescription && customDescription !== baseDescription;
  const hasCustomImages =
    imageUrls.length > 0 &&
    JSON.stringify(imageUrls) !== JSON.stringify(baseImageUrls);

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(`/clubs/${clubId}`)}
          >
            <ArrowLeft className="size-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Edit Club Product</h1>
            <p className="text-sm text-muted-foreground">
              {club?.name} - {baseName}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant={isActive ? 'success' : 'secondary'}>
            {isActive ? 'Active' : 'Inactive'}
          </Badge>
          <Button
            variant="ghost"
            onClick={() => navigate(`/clubs/${clubId}`)}
          >
            Cancel
          </Button>
          <Button
            variant="mono"
            onClick={handleSave}
            disabled={updateMutation.isPending}
          >
            <Save className="size-4 mr-2" />
            {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </div>

      {/* Form Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Product Name */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                Product Name
                {hasCustomName && (
                  <Badge variant="outline">Custom</Badge>
                )}
              </CardTitle>
              {hasCustomName && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleResetName}
                  className="h-6 text-xs"
                >
                  Reset to default
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            <Input
              id="customName"
              value={customName}
              onChange={(e) => setCustomName(e.target.value)}
              placeholder={baseName}
            />
            {baseName && !hasCustomName && (
              <p className="text-xs text-muted-foreground">
                Default: {baseName}
              </p>
            )}
          </CardContent>
        </Card>

        {/* Price */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                Price
                {hasCustomPrice && (
                  <Badge variant="outline">Custom</Badge>
                )}
              </CardTitle>
              {hasCustomPrice && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleResetPrice}
                  className="h-6 text-xs"
                >
                  Reset to default
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            <Input
              id="customPrice"
              type="text"
              value={customPrice}
              onChange={(e) => setCustomPrice(e.target.value)}
              placeholder={
                basePrice !== null && basePrice !== undefined
                  ? `$${basePrice.toFixed(2)}`
                  : 'Auto-calculated from variants'
              }
            />
            <p className="text-xs text-muted-foreground">
              {!hasCustomPrice && basePrice !== null && basePrice !== undefined
                ? `Default: $${basePrice.toFixed(2)} (from base product)`
                : 'Enter a custom price or price range (e.g., "$20.00" or "$20.00 - $40.00")'}
            </p>
          </CardContent>
        </Card>

        {/* Description */}
        <Card className="md:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                Description
                {hasCustomDescription && (
                  <Badge variant="outline">Custom</Badge>
                )}
              </CardTitle>
              {hasCustomDescription && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleResetDescription}
                  className="h-6 text-xs"
                >
                  Reset to default
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            <Textarea
              id="customDescription"
              value={customDescription}
              onChange={(e) => setCustomDescription(e.target.value)}
              placeholder={baseDescription || 'No description'}
              rows={4}
            />
            {baseDescription && !hasCustomDescription && (
              <p className="text-xs text-muted-foreground line-clamp-2">
                Default: {baseDescription}
              </p>
            )}
          </CardContent>
        </Card>

        {/* Active Status */}
        <Card>
          <CardHeader>
            <CardTitle>Active Status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="isActive">Visibility</Label>
                <p className="text-xs text-muted-foreground">
                  Controls whether this product is visible for this club
                </p>
              </div>
              <Switch
                id="isActive"
                checked={isActive}
                onCheckedChange={setIsActive}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="isActive">Field Player Name</Label>
                <p className="text-xs text-muted-foreground">
                  Controls Show the field player name on the product
                </p>
              </div>
              <Switch
                id="playerName"
                checked={playerName}
                onCheckedChange={setPlayerName}
              />

              
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="isActive">Field Player Number</Label>
                <p className="text-xs text-muted-foreground">
                  Controls Show the field player number on the product
                </p>
              </div>
              <Switch
                id="playerNumber"
                checked={playerNumber}
                onCheckedChange={setPlayerNumber}
              />

          
            </div>


            <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="isActive">Field Coach Name</Label>
                  <p className="text-xs text-muted-foreground">
                    Controls Show the field coach name on the product
                  </p>
                </div>
                <Switch
                  id="coachName"
                  checked={coachName}
                  onCheckedChange={setCoachName}
                />
              </div>

            <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="isActive">Field Player Birthday</Label>
                  <p className="text-xs text-muted-foreground">
                    Controls Show the field player birthday on the product
                  </p>
                </div>
                <Switch
                  id="playerBirthday"
                  checked={playerBirthday}
                  onCheckedChange={setPlayerBirthday}
                />
              </div>
          </CardContent>
        </Card>

        {/* Base Product Info */}
        <Card>
          <CardHeader>
            <CardTitle>Base Product Info</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="text-sm font-medium text-muted-foreground">SKU</p>
              <p className="text-base">
                {baseProduct?.defaultVariant?.sku || 'N/A'}
              </p>
            </div>
            {baseProduct?.category && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Category
                </p>
                <p className="text-base">{baseProduct.category.name}</p>
              </div>
            )}
            {baseProduct?.brand && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Brand
                </p>
                <p className="text-base">{baseProduct.brand.name}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Images */}
        <Card className="md:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                Product Images
                {hasCustomImages && (
                  <Badge variant="outline">Custom</Badge>
                )}
              </CardTitle>
              {hasCustomImages && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setImageUrls(baseImageUrls)}
                  className="h-6 text-xs"
                >
                  Reset to default
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            <ProductFormImageUpload
              mode="edit"
              initialImages={imageUrls.length > 0 ? imageUrls : baseImageUrls}
              maxFiles={5}
              onAllImagesChange={(urls) => setImageUrls(urls)}
            />
            {baseImageUrls.length > 0 && !hasCustomImages && (
              <p className="text-xs text-muted-foreground">
                Using default product images ({baseImageUrls.length} image
                {baseImageUrls.length !== 1 ? 's' : ''})
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
