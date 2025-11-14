'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  useCreateProductCategory,
  useDeleteProductCategory,
  useProductCategories,
  useUpdateProductCategory,
} from '@/modules/products/hooks/use-product-categories';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { ScrollArea } from '@/shared/components/ui/scroll-area';
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
import { useFileUpload } from '@/shared/hooks/use-file-upload';
import { toAbsoluteUrl } from '@/shared/lib/helpers';
import { Image as ImageIcon, X } from 'lucide-react';
import { toast } from 'sonner';

function CategoryImageUpload({
  mode,
  imageUrl,
  onImageChange,
}: {
  mode: 'new' | 'edit';
  imageUrl: string | null;
  onImageChange: (url: string | null) => void;
}) {
  const isNewMode = mode === 'new';
  const isEditMode = mode === 'edit';

  const [selectedImage, setSelectedImage] = useState<string | null>(imageUrl);
  const [isUploading, setIsUploading] = useState(false);

  // Update local state when prop changes
  useEffect(() => {
    setSelectedImage(imageUrl);
  }, [imageUrl]);

  // Initialize file upload hook
  const fileUpload = useFileUpload({
    entityType: 'categories',
    onSuccess: (response) => {
      if ('url' in response) {
        setSelectedImage(response.url);
        onImageChange(response.url);
        toast.success('Image uploaded successfully');
      }
    },
    onError: (error) => {
      toast.error(`Upload failed: ${error.message}`);
    },
  });

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setIsUploading(true);

      // Show preview immediately
      const reader = new FileReader();
      reader.onload = (e) => {
        setSelectedImage(e.target?.result as string);
      };
      reader.readAsDataURL(file);

      // Upload to server
      try {
        await fileUpload.uploadSingle(file);
      } catch (error) {
        console.error('Error uploading file:', error);
      } finally {
        setIsUploading(false);
      }
    }
  };

  const iconFileName: string | null =
    selectedImage && selectedImage.includes('/icons/')
      ? (selectedImage.split('/').pop() as string)
      : null;

  return (
    <div className="space-y-4">
      <div className="relative">
        <div className="w-full h-[200px] bg-accent/50 border border-border rounded-lg flex items-center justify-center">
          {selectedImage ? (
            <div className="relative flex items-center justify-center w-full h-full">
              {iconFileName ? (
                <>
                  <img
                    src={toAbsoluteUrl(
                      `/media/store/client/icons/light/${iconFileName}`,
                    )}
                    className="cursor-pointer h-[140px] object-contain dark:hidden"
                    alt="light-icon"
                  />
                  <img
                    src={toAbsoluteUrl(
                      `/media/store/client/icons/dark/${iconFileName}`,
                    )}
                    className="cursor-pointer h-[140px] object-contain light:hidden"
                    alt="dark-icon"
                  />
                </>
              ) : (
                <img
                  src={selectedImage}
                  alt="Category"
                  className={
                    isEditMode
                      ? 'cursor-pointer h-[140px] object-contain'
                      : 'w-full h-full object-cover rounded-lg'
                  }
                />
              )}

              {isNewMode && (
                <Button
                  variant="outline"
                  size="icon"
                  className="absolute top-2 right-2 size-6"
                  onClick={() => {
                    setSelectedImage(null);
                    onImageChange(null);
                  }}
                  disabled={isUploading}
                >
                  <X className="size-3" />
                </Button>
              )}

              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
                id="category-image-upload"
                disabled={isUploading}
              />
              <label
                htmlFor="category-image-upload"
                className="absolute bottom-3 right-3"
              >
                <Button size="sm" variant="outline" asChild disabled={isUploading}>
                  <span>{isUploading ? 'Uploading...' : isEditMode ? 'Change' : 'Upload'}</span>
                </Button>
              </label>
            </div>
          ) : (
            <div className="relative w-full h-full flex items-center justify-center">
              <ImageIcon className="size-[35px] text-muted-foreground" />
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
                id="category-image-upload-empty"
                disabled={isUploading}
              />
              <label
                htmlFor="category-image-upload-empty"
                className="absolute bottom-3 right-3"
              >
                <Button size="sm" variant="outline" asChild disabled={isUploading}>
                  <span>{isUploading ? 'Uploading...' : 'Upload'}</span>
                </Button>
              </label>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function CategoryFormSheet({
  mode,
  open,
  onOpenChange,
  categoryId,
  onSuccess,
}: {
  mode: 'new' | 'edit';
  open: boolean;
  onOpenChange: (open: boolean) => void;
  categoryId?: string;
  onSuccess?: () => void;
}) {
  const isNewMode = mode === 'new';
  const isEditMode = mode === 'edit';

  const [categoryName, setCategoryName] = useState('');
  const [slug, setSlug] = useState('');
  const [status, setStatus] = useState('active');
  const [description, setDescription] = useState('');
  const [parentId, setParentId] = useState<string>('');
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  // React Query hooks
  const { data: categories = [], isLoading: isFetching } =
    useProductCategories();
  const createMutation = useCreateProductCategory();
  const updateMutation = useUpdateProductCategory();
  const deleteMutation = useDeleteProductCategory();

  const isLoading =
    createMutation.isPending ||
    updateMutation.isPending ||
    deleteMutation.isPending;

  useEffect(() => {
    if (!isEditMode || !categoryId || !open) {
      return;
    }

    const category = categories.find((cat) => cat.id === categoryId);
    if (category) {
      setCategoryName(category.name);
      setSlug(category.slug);
      setStatus(category.isActive ? 'active' : 'inactive');
      setDescription(category.description || '');
      setParentId(category.parentId || '');
      setImageUrl(category.imageUrl || null);
    }
  }, [isEditMode, categoryId, open, categories]);

  // Reset form when closed
  useEffect(() => {
    if (!open) {
      setCategoryName('');
      setSlug('');
      setStatus('active');
      setDescription('');
      setParentId('');
      setImageUrl(null);
    }
  }, [open]);

  useEffect(() => {
    if (isNewMode && categoryName) {
      const generatedSlug = categoryName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
      setSlug(generatedSlug);
    }
  }, [categoryName, isNewMode]);

  const handleSave = async () => {
    if (!categoryName.trim() || !slug.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }

    const categoryData = {
      name: categoryName,
      slug: slug,
      description: description,
      isActive: status === 'active',
      parentId: parentId || undefined,
      imageUrl: imageUrl || null,
    };

    try {
      if (isNewMode) {
        await createMutation.mutateAsync(categoryData);
      } else if (categoryId) {
        await updateMutation.mutateAsync({
          id: categoryId,
          data: categoryData,
        });
      }

      onSuccess?.();
      onOpenChange(false);
    } catch (error) {
      console.error('Error saving category:', error);
    }
  };

  const handleDelete = async () => {
    if (!categoryId) return;

    try {
      await deleteMutation.mutateAsync(categoryId);
      onSuccess?.();
      onOpenChange(false);
    } catch (error) {
      console.error('Error deleting category:', error);
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
            {isNewMode ? 'Add Category' : 'Edit Category'}
          </SheetTitle>
        </SheetHeader>

        <SheetBody className="p-0 grow pt-5">
          <ScrollArea
            className="h-[calc(100dvh-14rem)] mx-1.5 px-3.5 grow"
            viewportClassName="[&>div]:h-full [&>div>div]:h-full"
          >
            <div className="space-y-6">
              {/* Image Upload */}
              <CategoryImageUpload
                mode={mode}
                imageUrl={imageUrl}
                onImageChange={setImageUrl}
              />

              {/* Category Name */}
              <div className="space-y-2">
                <Label className="text-xs font-medium">Category Name *</Label>
                <Input
                  placeholder="Category Name"
                  value={categoryName}
                  onChange={(e) => setCategoryName(e.target.value)}
                  disabled={isLoading || isFetching}
                />
              </div>

              {/* Slug */}
              <div className="space-y-2">
                <Label className="text-xs font-medium">Slug *</Label>
                <Input
                  placeholder="category-slug"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  disabled={isLoading || isFetching}
                />
                <span className="text-xs text-muted-foreground">
                  URL-friendly identifier (auto-generated from name)
                </span>
              </div>

              {/* Parent Category */}
              <div className="space-y-2">
                <Label className="text-xs font-medium">Parent Category</Label>
                <Select
                  value={parentId || 'none'}
                  onValueChange={(value) =>
                    setParentId(value === 'none' ? '' : value)
                  }
                  disabled={isLoading || isFetching}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="None (Top Level)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None (Top Level)</SelectItem>
                    {categories
                      .filter((cat) => cat.id !== categoryId) // Don't allow selecting self as parent
                      .map((cat) => (
                        <SelectItem key={cat.id} value={cat.id || 'none'}>
                          {cat.name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
                <span className="text-xs text-muted-foreground">
                  Optional: Select a parent to create a subcategory
                </span>
              </div>

              {/* Status */}
              <div className="space-y-2">
                <Label className="text-xs font-medium">Status</Label>
                <Select
                  value={status}
                  onValueChange={setStatus}
                  disabled={isLoading || isFetching}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label className="text-xs font-medium">Description</Label>
                <Textarea
                  placeholder="Category Description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                  disabled={isLoading || isFetching}
                />
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
              <Button
                variant="outline"
                onClick={handleDelete}
                disabled={isLoading || isFetching}
              >
                Delete
              </Button>
            )}
            <Button
              variant="mono"
              onClick={handleSave}
              disabled={isLoading || isFetching}
            >
              {isLoading
                ? 'Saving...'
                : isFetching
                  ? 'Loading...'
                  : isNewMode
                    ? 'Create'
                    : 'Save'}
            </Button>
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
