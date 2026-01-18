import { Product } from '@/modules/products/types/product.type';
import { CustomFields } from './custom-fields';

// Main ClubProduct entity
export interface ClubProduct {
  id: string;
  clubId: string;
  productId: string;

  // Optional custom fields for this club
  name?: string | null; // Override product name
  price?: string | null; // Override product price (can be a range like "$20.00 - $40.00")
  description?: string | null; // Override product description
  imageUrls?: string[]; // Override product images

  // Club-specific fields
  isActive: boolean;

  // Timestamps
  createdAt: string;
  updatedAt: string;

  // Relations
  product: Product; // Full product data
  customFields?: CustomFields[];
}

// DTO for creating club products
export interface CreateClubProductDto {
  productId: string;
  name?: string;
  price?: string;
  description?: string;
  imageUrls?: string[];
  isActive?: boolean;
}

// DTO for updating club products
export interface UpdateClubProductDto {
  name?: string;
  price?: string;
  description?: string;
  imageUrls?: string[];
  isActive?: boolean;
  customFields?: CustomFields[];
}

// DTO for bulk adding products
export interface AddProductsToClubDto {
  products: CreateClubProductDto[];
}

// Filter and pagination
export interface ClubProductFilters {
  search?: string;
  isActive?: boolean;
  minPrice?: number;
  maxPrice?: number;
}

export interface ClubProductsResponse {
  data: ClubProduct[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

// Stats response
export interface  ClubProductStats {
  total: number;
  active: number;
  inactive: number;
}
