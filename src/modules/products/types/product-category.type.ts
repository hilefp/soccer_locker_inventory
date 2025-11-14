export interface productCategoryRequest {
    name: string;
    description: string;
    slug: string;
    isActive: boolean;
    parentId?: string;
    imageUrl?: string | null;
}

export interface ProductCategory extends productCategoryRequest {
    id?: string;
    createdAt?: string;
    updatedAt?: string;
}