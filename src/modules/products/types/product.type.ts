import { ProductCategory } from './product-category.type';
import { ProductBrand } from './product-brand.type';

export interface ProductVariantAttributes {
  [key: string]: string; // e.g., { "size": "M", "color": "Red" }
}

export interface ProductVariantDimensions {
  length?: number;
  width?: number;
  height?: number;
}

export interface ProductVariant {
  id?: string;
  productId?: string;

  sku: string;
  attributes: ProductVariantAttributes; // JSON object from Prisma

  price: number;
  compareAtPrice?: number;
  cost?: number;

  weight?: number;
  weightUnit?: string; // e.g., "kg", "lb"
  dimensions?: ProductVariantDimensions;
  dimensionUnit?: string; // e.g., "cm", "in"

  imageUrl?: string;
  imageUrls?: string[];
  isActive?: boolean;
  isDefault?: boolean;

  createdAt?: string;
  updatedAt?: string;
}

export interface ProductVariantRequest {
  sku?: string;
  attributes?: Record<string, string>;
  price?: number | string;
  compareAtPrice?: number | string;
  cost?: number | string;
  weight?: number | string;
  weightUnit?: string;
  dimensions?: string | ProductVariantDimensions;
  dimensionUnit?: string;
  imageUrl?: string;
  imageUrls?: string[];
  isActive?: boolean;
  minPrice?: number | string;
  maxPrice?: number | string;
}

export interface ProductRequest {
  name: string;
  description?: string;
  slug: string;
  model?: string;
  categoryId?: string;
  brandId?: string;
  imageUrl?: string | null;
  tags?: string[];
  imageUrls?: string[];
  isActive?: boolean;
  isFeatured?: boolean;
  sku?: string;
  barcode?: string;
  price?: number;
  cost?: number;
  variants?: ProductVariantRequest[];
}

export interface Product extends Omit<ProductRequest, 'variants'> {
  id?: string;
  category?: ProductCategory;
  brand?: ProductBrand;
  variants?: ProductVariant[];
  defaultVariant: ProductVariant;
  minPrice?: number;
  maxPrice?: number;
  createdAt?: string;
  updatedAt?: string;
}
