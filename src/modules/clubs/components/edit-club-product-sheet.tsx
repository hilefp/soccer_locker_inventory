import { useEffect, useState } from 'react';
import { ClubProduct } from '../types/club-product';
import { useUpdateClubProduct } from '../hooks/use-club-products';
import { Button } from '@/shared/components/ui/button';
import {
  Sheet,
  SheetBody,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/shared/components/ui/sheet';
import { Label } from '@/shared/components/ui/label';
import { Input } from '@/shared/components/ui/input';
import { Textarea } from '@/shared/components/ui/textarea';
import { Switch } from '@/shared/components/ui/switch';
import { ScrollArea } from '@/shared/components/ui/scroll-area';
import { Badge } from '@/shared/components/ui/badge';
import { ProductFormImageUpload } from '@/modules/products/components/product-form-image-upload';
import { TagMultiSelect } from '@/modules/tags/components/tag-multi-select';

interface EditClubProductSheetProps {
  clubId: string;
  clubProduct: ClubProduct | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditClubProductSheet({
  clubId,
  clubProduct,
  open,
  onOpenChange,
}: EditClubProductSheetProps) {
  // Form state
  const [customName, setCustomName] = useState<string>('');
  const [customPrice, setCustomPrice] = useState<string>('');
  const [customDescription, setCustomDescription] = useState<string>('');
  const [isActive, setIsActive] = useState(true);
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [tags, setTags] = useState<string[]>([]);

  const [playerName, setPlayerName] = useState(false);
  const [playerNameRequired, setPlayerNameRequired] = useState(true);
  const [playerNumber, setPlayerNumber] = useState(false);
  const [playerNumberRequired, setPlayerNumberRequired] = useState(true);
  const [coachName, setCoachName] = useState(false);
  const [coachNameRequired, setCoachNameRequired] = useState(true);
  const [playerBirthYear, setPlayerBirthday] = useState(false);
  const [playerBirthYearRequired, setPlayerBirthdayRequired] = useState(true);
  const [locationBase, setLocationBase] = useState(false);
  const [locationBaseRequired, setLocationBaseRequired] = useState(true);
  const [locationOpaLocka, setLocationOpaLocka] = useState(false);
  const [locationOpaLockaRequired, setLocationOpaLockaRequired] = useState(true);
  const [initials, setInitials] = useState(false);
  const [initialsRequired, setInitialsRequired] = useState(true);
  const [gauchito, setGauchito] = useState(false);
  const [gauchitoRequired, setGauchitoRequired] = useState(true);

  const updateMutation = useUpdateClubProduct(clubId);

  // Reset form when clubProduct changes
  useEffect(() => {
    if (clubProduct) {
      setCustomName(clubProduct.name || '');
      setCustomPrice(clubProduct.price || '');
      setCustomDescription(clubProduct.description || '');
      setIsActive(clubProduct.isActive);
      setImageUrls(clubProduct.imageUrls || []);
      setTags(clubProduct.tags || []);

      const pnField = clubProduct.customFields?.find((f) => f.key === 'playerName');
      setPlayerName(!!pnField);
      setPlayerNameRequired(pnField?.required ?? true);

      const pnumField = clubProduct.customFields?.find((f) => f.key === 'playerNumber');
      setPlayerNumber(!!pnumField);
      setPlayerNumberRequired(pnumField?.required ?? true);

      const cnField = clubProduct.customFields?.find((f) => f.key === 'coachName');
      setCoachName(!!cnField);
      setCoachNameRequired(cnField?.required ?? true);

      const pbField = clubProduct.customFields?.find((f) => f.key === 'playerBirthYear');
      setPlayerBirthday(!!pbField);
      setPlayerBirthdayRequired(pbField?.required ?? true);

      const lbField = clubProduct.customFields?.find((f) => f.key === 'locationBase');
      setLocationBase(!!lbField);
      setLocationBaseRequired(lbField?.required ?? true);

      const loField = clubProduct.customFields?.find((f) => f.key === 'locationOpaLocka');
      setLocationOpaLocka(!!loField);
      setLocationOpaLockaRequired(loField?.required ?? true);

      const initField = clubProduct.customFields?.find((f) => f.key === 'initials');
      setInitials(!!initField);
      setInitialsRequired(initField?.required ?? true);

      const gauchitoField = clubProduct.customFields?.find((f) => f.key === 'gauchito');
      setGauchito(!!gauchitoField);
      setGauchitoRequired(gauchitoField?.required ?? true);
    }
  }, [clubProduct]);

  const handleSave = async () => {
    if (!clubProduct) return;

    const defaultFieldKeys: { key: string; required: boolean }[] = [];
    if (playerName) defaultFieldKeys.push({ key: 'playerName', required: playerNameRequired });
    if (playerNumber) defaultFieldKeys.push({ key: 'playerNumber', required: playerNumberRequired });
    if (coachName) defaultFieldKeys.push({ key: 'coachName', required: coachNameRequired });
    if (playerBirthYear) defaultFieldKeys.push({ key: 'playerBirthYear', required: playerBirthYearRequired });
    if (locationBase) defaultFieldKeys.push({ key: 'locationBase', required: locationBaseRequired });
    if (locationOpaLocka) defaultFieldKeys.push({ key: 'locationOpaLocka', required: locationOpaLockaRequired });
    if (initials) defaultFieldKeys.push({ key: 'initials', required: initialsRequired });
    if (gauchito) defaultFieldKeys.push({ key: 'gauchito', required: gauchitoRequired });

    try {
      await updateMutation.mutateAsync({
        clubProductId: clubProduct.id,
        data: {
          name: customName || undefined,
          price: customPrice || undefined,
          description: customDescription || undefined,
          defaultFieldKeys,
          isActive,
          imageUrls: imageUrls.length > 0 ? imageUrls : undefined,
          tags,
        },
      });
      onOpenChange(false);
    } catch (error) {
      console.error('Error updating club product:', error);
    }
  };

  const handleClose = () => {
    onOpenChange(false);
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

  if (!clubProduct) return null;

  const baseProduct = clubProduct.product;
  const baseName = baseProduct?.name || '';
  const basePrice = baseProduct?.defaultVariant?.price;
  const baseDescription = baseProduct?.description || '';
  const baseImageUrls = baseProduct?.imageUrls || [];

  const hasCustomName = customName && customName !== baseName;
  const hasCustomPrice = !!customPrice;
  const hasCustomDescription =
    customDescription && customDescription !== baseDescription;
  const hasCustomImages = imageUrls.length > 0 && JSON.stringify(imageUrls) !== JSON.stringify(baseImageUrls);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-[500px]">
        <SheetHeader>
          <SheetTitle>Edit Club Product</SheetTitle>
        </SheetHeader>
        <SheetBody>
          <ScrollArea className="h-[calc(100vh-180px)]">
            <div className="space-y-6 pr-4">
              {/* Product Name */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="customName">
                    Product Name
                    {hasCustomName && (
                      <Badge variant="outline" className="ml-2">
                        Custom
                      </Badge>
                    )}
                  </Label>
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
              </div>

              {/* Price */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="customPrice">
                    Price
                    {hasCustomPrice && (
                      <Badge variant="outline" className="ml-2">
                        Custom
                      </Badge>
                    )}
                  </Label>
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
                <Input
                  id="customPrice"
                  type="text"
                  value={customPrice}
                  onChange={(e) => setCustomPrice(e.target.value)}
                  placeholder={basePrice !== null && basePrice !== undefined ? `$${basePrice.toFixed(2)}` : 'Auto-calculated from variants'}
                />
                <p className="text-xs text-muted-foreground">
                  {!hasCustomPrice && basePrice !== null && basePrice !== undefined
                    ? `Default: $${basePrice.toFixed(2)} (from base product)`
                    : 'Enter a custom price or price range (e.g., "$20.00" or "$20.00 - $40.00")'}
                </p>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="customDescription">
                    Description
                    {hasCustomDescription && (
                      <Badge variant="outline" className="ml-2">
                        Custom
                      </Badge>
                    )}
                  </Label>
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
              </div>

              {/* Tags */}
              <div className="space-y-2">
                <Label>Tags</Label>
                <TagMultiSelect selectedTags={tags} onTagsChange={setTags} />
                <p className="text-xs text-muted-foreground">
                  Tags are used as filter tabs in the club shop
                </p>
              </div>

              {/* Active Status */}
              <div className="space-y-4">
                <Label className="text-base font-semibold">Active Status</Label>

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

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="sheetPlayerName">Field Player Name</Label>
                      <p className="text-xs text-muted-foreground">
                        Controls Show the field player name on the product
                      </p>
                    </div>
                    <Switch
                      id="sheetPlayerName"
                      checked={playerName}
                      onCheckedChange={setPlayerName}
                    />
                  </div>
                  {playerName && (
                    <div className="flex items-center justify-between pl-4 py-2 pr-2 ml-2 rounded-md bg-muted/50 border-l-2 border-primary/30">
                      <div className="space-y-0.5">
                        <Label htmlFor="sheetPlayerNameReq" className="text-sm font-medium text-primary/80">Required</Label>
                        <p className="text-xs text-muted-foreground">
                          {playerNameRequired ? 'Customer must fill this field' : 'Optional for the customer'}
                        </p>
                      </div>
                      <Switch
                        id="sheetPlayerNameReq"
                        checked={playerNameRequired}
                        onCheckedChange={setPlayerNameRequired}
                      />
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="sheetPlayerNumber">Field Player Number</Label>
                      <p className="text-xs text-muted-foreground">
                        Controls Show the field player number on the product
                      </p>
                    </div>
                    <Switch
                      id="sheetPlayerNumber"
                      checked={playerNumber}
                      onCheckedChange={setPlayerNumber}
                    />
                  </div>
                  {playerNumber && (
                    <div className="flex items-center justify-between pl-4 py-2 pr-2 ml-2 rounded-md bg-muted/50 border-l-2 border-primary/30">
                      <div className="space-y-0.5">
                        <Label htmlFor="sheetPlayerNumberReq" className="text-sm font-medium text-primary/80">Required</Label>
                        <p className="text-xs text-muted-foreground">
                          {playerNumberRequired ? 'Customer must fill this field' : 'Optional for the customer'}
                        </p>
                      </div>
                      <Switch
                        id="sheetPlayerNumberReq"
                        checked={playerNumberRequired}
                        onCheckedChange={setPlayerNumberRequired}
                      />
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="sheetCoachName">Field Coach Name</Label>
                      <p className="text-xs text-muted-foreground">
                        Controls Show the field coach name on the product
                      </p>
                    </div>
                    <Switch
                      id="sheetCoachName"
                      checked={coachName}
                      onCheckedChange={setCoachName}
                    />
                  </div>
                  {coachName && (
                    <div className="flex items-center justify-between pl-4 py-2 pr-2 ml-2 rounded-md bg-muted/50 border-l-2 border-primary/30">
                      <div className="space-y-0.5">
                        <Label htmlFor="sheetCoachNameReq" className="text-sm font-medium text-primary/80">Required</Label>
                        <p className="text-xs text-muted-foreground">
                          {coachNameRequired ? 'Customer must fill this field' : 'Optional for the customer'}
                        </p>
                      </div>
                      <Switch
                        id="sheetCoachNameReq"
                        checked={coachNameRequired}
                        onCheckedChange={setCoachNameRequired}
                      />
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="sheetPlayerBirthYear">Field Player Birth Year</Label>
                      <p className="text-xs text-muted-foreground">
                        Controls Show the field player birth year on the product
                      </p>
                    </div>
                    <Switch
                      id="sheetPlayerBirthYear"
                      checked={playerBirthYear}
                      onCheckedChange={setPlayerBirthday}
                    />
                  </div>
                  {playerBirthYear && (
                    <div className="flex items-center justify-between pl-4 py-2 pr-2 ml-2 rounded-md bg-muted/50 border-l-2 border-primary/30">
                      <div className="space-y-0.5">
                        <Label htmlFor="sheetPlayerBirthYearReq" className="text-sm font-medium text-primary/80">Required</Label>
                        <p className="text-xs text-muted-foreground">
                          {playerBirthYearRequired ? 'Customer must fill this field' : 'Optional for the customer'}
                        </p>
                      </div>
                      <Switch
                        id="sheetPlayerBirthYearReq"
                        checked={playerBirthYearRequired}
                        onCheckedChange={setPlayerBirthdayRequired}
                      />
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="sheetLocationBase">Location (Base/Miami)</Label>
                      <p className="text-xs text-muted-foreground">
                        Show a location dropdown with BASE/MIAMI as default
                      </p>
                    </div>
                    <Switch
                      id="sheetLocationBase"
                      checked={locationBase}
                      onCheckedChange={setLocationBase}
                    />
                  </div>
                  {locationBase && (
                    <div className="flex items-center justify-between pl-4 py-2 pr-2 ml-2 rounded-md bg-muted/50 border-l-2 border-primary/30">
                      <div className="space-y-0.5">
                        <Label htmlFor="sheetLocationBaseReq" className="text-sm font-medium text-primary/80">Required</Label>
                        <p className="text-xs text-muted-foreground">
                          {locationBaseRequired ? 'Customer must fill this field' : 'Optional for the customer'}
                        </p>
                      </div>
                      <Switch
                        id="sheetLocationBaseReq"
                        checked={locationBaseRequired}
                        onCheckedChange={setLocationBaseRequired}
                      />
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="sheetLocationOpaLocka">Location (Opa-Locka)</Label>
                      <p className="text-xs text-muted-foreground">
                        Show a location dropdown with OPA-LOCKA as default
                      </p>
                    </div>
                    <Switch
                      id="sheetLocationOpaLocka"
                      checked={locationOpaLocka}
                      onCheckedChange={setLocationOpaLocka}
                    />
                  </div>
                  {locationOpaLocka && (
                    <div className="flex items-center justify-between pl-4 py-2 pr-2 ml-2 rounded-md bg-muted/50 border-l-2 border-primary/30">
                      <div className="space-y-0.5">
                        <Label htmlFor="sheetLocationOpaLockaReq" className="text-sm font-medium text-primary/80">Required</Label>
                        <p className="text-xs text-muted-foreground">
                          {locationOpaLockaRequired ? 'Customer must fill this field' : 'Optional for the customer'}
                        </p>
                      </div>
                      <Switch
                        id="sheetLocationOpaLockaReq"
                        checked={locationOpaLockaRequired}
                        onCheckedChange={setLocationOpaLockaRequired}
                      />
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="sheetInitials">Initials</Label>
                      <p className="text-xs text-muted-foreground">
                        Controls Show the initials input on the product
                      </p>
                    </div>
                    <Switch
                      id="sheetInitials"
                      checked={initials}
                      onCheckedChange={setInitials}
                    />
                  </div>
                  {initials && (
                    <div className="flex items-center justify-between pl-4 py-2 pr-2 ml-2 rounded-md bg-muted/50 border-l-2 border-primary/30">
                      <div className="space-y-0.5">
                        <Label htmlFor="sheetInitialsReq" className="text-sm font-medium text-primary/80">Required</Label>
                        <p className="text-xs text-muted-foreground">
                          {initialsRequired ? 'Customer must fill this field' : 'Optional for the customer'}
                        </p>
                      </div>
                      <Switch
                        id="sheetInitialsReq"
                        checked={initialsRequired}
                        onCheckedChange={setInitialsRequired}
                      />
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="sheetGauchito">Gauchito</Label>
                      <p className="text-xs text-muted-foreground">
                        Show a dropdown to select Gauchito or Gauchita
                      </p>
                    </div>
                    <Switch
                      id="sheetGauchito"
                      checked={gauchito}
                      onCheckedChange={setGauchito}
                    />
                  </div>
                  {gauchito && (
                    <div className="flex items-center justify-between pl-4 py-2 pr-2 ml-2 rounded-md bg-muted/50 border-l-2 border-primary/30">
                      <div className="space-y-0.5">
                        <Label htmlFor="sheetGauchitoReq" className="text-sm font-medium text-primary/80">Required</Label>
                        <p className="text-xs text-muted-foreground">
                          {gauchitoRequired ? 'Customer must fill this field' : 'Optional for the customer'}
                        </p>
                      </div>
                      <Switch
                        id="sheetGauchitoReq"
                        checked={gauchitoRequired}
                        onCheckedChange={setGauchitoRequired}
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Images */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>
                    Product Images
                    {hasCustomImages && (
                      <Badge variant="outline" className="ml-2">
                        Custom
                      </Badge>
                    )}
                  </Label>
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
                <ProductFormImageUpload
                  mode="edit"
                  initialImages={imageUrls.length > 0 ? imageUrls : baseImageUrls}
                  maxFiles={5}
                  onAllImagesChange={(urls) => setImageUrls(urls)}
                />
                {baseImageUrls.length > 0 && !hasCustomImages && (
                  <p className="text-xs text-muted-foreground">
                    Using default product images ({baseImageUrls.length} image{baseImageUrls.length !== 1 ? 's' : ''})
                  </p>
                )}
              </div>

              {/* Product Info */}
              <div className="pt-4 border-t">
                <h4 className="text-sm font-medium mb-2">Base Product Info</h4>
                <div className="space-y-1 text-xs text-muted-foreground">
                  <p>
                    <span className="font-medium">SKU:</span>{' '}
                    {baseProduct?.defaultVariant?.sku || 'N/A'}
                  </p>
                  {baseProduct?.category && (
                    <p>
                      <span className="font-medium">Category:</span>{' '}
                      {baseProduct.category.name}
                    </p>
                  )}
                  {baseProduct?.brand && (
                    <p>
                      <span className="font-medium">Brand:</span>{' '}
                      {baseProduct.brand.name}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </ScrollArea>
        </SheetBody>
        <SheetFooter>
          <Button variant="ghost" onClick={handleClose}>
            Cancel
          </Button>
          <Button
            variant="mono"
            onClick={handleSave}
            disabled={updateMutation.isPending}
          >
            {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
