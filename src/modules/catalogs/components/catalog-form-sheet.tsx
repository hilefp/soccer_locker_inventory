'use client';

import { useState, useEffect } from 'react';
import { FileText, ImageIcon, X } from 'lucide-react';
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
import { ScrollArea } from '@/shared/components/ui/scroll-area';
import { toast } from 'sonner';
import {
  useCatalogs,
  useCreateCatalog,
  useUpdateCatalog,
  useDeleteCatalog,
} from '@/modules/catalogs/hooks/use-catalogs';
import { useFileUpload } from '@/shared/hooks/use-file-upload';

function PdfUpload({
  pdfUrl,
  brand,
  onPdfUploaded,
  onPdfRemoved,
}: {
  pdfUrl: string | null;
  brand: string;
  onPdfUploaded: (url: string, key: string, sizeBytes: number) => void;
  onPdfRemoved: () => void;
}) {
  const [isUploading, setIsUploading] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);

  const fileUpload = useFileUpload({
    entityType: 'catalogs',
    visibility: 'public',
    onError: (error) => {
      toast.error(`PDF upload failed: ${error.message}`);
    },
  });

  const handlePdfUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setIsUploading(true);
      setFileName(file.name);

      try {
        const customFilename = brand.trim()
          ? `${brand.trim().toLowerCase().replace(/\s+/g, '-')}-catalog`
          : undefined;
        const response = await fileUpload.uploadSingle(file, customFilename);
        if (response) {
          onPdfUploaded(response.url, response.key, response.size);
          toast.success('PDF uploaded successfully');
        }
      } catch (error) {
        console.error('Error uploading PDF:', error);
        setFileName(null);
      } finally {
        setIsUploading(false);
      }
    }
  };

  const displayName = fileName || (pdfUrl ? pdfUrl.split('/').pop() : null);

  return (
    <div className="space-y-2">
      <Label className="text-xs font-medium">PDF File</Label>
      <div className="flex items-center gap-3 p-3 border border-border rounded-lg bg-accent/50">
        <FileText className="size-8 text-muted-foreground shrink-0" />
        <div className="w-0 flex-1 overflow-hidden">
          {displayName ? (
            <p className="text-sm font-medium truncate">{displayName}</p>
          ) : (
            <p className="text-sm text-muted-foreground">No PDF uploaded</p>
          )}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {pdfUrl && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                onPdfRemoved();
                setFileName(null);
              }}
              disabled={isUploading}
            >
              <X className="size-3" />
            </Button>
          )}
          <input
            type="file"
            accept="application/pdf"
            onChange={handlePdfUpload}
            className="hidden"
            id="catalog-pdf-upload"
            disabled={isUploading}
          />
          <label htmlFor="catalog-pdf-upload">
            <Button size="sm" variant="outline" asChild disabled={isUploading}>
              <span>{isUploading ? 'Uploading...' : pdfUrl ? 'Replace' : 'Upload'}</span>
            </Button>
          </label>
        </div>
      </div>
    </div>
  );
}

function CoverImageUpload({
  coverImageUrl,
  brand,
  onCoverImageUploaded,
  onCoverImageRemoved,
}: {
  coverImageUrl: string | null;
  brand: string;
  onCoverImageUploaded: (url: string, key: string) => void;
  onCoverImageRemoved: () => void;
}) {
  const [isUploading, setIsUploading] = useState(false);

  const fileUpload = useFileUpload({
    entityType: 'catalogs',
    visibility: 'public',
    onError: (error) => {
      toast.error(`Cover image upload failed: ${error.message}`);
    },
  });

  const handleCoverUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const customFilename = brand.trim()
        ? `${brand.trim().toLowerCase().replace(/\s+/g, '-')}-cover`
        : undefined;
      const response = await fileUpload.uploadSingle(file, customFilename);
      if (response) {
        onCoverImageUploaded(response.url, response.key);
        toast.success('Cover image uploaded successfully');
      }
    } catch (error) {
      console.error('Error uploading cover image:', error);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-2">
      <Label className="text-xs font-medium">Cover Image</Label>
      <div className="flex items-center gap-3 p-3 border border-border rounded-lg bg-accent/50">
        <div className="size-14 rounded-md bg-background border border-border flex items-center justify-center overflow-hidden shrink-0">
          {coverImageUrl ? (
            <img
              src={coverImageUrl}
              alt="Catalog cover"
              className="size-full object-cover"
            />
          ) : (
            <ImageIcon className="size-6 text-muted-foreground" />
          )}
        </div>
        <div className="w-0 flex-1 overflow-hidden">
          {coverImageUrl ? (
            <p className="text-sm font-medium truncate">
              {coverImageUrl.split('/').pop()}
            </p>
          ) : (
            <p className="text-sm text-muted-foreground">No cover image uploaded</p>
          )}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {coverImageUrl && (
            <Button
              variant="outline"
              size="sm"
              onClick={onCoverImageRemoved}
              disabled={isUploading}
            >
              <X className="size-3" />
            </Button>
          )}
          <input
            type="file"
            accept="image/*"
            onChange={handleCoverUpload}
            className="hidden"
            id="catalog-cover-upload"
            disabled={isUploading}
          />
          <label htmlFor="catalog-cover-upload">
            <Button size="sm" variant="outline" asChild disabled={isUploading}>
              <span>
                {isUploading ? 'Uploading...' : coverImageUrl ? 'Replace' : 'Upload'}
              </span>
            </Button>
          </label>
        </div>
      </div>
    </div>
  );
}

export function CatalogFormSheet({
  mode,
  open,
  onOpenChange,
  catalogId,
  onSuccess,
}: {
  mode: 'new' | 'edit';
  open: boolean;
  onOpenChange: (open: boolean) => void;
  catalogId?: string;
  onSuccess?: () => void;
}) {
  const isNewMode = mode === 'new';
  const isEditMode = mode === 'edit';

  const [year, setYear] = useState<number>(new Date().getFullYear());
  const [brand, setBrand] = useState('');
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [pdfKey, setPdfKey] = useState<string | null>(null);
  const [pdfSizeBytes, setPdfSizeBytes] = useState<number | null>(null);
  const [coverImageUrl, setCoverImageUrl] = useState<string | null>(null);
  const [coverImageKey, setCoverImageKey] = useState<string | null>(null);
  const [sortPosition, setSortPosition] = useState(0);
  const [status, setStatus] = useState('active');

  const { data: catalogs = [], isLoading: isFetching } = useCatalogs(true);
  const createMutation = useCreateCatalog();
  const updateMutation = useUpdateCatalog();
  const deleteMutation = useDeleteCatalog();

  const isLoading = createMutation.isPending || updateMutation.isPending || deleteMutation.isPending;

  // Load catalog data when editing
  useEffect(() => {
    if (!isEditMode || !catalogId || !open) return;

    const catalog = catalogs.find((c) => c.id === catalogId);
    if (catalog) {
      setYear(catalog.year);
      setBrand(catalog.brand);
      setPdfUrl(catalog.pdfUrl);
      setPdfKey(catalog.pdfKey);
      setPdfSizeBytes(catalog.pdfSizeBytes);
      setCoverImageUrl(catalog.coverImageUrl);
      setCoverImageKey(catalog.coverImageKey);
      setSortPosition(catalog.sortPosition);
      setStatus(catalog.isActive ? 'active' : 'inactive');
    }
  }, [isEditMode, catalogId, open, catalogs]);

  // Reset form when closed
  useEffect(() => {
    if (!open) {
      setYear(new Date().getFullYear());
      setBrand('');
      setPdfUrl(null);
      setPdfKey(null);
      setPdfSizeBytes(null);
      setCoverImageUrl(null);
      setCoverImageKey(null);
      setSortPosition(0);
      setStatus('active');
    }
  }, [open]);

  const handlePdfUploaded = (url: string, key: string, sizeBytes: number) => {
    setPdfUrl(url);
    setPdfKey(key);
    setPdfSizeBytes(sizeBytes);
  };

  const handlePdfRemoved = () => {
    setPdfUrl(null);
    setPdfKey(null);
    setPdfSizeBytes(null);
  };

  const handleCoverImageUploaded = (url: string, key: string) => {
    setCoverImageUrl(url);
    setCoverImageKey(key);
  };

  const handleCoverImageRemoved = () => {
    setCoverImageUrl(null);
    setCoverImageKey(null);
  };

  const handleSave = async () => {
    if (!brand.trim()) {
      toast.error('Please enter a brand name');
      return;
    }

    const catalogData = {
      year,
      brand,
      pdfUrl: pdfUrl || undefined,
      pdfKey: pdfKey || undefined,
      pdfSizeBytes: pdfSizeBytes || undefined,
      coverImageUrl: coverImageUrl || undefined,
      coverImageKey: coverImageKey || undefined,
      sortPosition,
      isActive: status === 'active',
    };

    try {
      if (isNewMode) {
        await createMutation.mutateAsync(catalogData);
      } else if (catalogId) {
        await updateMutation.mutateAsync({ id: catalogId, data: catalogData });
      }

      onSuccess?.();
      onOpenChange(false);
    } catch (error) {
      console.error('Error saving catalog:', error);
    }
  };

  const handleDelete = async () => {
    if (!catalogId) return;

    try {
      await deleteMutation.mutateAsync(catalogId);
      onSuccess?.();
      onOpenChange(false);
    } catch (error) {
      console.error('Error deleting catalog:', error);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="gap-0 w-[500px] p-0 inset-5 border start-auto h-auto rounded-lg [&_[data-slot=sheet-close]]:top-4.5 [&_[data-slot=sheet-close]]:end-5">
        <SheetHeader className="border-b py-4 px-6">
          <SheetTitle className="font-medium">
            {isNewMode ? 'Add Catalog' : 'Edit Catalog'}
          </SheetTitle>
        </SheetHeader>

        <SheetBody className="p-0 grow pt-5">
          <ScrollArea
            className="h-[calc(100dvh-14rem)] mx-1.5 px-3.5 grow"
            viewportClassName="[&>div]:h-full [&>div>div]:h-full"
          >
            <div className="space-y-6">
              {/* Brand */}
              <div className="space-y-2">
                <Label className="text-xs font-medium">Brand *</Label>
                <Input
                  placeholder="Nike"
                  value={brand}
                  onChange={(e) => setBrand(e.target.value)}
                  disabled={isLoading || isFetching}
                />
              </div>

              {/* Year */}
              <div className="space-y-2">
                <Label className="text-xs font-medium">Year *</Label>
                <Input
                  type="number"
                  placeholder="2026"
                  value={year}
                  onChange={(e) => setYear(Number(e.target.value))}
                  min={2000}
                  max={2100}
                  disabled={isLoading || isFetching}
                />
              </div>

              {/* PDF Upload */}
              <PdfUpload
                pdfUrl={pdfUrl}
                brand={brand}
                onPdfUploaded={handlePdfUploaded}
                onPdfRemoved={handlePdfRemoved}
              />

              {/* Cover Image Upload */}
              <CoverImageUpload
                coverImageUrl={coverImageUrl}
                brand={brand}
                onCoverImageUploaded={handleCoverImageUploaded}
                onCoverImageRemoved={handleCoverImageRemoved}
              />

              {/* Sort Position */}
              <div className="space-y-2">
                <Label className="text-xs font-medium">Sort Position</Label>
                <Input
                  type="number"
                  placeholder="0"
                  value={sortPosition || ''}
                  onChange={(e) => setSortPosition(e.target.value === '' ? 0 : Number(e.target.value))}
                  min={0}
                  disabled={isLoading || isFetching}
                />
                <span className="text-xs text-muted-foreground">
                  Lower numbers appear first
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
            </div>
          </ScrollArea>
        </SheetBody>

        <SheetFooter className="border-t p-5">
          <div className="flex items-center justify-end gap-3 w-full">
            <Button variant="ghost" onClick={() => onOpenChange(false)} disabled={isLoading}>
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
