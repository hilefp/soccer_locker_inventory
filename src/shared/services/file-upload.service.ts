/**
 * File Upload Service
 * Handles all file upload operations including single/multiple uploads,
 * compression, resizing, format conversion, and deletion
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

export type EntityType = 'product-brands' | 'products' | 'categories' | 'users';

export interface ResizeOptions {
  width?: number;
  height?: number;
  fit?: 'cover' | 'contain' | 'fill' | 'inside' | 'outside';
}

export interface CompressOptions {
  quality?: number; // 1-100
}

export interface AdvancedUploadOptions {
  entityType: EntityType;
  resize?: ResizeOptions;
  compress?: CompressOptions;
  format?: 'webp' | 'jpeg' | 'png';
}

export interface UploadResponse {
  url: string;
  originalName: string;
  filename: string;
  size: number;
  mimeType: string;
  width: number;
  height: number;
}

export interface MultipleUploadResponse {
  success: boolean;
  files: Array<{
    fileUrl: string;
    fileName?: string;
    fileSize?: number;
    mimeType?: string;
  }>;
}

export interface DeleteResponse {
  success: boolean;
  message?: string;
}

class FileUploadService {
  /**
   * Upload a single image
   */
  async uploadImage(
    file: File,
    entityType: EntityType,
  ): Promise<UploadResponse> {
    const formData = new FormData();
    formData.append('file', file);

    const url = `${API_BASE_URL}/file-upload/image?entityType=${entityType}`;
    console.log('Uploading to:', url);
    console.log('File:', file.name, file.type, file.size);

    const response = await fetch(url, {
      method: 'POST',
      body: formData,
    });

    console.log('Upload response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Upload failed:', errorText);
      throw new Error(`Upload failed: ${response.statusText}`);
    }

    const result = await response.json();
    console.log('Upload successful:', result);
    return result;
  }

  /**
   * Upload multiple images
   */
  async uploadMultipleImages(
    files: File[],
    entityType: EntityType,
  ): Promise<MultipleUploadResponse> {
    const formData = new FormData();
    files.forEach((file) => {
      formData.append('files', file);
    });

    const response = await fetch(
      `${API_BASE_URL}/file-upload/images?entityType=${entityType}`,
      {
        method: 'POST',
        body: formData,
      },
    );

    if (!response.ok) {
      throw new Error(`Upload failed: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Upload image with compression
   */
  async uploadCompressedImage(
    file: File,
    entityType: EntityType,
    quality: number = 80,
  ): Promise<UploadResponse> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(
      `${API_BASE_URL}/file-upload/image/compressed?entityType=${entityType}&quality=${quality}`,
      {
        method: 'POST',
        body: formData,
      },
    );

    if (!response.ok) {
      throw new Error(`Upload failed: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Upload image with resize
   */
  async uploadResizedImage(
    file: File,
    entityType: EntityType,
    width?: number,
    height?: number,
  ): Promise<UploadResponse> {
    const formData = new FormData();
    formData.append('file', file);

    const params = new URLSearchParams({ entityType });
    if (width) params.append('width', width.toString());
    if (height) params.append('height', height.toString());

    const response = await fetch(
      `${API_BASE_URL}/file-upload/image/resized?${params.toString()}`,
      {
        method: 'POST',
        body: formData,
      },
    );

    if (!response.ok) {
      throw new Error(`Upload failed: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Upload image as WebP format
   */
  async uploadAsWebP(
    file: File,
    entityType: EntityType,
  ): Promise<UploadResponse> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(
      `${API_BASE_URL}/file-upload/image/webp?entityType=${entityType}`,
      {
        method: 'POST',
        body: formData,
      },
    );

    if (!response.ok) {
      throw new Error(`Upload failed: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Advanced upload with all options
   */
  async uploadAdvanced(
    file: File,
    options: AdvancedUploadOptions,
  ): Promise<UploadResponse> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('entityType', options.entityType);

    if (options.resize) {
      formData.append('resize', JSON.stringify(options.resize));
    }

    if (options.compress) {
      formData.append('compress', JSON.stringify(options.compress));
    }

    if (options.format) {
      formData.append('format', options.format);
    }

    const response = await fetch(
      `${API_BASE_URL}/file-upload/image/advanced`,
      {
        method: 'POST',
        body: formData,
      },
    );

    if (!response.ok) {
      throw new Error(`Upload failed: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Delete a single image
   */
  async deleteImage(fileUrl: string): Promise<DeleteResponse> {
    const response = await fetch(`${API_BASE_URL}/file-upload/image`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ fileUrl }),
    });

    if (!response.ok) {
      throw new Error(`Delete failed: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Delete multiple images
   */
  async deleteMultipleImages(fileUrls: string[]): Promise<DeleteResponse> {
    const response = await fetch(`${API_BASE_URL}/file-upload/images`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ fileUrls }),
    });

    if (!response.ok) {
      throw new Error(`Delete failed: ${response.statusText}`);
    }

    return response.json();
  }
}

export const fileUploadService = new FileUploadService();
