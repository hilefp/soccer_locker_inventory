'use client';

import { useState, useEffect } from 'react';
import { X, Image as ImageIcon } from 'lucide-react';
import { toAbsoluteUrl } from '@/shared/lib/helpers';
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
import { toast } from 'sonner';
import {
  useProductBrands,
  useCreateProductBrand,
  useUpdateProductBrand,
  useDeleteProductBrand,
} from '@/modules/products/hooks/use-product-brands';
import { useFileUpload } from '@/shared/hooks/use-file-upload';

function BrandImageUpload({
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
    entityType: 'product-brands',
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
        const response = await fileUpload.uploadSingle(file);
        if (response) {
          setSelectedImage(response.url);
          onImageChange(response.url);
          toast.success('Image uploaded successfully');
        }
      } catch (error) {
        console.error('Error uploading file:', error);
      } finally {
        setIsUploading(false);
      }
    }
  };

  // If selected image points to icons path, extract file name for light/dark rendering
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
                    src={toAbsoluteUrl(`/media/store/client/icons/light/${iconFileName}`)}
                    className="cursor-pointer h-[140px] object-contain dark:hidden"
                    alt="light-icon"
                  />
                  <img
                    src={toAbsoluteUrl(`/media/store/client/icons/dark/${iconFileName}`)}
                    className="cursor-pointer h-[140px] object-contain light:hidden"
                    alt="dark-icon"
                  />
                </>
              ) : (
                <img
                  src={selectedImage}
                  alt="Brand"
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
                id="brand-image-upload"
                disabled={isUploading}
              />
              <label htmlFor="brand-image-upload" className="absolute bottom-3 right-3">
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
                id="brand-image-upload-empty"
                disabled={isUploading}
              />
              <label htmlFor="brand-image-upload-empty" className="absolute bottom-3 right-3">
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

export function BrandFormSheet({
  mode,
  open,
  onOpenChange,
  brandId,
  onSuccess,
}: {
  mode: 'new' | 'edit';
  open: boolean;
  onOpenChange: (open: boolean) => void;
  brandId?: string;
  onSuccess?: () => void;
}) {
  const isNewMode = mode === 'new';
  const isEditMode = mode === 'edit';

  const [brandName, setBrandName] = useState('');
  const [slug, setSlug] = useState('');
  const [code, setCode] = useState('');
  const [status, setStatus] = useState('active');
  const [description, setDescription] = useState('');
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  // React Query hooks
  const { data: brands = [], isLoading: isFetching } = useProductBrands();
  const createMutation = useCreateProductBrand();
  const updateMutation = useUpdateProductBrand();
  const deleteMutation = useDeleteProductBrand();

  const isLoading = createMutation.isPending || updateMutation.isPending || deleteMutation.isPending;

  // Load brand data when editing
  useEffect(() => {
    if (!isEditMode || !brandId || !open) {
      return;
    }

    const brand = brands.find(b => b.id === brandId);
    if (brand) {
      setBrandName(brand.name);
      setSlug(brand.slug);
      setCode(brand.code);
      setStatus(brand.isActive ? 'active' : 'inactive');
      setDescription(brand.description || '');
      setWebsiteUrl(brand.websiteUrl || '');
      setImageUrl(brand.imageUrl || null);
    }
  }, [isEditMode, brandId, open, brands]);

  // Reset form when closed
  useEffect(() => {
    if (!open) {
      setBrandName('');
      setSlug('');
      setCode('');
      setStatus('active');
      setDescription('');
      setWebsiteUrl('');
      setImageUrl(null);
    }
  }, [open]);

  // Auto-generate slug from brand name
  useEffect(() => {
    if (isNewMode && brandName) {
      const generatedSlug = brandName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
      setSlug(generatedSlug);
    }
  }, [brandName, isNewMode]);

  // Auto-generate code from brand name
  useEffect(() => {
    if (isNewMode && brandName) {
      const generatedCode = brandName
        .toUpperCase()
        .replace(/[^A-Z0-9]+/g, '')
        .substring(0, 50);
      setCode(generatedCode);
    }
  }, [brandName, isNewMode]);

  const handleSave = async () => {
    if (!brandName.trim() || !slug.trim() || !code.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }

    const brandData = {
      name: brandName,
      slug: slug,
      code: code,
      description: description,
      websiteUrl: websiteUrl || undefined,
      isActive: status === 'active',
      imageUrl: imageUrl || null,
    };

    try {
      if (isNewMode) {
        await createMutation.mutateAsync(brandData);
      } else if (brandId) {
        await updateMutation.mutateAsync({ id: brandId, data: brandData });
      }

      onSuccess?.();
      onOpenChange(false);
    } catch (error) {
      // Error handling is done in the mutation hooks
      console.error('Error saving brand:', error);
    }
  };

  const handleDelete = async () => {
    if (!brandId) return;

    try {
      await deleteMutation.mutateAsync(brandId);
      onSuccess?.();
      onOpenChange(false);
    } catch (error) {
      // Error handling is done in the mutation hook
      console.error('Error deleting brand:', error);
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
            {isNewMode ? 'Add Brand' : 'Edit Brand'}
          </SheetTitle>
        </SheetHeader>

        <SheetBody className="p-0 grow pt-5">
          <ScrollArea
            className="h-[calc(100dvh-14rem)] mx-1.5 px-3.5 grow"
            viewportClassName="[&>div]:h-full [&>div>div]:h-full"
          >
            <div className="space-y-6">
              {/* Image Upload */}
              <BrandImageUpload
                mode={mode}
                imageUrl={imageUrl}
                onImageChange={setImageUrl}
              />

              {/* Brand Name */}
              <div className="space-y-2">
                <Label className="text-xs font-medium">Brand Name *</Label>
                <Input
                  placeholder="Brand Name"
                  value={brandName}
                  onChange={(e) => setBrandName(e.target.value)}
                  disabled={isLoading || isFetching}
                />
              </div>

              {/* Slug */}
              <div className="space-y-2">
                <Label className="text-xs font-medium">Slug *</Label>
                <Input
                  placeholder="brand-slug"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  disabled={isLoading || isFetching}
                />
                <span className="text-xs text-muted-foreground">
                  URL-friendly identifier (auto-generated from name)
                </span>
              </div>

              {/* Brand Code */}
              <div className="space-y-2">
                <Label className="text-xs font-medium">Brand Code *</Label>
                <Input
                  placeholder="BRAND"
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  disabled={isLoading || isFetching}
                  maxLength={50}
                />
                <span className="text-xs text-muted-foreground">
                  Unique brand code (auto-generated, max 50 characters)
                </span>
              </div>

              {/* Website URL */}
              <div className="space-y-2">
                <Label className="text-xs font-medium">Website URL</Label>
                <Input
                  placeholder="https://www.example.com"
                  value={websiteUrl}
                  onChange={(e) => setWebsiteUrl(e.target.value)}
                  disabled={isLoading || isFetching}
                  type="url"
                />
                <span className="text-xs text-muted-foreground">
                  Official brand website
                </span>
              </div>

              {/* Status */}
              <div className="space-y-2">
                <Label className="text-xs font-medium">Status</Label>
                <Select value={status} onValueChange={setStatus} disabled={isLoading || isFetching}>
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
                  placeholder="Brand Description"
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
