'use client';

import { useState } from 'react';
import {
  CheckCircle,
  ClipboardPenLine,
  DollarSign,
  Loader2,
  Plus,
  Settings,
  Sparkles,
  Trash2,
  Package,
} from 'lucide-react';
import { toast } from 'sonner';
import { Alert, AlertIcon, AlertTitle } from '@/shared/components/ui/alert';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Input, InputWrapper } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Switch } from '@/shared/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/components/ui/tabs';
import { Checkbox } from '@/shared/components/ui/checkbox';
import { ProductVariantRequest, ProductVariantAttributes } from '@/modules/products/types/product.type';
import { useProductAttributes } from '@/modules/products/hooks/use-product-attributes';

interface Variant extends ProductVariantRequest {
  id?: string;
  displayAttributes?: string; // For display purposes
}

interface ProductFormVariantsProps {
  mode: 'new' | 'edit';
  variants: Variant[];
  onVariantsChange: (variants: Variant[]) => void;
}

export function ProductFormVariantsNew({ mode, variants, onVariantsChange }: ProductFormVariantsProps) {
  // Fetch available attributes from the system
  const { data: availableAttributes = [], isLoading: attributesLoading } = useProductAttributes();

  const [activeTab, setActiveTab] = useState('list');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [selectedAttributeIds, setSelectedAttributeIds] = useState<string[]>([]);
  const [newVariant, setNewVariant] = useState<Omit<Variant, 'id'>>({
    sku: '',
    attributes: {},
    price: 0,
    compareAtPrice: undefined,
    cost: undefined,
    weight: undefined,
    weightUnit: 'kg',
    dimensions: undefined,
    dimensionUnit: 'cm',
    imageUrl: '',
    imageUrls: [],
    isActive: true,
  });

  // Helper to format attributes for display
  const formatAttributesDisplay = (attributes: ProductVariantAttributes): string => {
    return Object.entries(attributes)
      .map(([key, value]) => `${key}: ${value}`)
      .join(', ');
  };

  const resetForm = () => {
    setNewVariant({
      sku: '',
      attributes: {},
      price: 0,
      compareAtPrice: undefined,
      cost: undefined,
      weight: undefined,
      weightUnit: 'kg',
      dimensions: undefined,
      dimensionUnit: 'cm',
      imageUrl: '',
      imageUrls: [],
      isActive: true,
    });
    setEditingId(null);
  };

  const handleAddVariant = () => {
    // Validation
    if (!newVariant.sku || !newVariant.price || Object.keys(newVariant.attributes).length === 0) {
      toast.error('Please fill in SKU, Price, and at least one attribute');
      return;
    }

    const variantWithDisplay = {
      ...newVariant,
      displayAttributes: formatAttributesDisplay(newVariant.attributes),
    };

    if (editingId) {
      // Update existing variant
      const updatedVariants = variants.map((v) =>
        v.id === editingId ? { ...v, ...variantWithDisplay } : v
      );
      onVariantsChange(updatedVariants);

      toast.custom(
        (t) => (
          <Alert variant="mono" icon="success" onClose={() => toast.dismiss(t)}>
            <AlertIcon>
              <CheckCircle />
            </AlertIcon>
            <AlertTitle>Variant updated successfully</AlertTitle>
          </Alert>
        ),
        { duration: 5000 }
      );
    } else {
      // Add new variant
      const variant: Variant = {
        id: Date.now().toString(),
        ...variantWithDisplay,
      };
      onVariantsChange([...variants, variant]);

      toast.custom(
        (t) => (
          <Alert variant="mono" icon="success" onClose={() => toast.dismiss(t)}>
            <AlertIcon>
              <CheckCircle />
            </AlertIcon>
            <AlertTitle>Variant added successfully</AlertTitle>
          </Alert>
        ),
        { duration: 5000 }
      );
    }

    resetForm();
    setActiveTab('list');
  };

  const handleDeleteVariant = (id: string) => {
    onVariantsChange(variants.filter((variant) => variant.id !== id));

    toast.custom(
      (t) => (
        <Alert variant="mono" icon="success" onClose={() => toast.dismiss(t)}>
          <AlertIcon>
            <CheckCircle />
          </AlertIcon>
          <AlertTitle>Variant deleted successfully</AlertTitle>
        </Alert>
      ),
      { duration: 5000 }
    );
  };

  const handleEditVariant = (id: string) => {
    const variant = variants.find((v) => v.id === id);
    if (variant) {
      setNewVariant({
        sku: variant.sku,
        attributes: variant.attributes,
        price: variant.price,
        compareAtPrice: variant.compareAtPrice,
        cost: variant.cost,
        weight: variant.weight,
        weightUnit: variant.weightUnit,
        dimensions: variant.dimensions,
        dimensionUnit: variant.dimensionUnit,
        imageUrl: variant.imageUrl,
        imageUrls: variant.imageUrls,
        isActive: variant.isActive,
      });
      setEditingId(id);
      setActiveTab('form');
    }
  };

  // Generate variations helpers
  const toggleAttributeSelection = (attributeId: string) => {
    setSelectedAttributeIds((prev) =>
      prev.includes(attributeId)
        ? prev.filter((id) => id !== attributeId)
        : [...prev, attributeId]
    );
  };

  // Cartesian product of arrays
  const cartesian = (...arrays: string[][]): string[][] => {
    return arrays.reduce<string[][]>(
      (acc, arr) => acc.flatMap((combo) => arr.map((val) => [...combo, val])),
      [[]]
    );
  };

  const handleGenerateVariations = () => {
    if (selectedAttributeIds.length === 0) {
      toast.error('Please select at least one attribute');
      return;
    }

    const selectedAttrs = availableAttributes.filter((a) =>
      selectedAttributeIds.includes(a.id)
    );

    // Build arrays of values per attribute
    const attrNames = selectedAttrs.map((a) => a.name);
    const attrValues = selectedAttrs.map((a) => a.values);

    // Generate all combinations
    const combinations = cartesian(...attrValues);

    const newVariants: Variant[] = combinations.map((combo, idx) => {
      const attributes: ProductVariantAttributes = {};
      attrNames.forEach((name, i) => {
        attributes[name] = combo[i];
      });

      // Build a SKU from attribute values
      const skuSuffix = combo
        .map((v) => v.replace(/[^a-zA-Z0-9]/g, '').substring(0, 6).toUpperCase())
        .join('-');

      return {
        id: `gen-${Date.now()}-${idx}`,
        sku: skuSuffix,
        attributes,
        price: 0,
        compareAtPrice: undefined,
        cost: undefined,
        weight: undefined,
        weightUnit: 'kg',
        dimensions: undefined,
        dimensionUnit: 'cm',
        imageUrl: '',
        imageUrls: [],
        isActive: true,
        displayAttributes: formatAttributesDisplay(attributes),
      };
    });

    // Filter out duplicates (based on attribute combination)
    const existingKeys = new Set(
      variants.map((v) =>
        Object.entries(v.attributes)
          .sort(([a], [b]) => a.localeCompare(b))
          .map(([k, val]) => `${k}:${val}`)
          .join('|')
      )
    );

    const uniqueNew = newVariants.filter((v) => {
      const key = Object.entries(v.attributes)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([k, val]) => `${k}:${val}`)
        .join('|');
      return !existingKeys.has(key);
    });

    if (uniqueNew.length === 0) {
      toast.error('All combinations already exist');
      return;
    }

    onVariantsChange([...variants, ...uniqueNew]);

    toast.custom(
      (t) => (
        <Alert variant="mono" icon="success" close={true} onClose={() => toast.dismiss(t)}>
          <AlertIcon>
            <CheckCircle />
          </AlertIcon>
          <AlertTitle>
            {uniqueNew.length} variation{uniqueNew.length !== 1 ? 's' : ''} generated successfully!
          </AlertTitle>
        </Alert>
      ),
      { duration: 5000 }
    );

    setActiveTab('list');
    setSelectedAttributeIds([]);
  };

  // Handle dynamic attribute changes
  const handleAttributeChange = (attributeName: string, value: string) => {
    setNewVariant({
      ...newVariant,
      attributes: {
        ...newVariant.attributes,
        [attributeName]: value,
      },
    });
  };

  return (
    <div className="space-y-5">
      <Card className="rounded-md">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full p-0">
          <CardHeader className="min-h-[40px] bg-accent/50">
            <CardTitle className="text-sm">Variants</CardTitle>
            <TabsList size="xs" className="flex gap-3.5 border-none" variant="line">
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
              <TabsTrigger
                value="form"
                className="flex-1 pb-3 -mb-1.5 gap-3 data-[state=active]:text-foreground text-muted-foreground data-[state=active]:border-foreground border-b-[1px] hover:text-inherit"
              >
                {editingId ? 'Edit Variant' : 'Add New'}
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
                    Generate product variations using attributes or add them manually
                  </span>
                  <div className="mt-3.5 flex gap-2">
                    <Button size="sm" variant="mono" onClick={() => setActiveTab('generate')}>
                      <Sparkles className="mr-2 size-4" />
                      Generate Variations
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => setActiveTab('form')}>
                      <Plus className="mr-2" />
                      Add Manually
                    </Button>
                  </div>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow className="text-secondary-foreground font-normal border-border/60 text-2sm">
                      <TableHead className="min-w-[120px] h-8.5 border-e border-border/60 ps-5">
                        SKU
                      </TableHead>
                      <TableHead className="min-w-[150px] h-8.5 border-e border-border/60">
                        Attributes
                      </TableHead>
                      <TableHead className="min-w-[80px] w-[100px] h-8.5 border-e border-border/60">
                        Price
                      </TableHead>
                      <TableHead className="min-w-[80px] w-[100px] h-8.5 border-e border-border/60 ps-5">
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
                          {variant.sku}
                        </TableCell>
                        <TableCell className="py-1 border-e border-border/60">
                          {variant.displayAttributes || formatAttributesDisplay(variant.attributes)}
                        </TableCell>
                        <TableCell className="py-1 border-e border-border/60">
                          ${Number(variant.price).toFixed(2)}
                        </TableCell>
                        <TableCell className="py-1 border-e border-border/60">
                          <span className={`px-2 py-1 rounded-full text-xs ${variant.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                            {variant.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </TableCell>
                        <TableCell className="py-1 text-center">
                          <div className="flex items-center justify-center gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEditVariant(variant.id!)}
                            >
                              <ClipboardPenLine className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteVariant(variant.id!)}
                            >
                              <Trash2 className="h-4 w-4" />
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
                ) : availableAttributes.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-sm text-muted-foreground">
                      No attributes available. Create attributes first to generate variations.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {availableAttributes.map((attribute) => (
                      <div
                        key={attribute.id}
                        className="flex items-start space-x-3 p-3 rounded-md border border-border hover:bg-accent/50 transition-colors"
                      >
                        <Checkbox
                          id={`gen-${attribute.id}`}
                          checked={selectedAttributeIds.includes(attribute.id)}
                          onCheckedChange={() => toggleAttributeSelection(attribute.id)}
                        />
                        <div className="flex-1 space-y-1">
                          <Label
                            htmlFor={`gen-${attribute.id}`}
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
                >
                  Cancel
                </Button>
                <Button
                  variant="mono"
                  onClick={handleGenerateVariations}
                  disabled={selectedAttributeIds.length === 0}
                >
                  <Sparkles className="mr-2 size-4" />
                  Generate {selectedAttributeIds.length > 0 && `(${selectedAttributeIds.length} attributes)`}
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="form" className="m-0 space-y-4">
              <div className="p-5 space-y-4">
                {/* Basic Info */}
                <div className="flex flex-col gap-2">
                  <Label className="text-xs">SKU *</Label>
                  <Input
                    placeholder="PROD-001-M-RED"
                    value={newVariant.sku}
                    onChange={(e) => setNewVariant({ ...newVariant, sku: e.target.value })}
                  />
                </div>

                {/* Dynamic Attributes from ProductAttribute model */}
                <div className="border rounded-md p-4 space-y-3">
                  <Label className="text-sm font-medium">Product Attributes</Label>
                  {attributesLoading ? (
                    <p className="text-xs text-muted-foreground">Loading attributes...</p>
                  ) : availableAttributes.length === 0 ? (
                    <p className="text-xs text-muted-foreground">
                      No attributes defined. Please create attributes first.
                    </p>
                  ) : (
                    <div className="grid grid-cols-2 gap-4">
                      {availableAttributes.map((attr) => (
                        <div key={attr.id} className="flex flex-col gap-2">
                          <Label className="text-xs">
                            {attr.name}
                            {attr.isRequired && <span className="text-destructive ml-1">*</span>}
                          </Label>
                          <Select
                            value={newVariant.attributes[attr.name] || ''}
                            onValueChange={(value) => handleAttributeChange(attr.name, value)}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder={`Select ${attr.name}`} />
                            </SelectTrigger>
                            <SelectContent>
                              {attr.values.map((value) => (
                                <SelectItem key={value} value={value}>
                                  {value}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Pricing */}
                <div className="grid grid-cols-3 gap-5">
                  <div className="flex flex-col gap-2">
                    <Label className="text-xs">Price *</Label>
                    <InputWrapper>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        value={newVariant.price === 0 ? '' : newVariant.price}
                        onChange={(e) =>
                          setNewVariant({ ...newVariant, price: e.target.value ? parseFloat(e.target.value) : 0 })
                        }
                      />
                      <DollarSign className="size-3" />
                    </InputWrapper>
                  </div>

                  <div className="flex flex-col gap-2">
                    <Label className="text-xs">Compare At Price</Label>
                    <InputWrapper>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        value={newVariant.compareAtPrice || ''}
                        onChange={(e) =>
                          setNewVariant({
                            ...newVariant,
                            compareAtPrice: e.target.value ? parseFloat(e.target.value) : undefined,
                          })
                        }
                      />
                      <DollarSign className="size-3" />
                    </InputWrapper>
                  </div>

                  <div className="flex flex-col gap-2">
                    <Label className="text-xs">Cost</Label>
                    <InputWrapper>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        value={newVariant.cost || ''}
                        onChange={(e) =>
                          setNewVariant({
                            ...newVariant,
                            cost: e.target.value ? parseFloat(e.target.value) : undefined,
                          })
                        }
                      />
                      <DollarSign className="size-3" />
                    </InputWrapper>
                  </div>
                </div>

                {/* Physical Properties */}
                <div className="grid grid-cols-2 gap-5">
                  <div className="flex flex-col gap-2">
                    <Label className="text-xs">Weight</Label>
                    <div className="flex gap-2">
                      <Input
                        type="number"
                        step="0.001"
                        placeholder="0.000"
                        value={newVariant.weight || ''}
                        onChange={(e) =>
                          setNewVariant({
                            ...newVariant,
                            weight: e.target.value ? parseFloat(e.target.value) : undefined,
                          })
                        }
                      />
                      <Select
                        value={newVariant.weightUnit || 'kg'}
                        onValueChange={(value) =>
                          setNewVariant({ ...newVariant, weightUnit: value })
                        }
                      >
                        <SelectTrigger className="w-[100px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="kg">kg</SelectItem>
                          <SelectItem value="lb">lb</SelectItem>
                          <SelectItem value="g">g</SelectItem>
                          <SelectItem value="oz">oz</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <Label className="text-xs">Status</Label>
                    <Select
                      value={newVariant.isActive ? 'active' : 'inactive'}
                      onValueChange={(value) =>
                        setNewVariant({ ...newVariant, isActive: value === 'active' })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center justify-end gap-2 pt-4">
                  <Button variant="outline" onClick={resetForm}>
                    {editingId ? 'Cancel' : 'Clear'}
                  </Button>
                  <Button variant="mono" onClick={handleAddVariant}>
                    {editingId ? 'Update Variant' : 'Add Variant'}
                  </Button>
                </div>
              </div>
            </TabsContent>
          </CardContent>
        </Tabs>
      </Card>
    </div>
  );
}
