import { useState, useCallback } from 'react';
import {
  fileUploadService,
  EntityType,
  UploadResponse,
  MultipleUploadResponse,
  DeleteResponse,
  AdvancedUploadOptions,
} from '@/shared/services/file-upload.service';

export interface UploadProgress {
  id: string;
  file: File;
  progress: number;
  status: 'pending' | 'uploading' | 'completed' | 'error';
  error?: string;
  response?: UploadResponse;
}

interface UseFileUploadOptions {
  entityType: EntityType;
  onSuccess?: (response: UploadResponse | MultipleUploadResponse) => void;
  onError?: (error: Error) => void;
  onProgress?: (progress: UploadProgress[]) => void;
}

export function useFileUpload(options: UseFileUploadOptions) {
  const { entityType, onSuccess, onError, onProgress } = options;

  const [uploads, setUploads] = useState<UploadProgress[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  /**
   * Upload a single file
   */
  const uploadSingle = useCallback(
    async (file: File): Promise<UploadResponse | null> => {
      const uploadId = `${Date.now()}-${Math.random()}`;

      const newUpload: UploadProgress = {
        id: uploadId,
        file,
        progress: 0,
        status: 'uploading',
      };

      setUploads((prev) => [...prev, newUpload]);
      setIsUploading(true);

      try {
        // Simulate progress (since fetch doesn't support real progress tracking)
        const progressInterval = setInterval(() => {
          setUploads((prev) =>
            prev.map((upload) =>
              upload.id === uploadId && upload.progress < 90
                ? { ...upload, progress: upload.progress + 10 }
                : upload,
            ),
          );
        }, 100);

        const response = await fileUploadService.uploadImage(file, entityType);

        clearInterval(progressInterval);

        setUploads((prev) =>
          prev.map((upload) =>
            upload.id === uploadId
              ? {
                  ...upload,
                  progress: 100,
                  status: 'completed',
                  response,
                }
              : upload,
          ),
        );

        onSuccess?.(response);
        return response;
      } catch (error) {
        const err = error as Error;
        setUploads((prev) =>
          prev.map((upload) =>
            upload.id === uploadId
              ? {
                  ...upload,
                  status: 'error',
                  error: err.message,
                }
              : upload,
          ),
        );

        onError?.(err);
        return null;
      } finally {
        setIsUploading(false);
        // Notify about progress changes
        setUploads((current) => {
          onProgress?.(current);
          return current;
        });
      }
    },
    [entityType, onSuccess, onError, onProgress],
  );

  /**
   * Upload multiple files
   */
  const uploadMultiple = useCallback(
    async (files: File[]): Promise<MultipleUploadResponse | null> => {
      if (files.length === 0) return null;

      setIsUploading(true);

      const newUploads: UploadProgress[] = files.map((file) => ({
        id: `${Date.now()}-${Math.random()}`,
        file,
        progress: 0,
        status: 'uploading' as const,
      }));

      setUploads((prev) => [...prev, ...newUploads]);

      try {
        const progressInterval = setInterval(() => {
          setUploads((prev) =>
            prev.map((upload) =>
              newUploads.some((nu) => nu.id === upload.id) &&
              upload.progress < 90
                ? { ...upload, progress: upload.progress + 10 }
                : upload,
            ),
          );
        }, 100);

        const response = await fileUploadService.uploadMultipleImages(
          files,
          entityType,
        );

        clearInterval(progressInterval);

        // Mark all as completed
        setUploads((prev) =>
          prev.map((upload) =>
            newUploads.some((nu) => nu.id === upload.id)
              ? {
                  ...upload,
                  progress: 100,
                  status: 'completed' as const,
                }
              : upload,
          ),
        );

        onSuccess?.(response);
        return response;
      } catch (error) {
        const err = error as Error;

        setUploads((prev) =>
          prev.map((upload) =>
            newUploads.some((nu) => nu.id === upload.id)
              ? {
                  ...upload,
                  status: 'error' as const,
                  error: err.message,
                }
              : upload,
          ),
        );

        onError?.(err);
        return null;
      } finally {
        setIsUploading(false);
        setUploads((current) => {
          onProgress?.(current);
          return current;
        });
      }
    },
    [entityType, onSuccess, onError, onProgress],
  );

  /**
   * Upload with advanced options
   */
  const uploadAdvanced = useCallback(
    async (
      file: File,
      advancedOptions: Omit<AdvancedUploadOptions, 'entityType'>,
    ): Promise<UploadResponse | null> => {
      const uploadId = `${Date.now()}-${Math.random()}`;

      const newUpload: UploadProgress = {
        id: uploadId,
        file,
        progress: 0,
        status: 'uploading',
      };

      setUploads((prev) => [...prev, newUpload]);
      setIsUploading(true);

      try {
        const progressInterval = setInterval(() => {
          setUploads((prev) =>
            prev.map((upload) =>
              upload.id === uploadId && upload.progress < 90
                ? { ...upload, progress: upload.progress + 10 }
                : upload,
            ),
          );
        }, 100);

        const response = await fileUploadService.uploadAdvanced(file, {
          ...advancedOptions,
          entityType,
        });

        clearInterval(progressInterval);

        setUploads((prev) =>
          prev.map((upload) =>
            upload.id === uploadId
              ? {
                  ...upload,
                  progress: 100,
                  status: 'completed',
                  response,
                }
              : upload,
          ),
        );

        onSuccess?.(response);
        return response;
      } catch (error) {
        const err = error as Error;
        setUploads((prev) =>
          prev.map((upload) =>
            upload.id === uploadId
              ? {
                  ...upload,
                  status: 'error',
                  error: err.message,
                }
              : upload,
          ),
        );

        onError?.(err);
        return null;
      } finally {
        setIsUploading(false);
        setUploads((current) => {
          onProgress?.(current);
          return current;
        });
      }
    },
    [entityType, onSuccess, onError, onProgress],
  );

  /**
   * Delete a single image
   */
  const deleteImage = useCallback(
    async (fileUrl: string): Promise<DeleteResponse | null> => {
      try {
        const response = await fileUploadService.deleteImage(fileUrl);
        return response;
      } catch (error) {
        const err = error as Error;
        onError?.(err);
        return null;
      }
    },
    [onError],
  );

  /**
   * Delete multiple images
   */
  const deleteMultipleImages = useCallback(
    async (fileUrls: string[]): Promise<DeleteResponse | null> => {
      try {
        const response = await fileUploadService.deleteMultipleImages(fileUrls);
        return response;
      } catch (error) {
        const err = error as Error;
        onError?.(err);
        return null;
      }
    },
    [onError],
  );

  /**
   * Clear completed uploads
   */
  const clearCompleted = useCallback(() => {
    setUploads((prev) =>
      prev.filter((upload) => upload.status !== 'completed'),
    );
  }, []);

  /**
   * Clear all uploads
   */
  const clearAll = useCallback(() => {
    setUploads([]);
  }, []);

  /**
   * Remove a specific upload
   */
  const removeUpload = useCallback((id: string) => {
    setUploads((prev) => prev.filter((upload) => upload.id !== id));
  }, []);

  return {
    // State
    uploads,
    isUploading,

    // Upload methods
    uploadSingle,
    uploadMultiple,
    uploadAdvanced,

    // Delete methods
    deleteImage,
    deleteMultipleImages,

    // Management methods
    clearCompleted,
    clearAll,
    removeUpload,
  };
}
