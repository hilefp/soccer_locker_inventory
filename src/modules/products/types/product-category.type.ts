export interface productCategoryRequest {
    name: string;
    description: string;
    slug: string;
    isActive: boolean;
    parentId?: string;
    imageUrl?: string;
}

export interface ProductCategory extends productCategoryRequest {
    id?: string;
    createdAt?: string;
    updatedAt?: string;
}