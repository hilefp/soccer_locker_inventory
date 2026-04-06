import { ClubProduct } from './club-product';

// ClubPackage entity
export interface ClubPackage {
  id: string;
  clubId: string;
  name: string;
  description?: string | null;
  price: number;
  imageUrls?: string[];
  tags?: string[];
  isActive: boolean;
  items: ClubPackageItem[];
  createdAt: string;
  updatedAt: string;
}

// Junction table: package → club product
export interface ClubPackageItem {
  id: string;
  clubPackageId: string;
  clubProductId: string;
  quantity: number;
  sortOrder: number;
  clubProduct?: ClubProduct;
}

// DTOs
export interface PackageItemDto {
  clubProductId: string;
  quantity: number;
  sortOrder?: number;
}

export interface CreateClubPackageDto {
  name: string;
  description?: string;
  price: number;
  imageUrls?: string[];
  tags?: string[];
  items: PackageItemDto[];
}

export interface UpdateClubPackageDto {
  name?: string;
  description?: string;
  price?: number;
  imageUrls?: string[];
  tags?: string[];
  isActive?: boolean;
  items?: PackageItemDto[];
}
