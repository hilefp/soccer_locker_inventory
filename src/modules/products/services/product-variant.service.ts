import { apiClient } from "@/shared/lib/api-client";
import { ProductVariant, ProductVariantRequest } from "@/modules/products/types/product.type";

export const productVariantService = {
  async getVariantsByProduct(productId: string): Promise<ProductVariant[]> {
    const response = await apiClient.get<ProductVariant[]>(`/inventory/product/${productId}/variants`);
    return response.data;
  },

  async getVariant(variantId: string): Promise<ProductVariant> {
    const response = await apiClient.get<ProductVariant>(`/inventory/variant/${variantId}`);
    return response.data;
  },

  async createVariant(productId: string, variant: ProductVariantRequest): Promise<ProductVariant> {
    const response = await apiClient.post<ProductVariant>(`/inventory/product/${productId}/variants`, variant);
    return response.data;
  },

  async updateVariant(variantId: string, variant: ProductVariantRequest): Promise<ProductVariant> {
    const response = await apiClient.put<ProductVariant>(`/inventory/variant/${variantId}`, variant);
    return response.data;
  },

  async deleteVariant(variantId: string): Promise<void> {
    await apiClient.delete(`/inventory/variant/${variantId}`);
  }
};
