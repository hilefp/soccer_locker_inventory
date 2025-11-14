'use client';

import { useState, useEffect } from 'react';
import { X, Plus } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select';
import {
  Sheet,
  SheetBody,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/shared/components/ui/sheet';
import { Textarea } from '@/shared/components/ui/textarea';
import { ScrollArea } from '@/shared/components/ui/scroll-area';
import { Checkbox } from '@/shared/components/ui/checkbox';
import { toast } from 'sonner';
import {
  useProductAttributes,
  useCreateProductAttribute,
  useUpdateProductAttribute,
  useDeleteProductAttribute,
} from '@/modules/products/hooks/use-product-attributes';

// Common attribute types
const ATTRIBUTE_TYPES = [
  'COLOR',
  'SIZE',
  'MATERIAL',
  'STYLE',
  'GENDER',
  'AGE_GROUP',
  'CUSTOM',
];

export function AttributeFormSheet({
  mode,
  open,
  onOpenChange,
  attributeId,
  onSuccess,
}: {
  mode: 'new' | 'edit';
  open: boolean;
  onOpenChange: (open: boolean) => void;
  attributeId?: string;
  onSuccess?: () => void;
}) {
  const isNewMode = mode === 'new';
  const isEditMode = mode === 'edit';

  const [attributeName, setAttributeName] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState('COLOR');
  const [values, setValues] = useState<string[]>([]);
  const [newValue, setNewValue] = useState('');
  const [isRequired, setIsRequired] = useState(false);

  // React Query hooks
  const { data: attributes = [], isLoading: isFetching } = useProductAttributes();
  const createMutation = useCreateProductAttribute();
  const updateMutation = useUpdateProductAttribute();
  const deleteMutation = useDeleteProductAttribute();

  const isLoading = createMutation.isPending || updateMutation.isPending || deleteMutation.isPending;

  // Load attribute data when editing
  useEffect(() => {
    if (!isEditMode || !attributeId || !open) {
      return;
    }

    const attribute = attributes.find(attr => attr.id === attributeId);
    if (attribute) {
      setAttributeName(attribute.name);
      setDescription(attribute.description || '');
      setType(attribute.type);
      setValues(attribute.values || []);
      setIsRequired(attribute.isRequired);
    }
  }, [isEditMode, attributeId, open, attributes]);

  // Reset form when closed
  useEffect(() => {
    if (!open) {
      setAttributeName('');
      setDescription('');
      setType('COLOR');
      setValues([]);
      setNewValue('');
      setIsRequired(false);
    }
  }, [open]);

  const handleAddValue = () => {
    if (!newValue.trim()) {
      toast.error('Please enter a value');
      return;
    }

    if (values.includes(newValue.trim())) {
      toast.error('This value already exists');
      return;
    }

    setValues([...values, newValue.trim()]);
    setNewValue('');
  };

  const handleRemoveValue = (index: number) => {
    setValues(values.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    if (!attributeName.trim()) {
      toast.error('Please enter an attribute name');
      return;
    }

    if (!type) {
      toast.error('Please select an attribute type');
      return;
    }

    if (values.length === 0) {
      toast.error('Please add at least one value');
      return;
    }

    const attributeData = {
      name: attributeName,
      description: description,
      type: type,
      values: values,
      isRequired: isRequired,
    };

    try {
      if (isNewMode) {
        await createMutation.mutateAsync(attributeData);
      } else if (attributeId) {
        await updateMutation.mutateAsync({ id: attributeId, data: attributeData });
      }

      onSuccess?.();
      onOpenChange(false);
    } catch (error) {
      // Error handling is done in the mutation hooks
      console.error('Error saving attribute:', error);
    }
  };

  const handleDelete = async () => {
    if (!attributeId) return;

    try {
      await deleteMutation.mutateAsync(attributeId);
      onSuccess?.();
      onOpenChange(false);
    } catch (error) {
      // Error handling is done in the mutation hook
      console.error('Error deleting attribute:', error);
    }
  };

  const handleClose = () => {
    onOpenChange(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="gap-0 w-[500px] p-0 inset-5 border start-auto h-auto rounded-lg [&_[data-slot=sheet-close]]:top-4.5 [&_[data-slot=sheet-close]]:end-5">
        <SheetHeader className="border-b py-4 px-6">
          <SheetTitle className="font-medium">
            {isNewMode ? 'Add Attribute' : 'Edit Attribute'}
          </SheetTitle>
        </SheetHeader>

        <SheetBody className="p-0 grow pt-5">
          <ScrollArea
            className="h-[calc(100dvh-14rem)] mx-1.5 px-3.5 grow"
            viewportClassName="[&>div]:h-full [&>div>div]:h-full"
          >
            <div className="space-y-6">
              {/* Attribute Name */}
              <div className="space-y-2">
                <Label className="text-xs font-medium">Attribute Name *</Label>
                <Input
                  placeholder="e.g., Color, Size, Material"
                  value={attributeName}
                  onChange={(e) => setAttributeName(e.target.value)}
                  disabled={isLoading || isFetching}
                />
              </div>

              {/* Attribute Type */}
              <div className="space-y-2">
                <Label className="text-xs font-medium">Attribute Type *</Label>
                <Select value={type} onValueChange={setType} disabled={isLoading || isFetching}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Type" />
                  </SelectTrigger>
                  <SelectContent>
                    {ATTRIBUTE_TYPES.map((attrType) => (
                      <SelectItem key={attrType} value={attrType}>
                        {attrType}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label className="text-xs font-medium">Description</Label>
                <Textarea
                  placeholder="Attribute Description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  disabled={isLoading || isFetching}
                />
              </div>

              {/* Is Required */}
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="is-required"
                  checked={isRequired}
                  onCheckedChange={(checked) => setIsRequired(Boolean(checked))}
                  disabled={isLoading || isFetching}
                />
                <Label htmlFor="is-required" className="text-xs font-medium cursor-pointer">
                  This attribute is required
                </Label>
              </div>

              {/* Attribute Values */}
              <div className="space-y-2">
                <Label className="text-xs font-medium">Attribute Values *</Label>

                {/* Add new value input */}
                <div className="flex gap-2">
                  <Input
                    placeholder="Enter a value (e.g., Red, Blue, XL)"
                    value={newValue}
                    onChange={(e) => setNewValue(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddValue();
                      }
                    }}
                    disabled={isLoading || isFetching}
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={handleAddValue}
                    disabled={isLoading || isFetching}
                  >
                    <Plus className="size-4" />
                  </Button>
                </div>

                {/* List of values */}
                {values.length > 0 && (
                  <div className="space-y-2 mt-3">
                    <span className="text-xs text-muted-foreground">
                      {values.length} value{values.length !== 1 ? 's' : ''} added
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {values.map((value, index) => (
                        <div
                          key={index}
                          className="flex items-center gap-1.5 bg-accent px-2.5 py-1.5 rounded-md text-sm"
                        >
                          <span>{value}</span>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="size-4 hover:bg-destructive/10"
                            onClick={() => handleRemoveValue(index)}
                            disabled={isLoading || isFetching}
                          >
                            <X className="size-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </ScrollArea>
        </SheetBody>

        <SheetFooter className="border-t p-5">
          <div className="flex items-center justify-end gap-3 w-full">
            <Button variant="ghost" onClick={handleClose} disabled={isLoading}>
              Close
            </Button>
            {isEditMode && (
              <Button variant="outline" onClick={handleDelete} disabled={isLoading || isFetching}>
                Delete
              </Button>
            )}
            <Button variant="mono" onClick={handleSave} disabled={isLoading || isFetching}>
              {isLoading ? 'Saving...' : isFetching ? 'Loading...' : isNewMode ? 'Create' : 'Save'}
            </Button>
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
