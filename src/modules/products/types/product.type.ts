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
  barcode?: string;
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

  // Inventory Management
  trackInventory?: boolean; // If true, check stock before allowing purchase
  allowBackorder?: boolean; // If true, allow purchase even when out of stock (with notification)
  lowStockThreshold?: number; // Threshold to show low stock warning

  createdAt?: string;
  updatedAt?: string;
}

export interface ProductVariantRequest {
  sku: string;
  barcode?: string;
  attributes: ProductVariantAttributes;

  price: number;
  compareAtPrice?: number;
  cost?: number;

  weight?: number;
  weightUnit?: string;
  dimensions?: ProductVariantDimensions;
  dimensionUnit?: string;

  imageUrl?: string;
  imageUrls?: string[];
  isActive?: boolean;
  minPrice?: number | string;
  maxPrice?: number | string;

  // Inventory Management
  trackInventory?: boolean;
  allowBackorder?: boolean;
  lowStockThreshold?: number;
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
  price?: number;
  variants?: ProductVariantRequest[];
}

export interface Product extends ProductRequest {
  id?: string;
  category?: ProductCategory;
  brand?: ProductBrand;
  variants?: ProductVariant[];
  defaultVariant: ProductVariantRequest;
  minPrice?: number;
  maxPrice?: number;
  createdAt?: string;
  updatedAt?: string;
}
