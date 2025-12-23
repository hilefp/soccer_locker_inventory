import { Product } from '@/modules/products/types/product.type';

// Main ClubProduct entity
export interface ClubProduct {
  id: string;
  clubId: string;
  productId: string;

  // Optional custom fields for this club
  name?: string | null; // Override product name
  price?: number | null; // Override product price
  description?: string | null; // Override product description
  imageUrls?: string[]; // Override product images

  // Club-specific fields
  isActive: boolean;
  stock: number;

  // Timestamps
  createdAt: string;
  updatedAt: string;

  // Relations
  product: Product; // Full product data
}

// DTO for creating club products
export interface CreateClubProductDto {
  productId: string;
  name?: string;
  price?: number;
  description?: string;
  imageUrls?: string[];
  isActive?: boolean;
  stock?: number;
}

// DTO for updating club products
export interface UpdateClubProductDto {
  name?: string;
  price?: number;
  description?: string;
  imageUrls?: string[];
  isActive?: boolean;
  stock?: number;
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
  inStock?: boolean;
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
export interface ClubProductStats {
  totalProducts: number;
  activeProducts: number;
  inactiveProducts: number;
  inStock: number;
  outOfStock: number;
}
