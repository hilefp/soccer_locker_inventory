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
  tags?: string[];
  isActive: boolean;

  // Grouping fields
  groupId?: string | null;
  isGroupPrimary?: boolean;
  packagePrice?: number | null;
  packageDescription?: string | null;

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
  tags?: string[];
  groupId?: string;
  isGroupPrimary?: boolean;
}

// DTO for updating club products
export interface UpdateClubProductDto {
  name?: string;
  price?: string;
  description?: string;
  imageUrls?: string[];
  isActive?: boolean;
  customFields?: CustomFields[];
  tags?: string[];
  groupId?: string;
  isGroupPrimary?: boolean;
}

// DTO for grouping club products
export interface GroupClubProductsDto {
  clubProductIds: string[];
  primaryClubProductId: string;
  packageName?: string;
  packagePrice?: number;
  packageDescription?: string;
}

// DTO for updating a group
export interface UpdateGroupDto {
  addClubProductIds?: string[];
  removeClubProductIds?: string[];
  primaryClubProductId?: string;
  packageName?: string;
  packagePrice?: number;
  packageDescription?: string;
}

// Group response from the API
export interface ClubProductGroup {
  groupId: string;
  packageName?: string | null;
  packageDescription?: string | null;
  packagePrice?: number | null;
  memberCount?: number;
  primary: ClubProduct;
  members: ClubProduct[];
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
