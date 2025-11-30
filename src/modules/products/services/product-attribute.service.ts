import { apiClient } from '@/shared/lib/api-client';
import { ProductAttribute, ProductAttributeRequest } from '@/modules/products/types/product-attribute.type';

const API_BASE_URL = '/inventory/product-attribute';

export const productAttributeService = {
  // Get all product attributes
  getProductAttributes: async (): Promise<ProductAttribute[]> => {
    const response = await apiClient.get<ProductAttribute[]>(API_BASE_URL);
    return response.data;
  },

  // Get a single product attribute by ID
  getProductAttributeById: async (id: string): Promise<ProductAttribute> => {
    const response = await apiClient.get<ProductAttribute>(`${API_BASE_URL}/${id}`);
    return response.data;
  },

  // Create a new product attribute
  createProductAttribute: async (data: ProductAttributeRequest): Promise<ProductAttribute> => {
    const response = await apiClient.post<ProductAttribute>(API_BASE_URL, data);
    return response.data;
  },

  // Update an existing product attribute
  updateProductAttribute: async (id: string, data: ProductAttributeRequest): Promise<ProductAttribute> => {
    const response = await apiClient.put<ProductAttribute>(`${API_BASE_URL}/${id}`, data);
    return response.data;
  },

  // Delete a product attribute
  deleteProductAttribute: async (id: string): Promise<void> => {
    await apiClient.delete(`${API_BASE_URL}/${id}`);
  },
};
