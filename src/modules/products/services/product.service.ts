import { apiClient } from "@/shared/lib/api-client";
import { Product, ProductRequest } from "@/modules/products/types/product.type";

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
  }
};
