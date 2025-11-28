'use client';

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CheckCircle,
  ExternalLink,
  Pencil,
  Loader2,
  Settings,
  Sparkles,
  Trash2,
} from 'lucide-react';
import { toast } from 'sonner';
import { Alert, AlertIcon, AlertTitle } from '@/shared/components/ui/alert';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Checkbox } from '@/shared/components/ui/checkbox';
import { Input, InputWrapper } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Switch } from '@/shared/components/ui/switch';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/components/ui/tabs';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/shared/components/ui/sheet';
import { ProductVariant, ProductVariantRequest } from '@/modules/products/types/product.type';
import { useProductAttributes } from '@/modules/products/hooks/use-product-attributes';
import { productService } from '@/modules/products/services/product.service';

interface ProductFormVariantsProps {
  mode?: 'new' | 'edit';
  productId?: string | null; // Product ID for generating variations
  variants?: ProductVariant[];
  onVariantsChange?: (variants: ProductVariant[]) => void;
}

export function ProductFormVariants({
  productId,
  variants: externalVariants = [],
  onVariantsChange
}: ProductFormVariantsProps) {
  const navigate = useNavigate();
  // Use external variants directly - no local state for variants data
  const variants = externalVariants;
  const [activeTab, setActiveTab] = useState('list');
  const [selectedAttributeIds, setSelectedAttributeIds] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [editingVariant, setEditingVariant] = useState<ProductVariant | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  // Fetch attributes
  const { data: attributes = [], isLoading: attributesLoading } = useProductAttributes();

  const toggleAttributeSelection = (attributeId: string) => {
    setSelectedAttributeIds((prev) =>
      prev.includes(attributeId)
        ? prev.filter((id) => id !== attributeId)
        : [...prev, attributeId]
    );
  };

  const handleGenerateVariations = async () => {
    if (!productId) {
      toast.error('Product ID is required to generate variations');
      return;
    }

    if (selectedAttributeIds.length === 0) {
      toast.error('Please select at least one attribute');
      return;
    }

    setIsGenerating(true);

    try {
      const response = await productService.generateVariations({
        productId,
        attributeIds: selectedAttributeIds,
      });

      if (response.success && response.variants) {
        onVariantsChange?.(response.variants);

        toast.custom(
          (t) => (
            <Alert
              variant="mono"
              icon="success"
              close={true}
              onClose={() => toast.dismiss(t)}
            >
              <AlertIcon>
                <CheckCircle />
              </AlertIcon>
              <AlertTitle>
                {response.variants.length} variations generated successfully
              </AlertTitle>
            </Alert>
          ),
          {
            duration: 5000,
          }
        );

        setActiveTab('list');
        setSelectedAttributeIds([]);
      }
    } catch (error) {
      console.error('Error generating variations:', error);
      toast.error('Failed to generate variations');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleEditVariant = (variant: ProductVariant) => {
    setEditingVariant(variant);
  };

  const handleSaveVariant = async () => {
    if (!editingVariant || !editingVariant.id) return;

    setIsSaving(true);

    try {
      // Prepare variant data for API (convert ProductVariant to ProductVariantRequest)
      const variantData: ProductVariantRequest = {
        sku: editingVariant.sku,
        barcode: editingVariant.barcode,
        attributes: editingVariant.attributes,
        price: editingVariant.price,
        compareAtPrice: editingVariant.compareAtPrice,
        cost: editingVariant.cost,
        weight: editingVariant.weight,
        weightUnit: editingVariant.weightUnit,
        dimensions: editingVariant.dimensions,
        dimensionUnit: editingVariant.dimensionUnit,
        imageUrl: editingVariant.imageUrl,
        imageUrls: editingVariant.imageUrls,
        isActive: editingVariant.isActive,
      };

      // Call API to update variant
      const updatedVariant = await productService.updateVariant(
        editingVariant.id,
        variantData
      );

      // Update local state with the response from server
      const updatedVariants = variants.map((v) =>
        v.id === editingVariant.id ? updatedVariant : v
      );
      onVariantsChange?.(updatedVariants);

      toast.custom(
        (t) => (
          <Alert variant="mono" icon="success" onClose={() => toast.dismiss(t)}>
            <AlertIcon>
              <CheckCircle />
            </AlertIcon>
            <AlertTitle>Variant updated successfully</AlertTitle>
          </Alert>
        ),
        {
          duration: 5000,
        },
      );

      setEditingVariant(null);
    } catch (error) {
      console.error('Error updating variant:', error);
      toast.error('Failed to update variant');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancelEdit = () => {
    setEditingVariant(null);
  };

  const handleDeleteVariant = async (id: string) => {
    if (!id) return;

    setIsDeleting(id);

    try {
      // Call API to delete variant
      await productService.deleteVariant(id);

      // Update local state
      onVariantsChange?.(variants.filter((variant) => variant.id !== id));

      toast.custom(
        (t) => (
          <Alert variant="mono" icon="success" onClose={() => toast.dismiss(t)}>
            <AlertIcon>
              <CheckCircle />
            </AlertIcon>
            <AlertTitle>Variant deleted successfully</AlertTitle>
          </Alert>
        ),
        {
          duration: 5000,
        },
      );
    } catch (error) {
      console.error('Error deleting variant:', error);
      toast.error('Failed to delete variant');
    } finally {
      setIsDeleting(null);
    }
  };

  return (
    <div className="space-y-5">
      {/* Variants */}
      <Card className="rounded-md">
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="w-full p-0"
        >
          <CardHeader className="min-h-[40px] bg-accent/50">
            <CardTitle className="text-sm">Variants</CardTitle>
            <TabsList
              size="xs"
              className="flex gap-3.5 border-none"
              variant="line"
            >
              <TabsTrigger
                value="list"
                className="flex-1 pb-3 -mb-1.5 data-[state=active]:text-foreground text-muted-foreground data-[state=active]:border-foreground border-b-[1px] hover:text-inherit"
              >
                Variants ({variants.length})
              </TabsTrigger>
              <TabsTrigger
                value="generate"
                className="flex-1 pb-3 -mb-1.5 gap-2 data-[state=active]:text-foreground text-muted-foreground data-[state=active]:border-foreground border-b-[1px] hover:text-inherit"
              >
                <Sparkles className="size-3.5" />
                Generate
              </TabsTrigger>
              <Settings className="size-4 -me-px text-muted-foreground" />
            </TabsList>
          </CardHeader>

          <CardContent className="p-0 m-0">
            <TabsContent value="list" className="p-0 m-0 flex flex-col">
              {variants.length === 0 ? (
                <div className="p-10">
                  <h3 className="text-foreground font-medium leading-7">
                    No variants to display
                  </h3>
                  <span className="text-xs font-normal text-secondary-foreground">
                    Generate product variations using attributes
                  </span>
                  <div className="mt-3.5">
                    <Button
                      size="sm"
                      variant="mono"
                      onClick={() => setActiveTab('generate')}
                      disabled={!productId}
                    >
                      <Sparkles className="mr-2 size-4" />
                      Generate Variations
                    </Button>
                  </div>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow className="text-secondary-foreground font-normal border-border/60 text-2sm">
                      <TableHead className="min-w-[100px] h-8.5 border-e border-border/60 ps-5">
                        SKU
                      </TableHead>
                      <TableHead className="min-w-[120px] h-8.5 border-e border-border/60">
                        Attributes
                      </TableHead>
                      <TableHead className="min-w-[80px] w-[100px] h-8.5 border-e border-border/60">
                        Price
                      </TableHead>
                      <TableHead className="min-w-[80px] w-[100px] h-8.5 border-e border-border/60">
                        Compare At
                      </TableHead>
                      <TableHead className="min-w-[80px] w-[100px] h-8.5 border-e border-border/60">
                        Cost
                      </TableHead>
                      <TableHead className="min-w-[80px] w-[100px] h-8.5 border-e border-border/60">
                        Status
                      </TableHead>
                      <TableHead className="w-[100px] h-8.5">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {variants.map((variant, index) => (
                      <TableRow
                        key={variant.id}
                        className={`text-secondary-foreground font-normal border-0 text-2sm ${index % 2 === 0 ? 'bg-accent/50' : ''}`}
                      >
                        <TableCell className="py-1 border-e border-border/60 ps-5">
                          <span className="font-medium text-foreground">
                            {variant.sku}
                          </span>
                          {variant.barcode && (
                            <span className="block text-xs text-muted-foreground">
                              {variant.barcode}
                            </span>
                          )}
                        </TableCell>
                        <TableCell className="py-1 border-e border-border/60">
                          <div className="flex flex-wrap gap-1">
                            {Object.entries(variant.attributes).map(([key, value]) => (
                              <span
                                key={key}
                                className="px-2 py-0.5 text-xs rounded-full bg-accent text-foreground"
                              >
                                {key}: {value}
                              </span>
                            ))}
                          </div>
                        </TableCell>
                        <TableCell className="py-1 border-e border-border/60">
                          <span className="font-medium">${variant.price}</span>
                        </TableCell>
                        <TableCell className="py-1 border-e border-border/60">
                          {variant.compareAtPrice ? (
                            <span className="text-muted-foreground line-through">
                              ${variant.compareAtPrice}
                            </span>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </TableCell>
                        <TableCell className="py-1 border-e border-border/60">
                          {variant.cost ? (
                            <span>${variant.cost}</span>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </TableCell>
                        <TableCell className="py-1 border-e border-border/60">
                          <span
                            className={`px-2 py-1 rounded-full text-xs ${
                              variant.isActive !== false
                                ? 'bg-green-100 text-green-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}
                          >
                            {variant.isActive !== false ? 'Active' : 'Inactive'}
                          </span>
                        </TableCell>
                        <TableCell className="py-1 text-center">
                          <div className="flex items-center justify-center gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => navigate(`/products/${productId}/variants/${variant.id}`)}
                              title="View variant details"
                              disabled={isDeleting === variant.id}
                            >
                              <ExternalLink className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEditVariant(variant)}
                              title="Quick edit variant"
                              disabled={isDeleting === variant.id}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteVariant(variant.id!)}
                              title="Delete variant"
                              disabled={isDeleting === variant.id}
                            >
                              {isDeleting === variant.id ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <Trash2 className="h-4 w-4" />
                              )}
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </TabsContent>

            {/* Generate Variations Tab */}
            <TabsContent value="generate" className="m-0 p-5 space-y-5">
              <div>
                <h3 className="text-sm font-semibold text-foreground mb-1">
                  Generate Variations Automatically
                </h3>
                <p className="text-xs text-muted-foreground mb-4">
                  Select the attributes you want to use to generate product variations.
                  All combinations will be created automatically.
                </p>

                {attributesLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="size-6 animate-spin text-muted-foreground" />
                  </div>
                ) : attributes.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-sm text-muted-foreground">
                      No attributes available. Create attributes first to generate variations.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {attributes.map((attribute) => (
                      <div
                        key={attribute.id}
                        className="flex items-start space-x-3 p-3 rounded-md border border-border hover:bg-accent/50 transition-colors"
                      >
                        <Checkbox
                          id={attribute.id}
                          checked={selectedAttributeIds.includes(attribute.id)}
                          onCheckedChange={() => toggleAttributeSelection(attribute.id)}
                        />
                        <div className="flex-1 space-y-1">
                          <Label
                            htmlFor={attribute.id}
                            className="text-sm font-medium cursor-pointer"
                          >
                            {attribute.name}
                          </Label>
                          {attribute.description && (
                            <p className="text-xs text-muted-foreground">
                              {attribute.description}
                            </p>
                          )}
                          <div className="flex flex-wrap gap-1.5 mt-2">
                            {attribute.values.map((value, index) => (
                              <span
                                key={index}
                                className="px-2 py-0.5 text-xs rounded-full bg-accent text-foreground"
                              >
                                {value}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t">
                <Button
                  variant="outline"
                  onClick={() => {
                    setSelectedAttributeIds([]);
                    setActiveTab('list');
                  }}
                  disabled={isGenerating}
                >
                  Cancel
                </Button>
                <Button
                  variant="mono"
                  onClick={handleGenerateVariations}
                  disabled={isGenerating || selectedAttributeIds.length === 0}
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="mr-2 size-4 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="mr-2 size-4" />
                      Generate {selectedAttributeIds.length > 0 && `(${selectedAttributeIds.length} attributes)`}
                    </>
                  )}
                </Button>
              </div>
            </TabsContent>
          </CardContent>
        </Tabs>
      </Card>

      {/* Edit Variant Sheet Modal */}
      <Sheet open={!!editingVariant} onOpenChange={(open) => !open && handleCancelEdit()}>
        <SheetContent className="overflow-y-auto sm:max-w-2xl">
          {editingVariant && (
            <>
              <SheetHeader>
                <SheetTitle>Edit Variant</SheetTitle>
                <SheetDescription>
                  Update the variant details below. Click save when you're done.
                </SheetDescription>
              </SheetHeader>

              <div className="mt-6 space-y-4">
                    {/* SKU and Barcode */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="sku" className="text-xs">
                          SKU *
                        </Label>
                        <Input
                          id="sku"
                          value={editingVariant.sku}
                          onChange={(e) =>
                            setEditingVariant({
                              ...editingVariant,
                              sku: e.target.value,
                            })
                          }
                          placeholder="Enter SKU"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="barcode" className="text-xs">
                          Barcode
                        </Label>
                        <Input
                          id="barcode"
                          value={editingVariant.barcode || ''}
                          onChange={(e) =>
                            setEditingVariant({
                              ...editingVariant,
                              barcode: e.target.value,
                            })
                          }
                          placeholder="Enter barcode"
                        />
                      </div>
                    </div>

                    {/* Pricing */}
                    <div className="grid grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="price" className="text-xs">
                          Price *
                        </Label>
                        <InputWrapper>
                          <span className="text-xs text-muted-foreground">$</span>
                          <Input
                            id="price"
                            type="number"
                            step="0.01"
                            value={editingVariant.price}
                            onChange={(e) =>
                              setEditingVariant({
                                ...editingVariant,
                                price: parseFloat(e.target.value) || 0,
                              })
                            }
                            placeholder="0.00"
                          />
                        </InputWrapper>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="compareAtPrice" className="text-xs">
                          Compare At Price
                        </Label>
                        <InputWrapper>
                          <span className="text-xs text-muted-foreground">$</span>
                          <Input
                            id="compareAtPrice"
                            type="number"
                            step="0.01"
                            value={editingVariant.compareAtPrice || ''}
                            onChange={(e) =>
                              setEditingVariant({
                                ...editingVariant,
                                compareAtPrice: e.target.value
                                  ? parseFloat(e.target.value)
                                  : undefined,
                              })
                            }
                            placeholder="0.00"
                          />
                        </InputWrapper>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="cost" className="text-xs">
                          Cost
                        </Label>
                        <InputWrapper>
                          <span className="text-xs text-muted-foreground">$</span>
                          <Input
                            id="cost"
                            type="number"
                            step="0.01"
                            value={editingVariant.cost || ''}
                            onChange={(e) =>
                              setEditingVariant({
                                ...editingVariant,
                                cost: e.target.value
                                  ? parseFloat(e.target.value)
                                  : undefined,
                              })
                            }
                            placeholder="0.00"
                          />
                        </InputWrapper>
                      </div>
                    </div>

                    {/* Weight and Dimensions */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="weight" className="text-xs">
                          Weight
                        </Label>
                        <div className="flex gap-2">
                          <Input
                            id="weight"
                            type="number"
                            step="0.01"
                            value={editingVariant.weight || ''}
                            onChange={(e) =>
                              setEditingVariant({
                                ...editingVariant,
                                weight: e.target.value
                                  ? parseFloat(e.target.value)
                                  : undefined,
                              })
                            }
                            placeholder="0.00"
                            className="flex-1"
                          />
                          <Input
                            value={editingVariant.weightUnit || 'kg'}
                            onChange={(e) =>
                              setEditingVariant({
                                ...editingVariant,
                                weightUnit: e.target.value,
                              })
                            }
                            placeholder="kg"
                            className="w-20"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label className="text-xs">Dimensions</Label>
                        <div className="flex gap-2">
                          <Input
                            type="number"
                            step="0.01"
                            value={editingVariant.dimensions?.length || ''}
                            onChange={(e) =>
                              setEditingVariant({
                                ...editingVariant,
                                dimensions: {
                                  ...editingVariant.dimensions,
                                  length: e.target.value
                                    ? parseFloat(e.target.value)
                                    : undefined,
                                },
                              })
                            }
                            placeholder="L"
                            className="flex-1"
                          />
                          <Input
                            type="number"
                            step="0.01"
                            value={editingVariant.dimensions?.width || ''}
                            onChange={(e) =>
                              setEditingVariant({
                                ...editingVariant,
                                dimensions: {
                                  ...editingVariant.dimensions,
                                  width: e.target.value
                                    ? parseFloat(e.target.value)
                                    : undefined,
                                },
                              })
                            }
                            placeholder="W"
                            className="flex-1"
                          />
                          <Input
                            type="number"
                            step="0.01"
                            value={editingVariant.dimensions?.height || ''}
                            onChange={(e) =>
                              setEditingVariant({
                                ...editingVariant,
                                dimensions: {
                                  ...editingVariant.dimensions,
                                  height: e.target.value
                                    ? parseFloat(e.target.value)
                                    : undefined,
                                },
                              })
                            }
                            placeholder="H"
                            className="flex-1"
                          />
                          <Input
                            value={editingVariant.dimensionUnit || 'cm'}
                            onChange={(e) =>
                              setEditingVariant({
                                ...editingVariant,
                                dimensionUnit: e.target.value,
                              })
                            }
                            placeholder="cm"
                            className="w-16"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Image URL */}
                    <div className="space-y-2">
                      <Label htmlFor="imageUrl" className="text-xs">
                        Image URL
                      </Label>
                      <Input
                        id="imageUrl"
                        value={editingVariant.imageUrl || ''}
                        onChange={(e) =>
                          setEditingVariant({
                            ...editingVariant,
                            imageUrl: e.target.value,
                          })
                        }
                        placeholder="https://example.com/image.jpg"
                      />
                    </div>

                    {/* Active Status */}
                    <div className="flex items-center justify-between p-3 rounded-md border border-border">
                      <div className="space-y-0.5">
                        <Label htmlFor="isActive" className="text-sm font-medium">
                          Active Status
                        </Label>
                        <p className="text-xs text-muted-foreground">
                          Enable or disable this variant
                        </p>
                      </div>
                      <Switch
                        id="isActive"
                        checked={editingVariant.isActive !== false}
                        onCheckedChange={(checked) =>
                          setEditingVariant({
                            ...editingVariant,
                            isActive: checked,
                          })
                        }
                      />
                    </div>

                    {/* Attributes (Read-only) */}
                    <div className="space-y-2">
                      <Label className="text-xs">Attributes</Label>
                      <div className="flex flex-wrap gap-2 p-3 rounded-md border border-border bg-accent/20">
                        {Object.entries(editingVariant.attributes).map(([key, value]) => (
                          <span
                            key={key}
                            className="px-2 py-1 text-xs rounded-full bg-accent text-foreground"
                          >
                            {key}: {value}
                          </span>
                        ))}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Attributes cannot be edited. Delete and regenerate the variant to change attributes.
                      </p>
                    </div>

                <div className="flex items-center justify-end gap-2 pt-5 mt-5 border-t">
                  <Button
                    variant="outline"
                    onClick={handleCancelEdit}
                    disabled={isSaving}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="mono"
                    onClick={handleSaveVariant}
                    disabled={isSaving}
                  >
                    {isSaving ? (
                      <>
                        <Loader2 className="mr-2 size-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      'Save Changes'
                    )}
                  </Button>
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
