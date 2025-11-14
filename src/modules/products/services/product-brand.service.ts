import { apiClient } from "@/shared/lib/api-client";
import { ProductBrand, ProductBrandRequest } from "@/modules/products/types/product-brand.type";

export const productBrandService = {
  async getProductBrands(): Promise<ProductBrand[]> {
    const response = await apiClient.get<ProductBrand[]>('/inventory/product-brand');
    return response.data;
  },

  async createProductBrand(productBrand: ProductBrandRequest): Promise<ProductBrand> {
    const response = await apiClient.post<ProductBrand>('/inventory/product-brand', productBrand);
    return response.data;
  },

  async updateProductBrand(id: string, productBrand: ProductBrandRequest): Promise<ProductBrand> {
    const response = await apiClient.put<ProductBrand>(`/inventory/product-brand/${id}`, productBrand);
    return response.data;
  },

  async deleteProductBrand(id: string): Promise<void> {
    await apiClient.delete(`/inventory/product-brand/${id}`);
  }
};
