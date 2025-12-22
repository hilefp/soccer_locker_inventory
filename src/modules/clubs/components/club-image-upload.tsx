import { useCallback, useState } from 'react';
import { CloudUpload, ImageIcon, Loader2, Trash2, TriangleAlert } from 'lucide-react';
import { cn } from '@/shared/lib/utils';
import {
  Alert,
  AlertContent,
  AlertDescription,
  AlertIcon,
  AlertTitle,
} from '@/shared/components/ui/alert';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent } from '@/shared/components/ui/card';
import { Progress } from '@/shared/components/ui/progress';
import { useFileUpload } from '@/shared/hooks/use-file-upload';

interface ClubImageUploadProps {
  label: string;
  description?: string;
  currentImageUrl?: string;
  maxSize?: number;
  onImageChange: (imageUrl: string) => void;
  onImageRemove: () => void;
  aspectRatio?: 'square' | 'wide' | 'auto';
  className?: string;
}

export function ClubImageUpload({
  label,
  description,
  currentImageUrl,
  maxSize = 5 * 1024 * 1024, // 5MB
  onImageChange,
  onImageRemove,
  aspectRatio = 'auto',
  className,
}: ClubImageUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentImageUrl || null);

  const fileUpload = useFileUpload({
    entityType: 'clubs',
    onSuccess: (response) => {
      console.log('Upload successful:', response);
      setIsUploading(false);
      setUploadProgress(100);
      // Handle single upload response
      if ('url' in response && response.url) {
        setPreviewUrl(response.url);
        onImageChange(response.url);
      }
    },
    onError: (error) => {
      console.error('Upload error:', error);
      setError(error.message);
      setIsUploading(false);
      setUploadProgress(0);
    },
    onProgress: (uploads) => {
      const currentUpload = uploads[0];
      if (currentUpload) {
        setUploadProgress(currentUpload.progress);
      }
    },
  });

  const validateFile = useCallback(
    (file: File): string | null => {
      if (!file.type.startsWith('image/')) {
        return 'File must be an image';
      }
      if (file.size > maxSize) {
        return `File size must be less than ${(maxSize / 1024 / 1024).toFixed(1)}MB`;
      }
      return null;
    },
    [maxSize]
  );

  const handleFileUpload = useCallback(
    async (file: File) => {
      // Validate file
      const validationError = validateFile(file);
      if (validationError) {
        setError(validationError);
        return;
      }

      // Clear previous errors
      setError(null);
      setIsUploading(true);
      setUploadProgress(0);

      try {
        await fileUpload.uploadSingle(file);
      } catch (err) {
        console.error('Upload failed:', err);
        setError((err as Error).message || 'Upload failed');
        setIsUploading(false);
        setUploadProgress(0);
      }
    },
    [validateFile, fileUpload]
  );

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);

      const files = e.dataTransfer.files;
      if (files.length > 0) {
        handleFileUpload(files[0]);
      }
    },
    [handleFileUpload]
  );

  const openFileDialog = useCallback(() => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e) => {
      const target = e.target as HTMLInputElement;
      if (target.files && target.files[0]) {
        handleFileUpload(target.files[0]);
      }
    };
    input.click();
  }, [handleFileUpload]);

  const handleRemoveImage = useCallback(async () => {
    if (previewUrl && !previewUrl.startsWith('blob:')) {
      try {
        await fileUpload.deleteImage(previewUrl);
      } catch (error) {
        console.error('Failed to delete image:', error);
      }
    }
    setPreviewUrl(null);
    setUploadProgress(0);
    setError(null);
    onImageRemove();
  }, [previewUrl, fileUpload, onImageRemove]);

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const getAspectRatioClass = () => {
    switch (aspectRatio) {
      case 'square':
        return 'aspect-square';
      case 'wide':
        return 'aspect-video';
      default:
        return '';
    }
  };

  return (
    <div className={cn('w-full', className)}>
      {/* Label */}
      {label && (
        <div className="mb-2">
          <label className="text-sm font-medium">{label}</label>
          {description && (
            <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
          )}
        </div>
      )}

      {/* Preview Area */}
      {previewUrl && !isUploading && (
        <div className="mb-4 relative group">
          <div
            className={cn(
              'rounded-md overflow-hidden border border-border bg-accent/20',
              getAspectRatioClass()
            )}
          >
            <img
              src={previewUrl}
              alt={label}
              className={cn(
                'w-full h-full object-contain',
                aspectRatio === 'square' && 'object-cover'
              )}
            />
          </div>
          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 rounded-md">
            <Button
              variant="outline"
              size="sm"
              onClick={handleRemoveImage}
              className="shadow-lg"
            >
              <Trash2 className="size-4 mr-2" />
              Remove
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={openFileDialog}
              className="shadow-lg"
            >
              <CloudUpload className="size-4 mr-2" />
              Replace
            </Button>
          </div>
        </div>
      )}

      {/* Upload Progress */}
      {isUploading && (
        <Card className="mb-4 bg-accent/20 shadow-none rounded-md">
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex items-center justify-center size-10 rounded-md border border-border shrink-0">
              <Loader2 className="size-5 text-muted-foreground animate-spin" />
            </div>
            <div className="flex-1 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Uploading image...</span>
                <span className="text-sm text-muted-foreground">
                  {Math.round(uploadProgress)}%
                </span>
              </div>
              <Progress
                value={uploadProgress}
                className="h-1.5"
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Upload Area - Show only if no preview */}
      {!previewUrl && !isUploading && (
        <Card
          className={cn(
            'border-dashed shadow-none rounded-md bg-accent/20 transition-colors cursor-pointer',
            isDragging
              ? 'border-primary bg-primary/5'
              : 'border-muted-foreground/25 hover:border-muted-foreground/50'
          )}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          onClick={openFileDialog}
        >
          <CardContent className="text-center py-8">
            <div className="flex items-center justify-center size-12 rounded-full border border-border mx-auto mb-3">
              <CloudUpload className="size-6 text-muted-foreground" />
            </div>
            <h3 className="text-sm text-foreground font-semibold mb-1">
              Choose a file or drag & drop here
            </h3>
            <span className="text-xs text-muted-foreground block mb-4">
              JPEG, PNG, up to {formatBytes(maxSize)}
            </span>
            <Button size="sm" variant="mono" type="button">
              <ImageIcon className="size-4 mr-2" />
              Browse File
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Error Messages */}
      {error && (
        <Alert variant="destructive" appearance="light" className="mt-4">
          <AlertIcon>
            <TriangleAlert />
          </AlertIcon>
          <AlertContent>
            <AlertTitle>Upload error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </AlertContent>
        </Alert>
      )}
    </div>
  );
}
