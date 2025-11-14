import { apiClient } from "@/shared/lib/api-client";
import { ProductCategory, productCategoryRequest } from "@/modules/products/types/product-category.type";

export const productCategoryService = {
    async getProductCategories(): Promise<ProductCategory[]> {
        const response = await apiClient.get<ProductCategory[]>('/inventory/product-category');
        return response.data;
    },

    async createProductCategory(productCategory: productCategoryRequest): Promise<ProductCategory> {
        const response = await apiClient.post<ProductCategory>('/inventory/product-category', productCategory);
        return response.data;
    },
    async updateProductCategory(id: string, productCategory: productCategoryRequest): Promise<ProductCategory> {
        const response = await apiClient.put<ProductCategory>(`/inventory/product-category/${id}`, productCategory);
        return response.data;
    },
    async deleteProductCategory(id: string): Promise<void> {
        await apiClient.delete(`/inventory/product-category/${id}`);
    }

}