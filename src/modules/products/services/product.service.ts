import { apiClient } from "@/shared/lib/api-client";
import { Product, ProductRequest, ProductVariant, ProductVariantRequest } from "@/modules/products/types/product.type";

export interface GenerateVariationsRequest {
  productId: string;
  attributeIds: string[];
}

export interface GenerateVariationsResponse {
  success: boolean;
  variants: ProductVariant[];
  message?: string;
}

export const productService = {
  async getProducts(): Promise<Product[]> {
    const response = await apiClient.get<Product[]>('/inventory/product');
    return response.data;
  },

  async getProduct(id: string): Promise<Product> {
    const response = await apiClient.get<Product>(`/inventory/product/${id}`);
    return response.data;
  },

  async createProduct(product: ProductRequest): Promise<Product> {
    const response = await apiClient.post<Product>('/inventory/product', product);
    return response.data;
  },

  async updateProduct(id: string, product: ProductRequest): Promise<Product> {
    const response = await apiClient.put<Product>(`/inventory/product/${id}`, product);
    return response.data;
  },

  async deleteProduct(id: string): Promise<void> {
    await apiClient.delete(`/inventory/product/${id}`);
  },

  async generateVariations(data: GenerateVariationsRequest): Promise<GenerateVariationsResponse> {
    const response = await apiClient.post<GenerateVariationsResponse>(
      '/inventory/product-variant/generate-variations',
      data
    );
    return response.data;
  },

  // Variant-specific methods
  async updateVariant(id: string, data: ProductVariantRequest): Promise<ProductVariant> {
    const response = await apiClient.put<ProductVariant>(
      `/inventory/product-variant/${id}`,
      data
    );
    return response.data;
  },

  async deleteVariant(id: string): Promise<void> {
    await apiClient.delete(`/inventory/product-variant/${id}`);
  }
};
