import { apiClient } from '@/shared/lib/api-client';
import type {
  ClubProduct,
  ClubProductsResponse,
  UpdateClubProductDto,
  AddProductsToClubDto,
  ClubProductFilters,
  ClubProductStats,
} from '../types/club-product';

export const clubProductsService = {
  // Get all products for a club with pagination/filtering
  async getClubProducts(
    clubId: string,
    params?: {
      page?: number;
      limit?: number;
      filters?: ClubProductFilters;
    }
  ): Promise<ClubProductsResponse> {
    const queryParams = {
      page: params?.page || 1,
      limit: params?.limit || 10,
      ...params?.filters,
    };

    const response = await apiClient.get<ClubProductsResponse>(
      `/admin/clubs/${clubId}/products`,
      { params: queryParams }
    );
    return response.data;
  },

  // Add multiple products to club at once
  async addProductsToClub(
    clubId: string,
    data: AddProductsToClubDto
  ): Promise<ClubProduct[]> {
    const response = await apiClient.post<ClubProduct[]>(
      `/admin/clubs/${clubId}/products`,
      data
    );
    return response.data;
  },

  // Update a specific club product (custom name, price, etc.)
  async updateClubProduct(
    clubId: string,
    clubProductId: string,
    data: UpdateClubProductDto
  ): Promise<ClubProduct> {
    const response = await apiClient.put<ClubProduct>(
      `/admin/clubs/${clubId}/products/${clubProductId}`,
      data
    );
    return response.data;
  },

  // Remove product from club
  async removeClubProduct(
    clubId: string,
    clubProductId: string
  ): Promise<void> {
    await apiClient.delete(`/admin/clubs/${clubId}/products/${clubProductId}`);
  },

  // Get stats for club products
  async getClubProductStats(clubId: string): Promise<ClubProductStats> {
    const response = await apiClient.get<ClubProductStats>(
      `/shop/clubs/${clubId}/products/stats`
    );
    return response.data;
  },
};
