'use client';

import { useState } from 'react';
import {
  CheckCircle,
  ClipboardPenLine,
  DollarSign,
  Plus,
  Settings,
  Trash2,
  Package,
} from 'lucide-react';
import { toast } from 'sonner';
import { Alert, AlertIcon, AlertTitle } from '@/shared/components/ui/alert';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Input, InputWrapper } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
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
  const [newVariant, setNewVariant] = useState<Omit<Variant, 'id'>>({
    sku: '',
    barcode: '',
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
      barcode: '',
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
        barcode: variant.barcode,
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
                    Set up different options for this product
                  </span>
                  <div className="mt-3.5">
                    <Button size="sm" variant="mono" onClick={() => setActiveTab('form')}>
                      <Plus className="mr-2" />
                      Add Variant
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
                          ${variant.price.toFixed(2)}
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

            <TabsContent value="form" className="m-0 space-y-4">
              <div className="p-5 space-y-4">
                {/* Basic Info */}
                <div className="grid grid-cols-2 gap-5">
                  <div className="flex flex-col gap-2">
                    <Label className="text-xs">SKU *</Label>
                    <Input
                      placeholder="PROD-001-M-RED"
                      value={newVariant.sku}
                      onChange={(e) => setNewVariant({ ...newVariant, sku: e.target.value })}
                    />
                  </div>

                  <div className="flex flex-col gap-2">
                    <Label className="text-xs">Barcode</Label>
                    <Input
                      placeholder="123456789"
                      value={newVariant.barcode || ''}
                      onChange={(e) =>
                        setNewVariant({ ...newVariant, barcode: e.target.value })
                      }
                    />
                  </div>
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
                        value={newVariant.price}
                        onChange={(e) =>
                          setNewVariant({ ...newVariant, price: parseFloat(e.target.value) || 0 })
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
