export interface ProductBrandRequest {
  name: string;
  description?: string;
  slug: string;
  imageUrl?: string;
  websiteUrl?: string;
  code: string;
  isActive: boolean;
  metadata?: any;
}

export interface ProductBrand extends ProductBrandRequest {
  id?: string;
  createdAt?: string;
  updatedAt?: string;
}
