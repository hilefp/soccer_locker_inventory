import { apiClient } from '@/shared/lib/api-client';
import type {
  ClubPackage,
  CreateClubPackageDto,
  UpdateClubPackageDto,
} from '../types/club-package';

export const clubPackagesService = {
  // Get all packages for a club (admin)
  async getClubPackages(clubId: string): Promise<ClubPackage[]> {
    const response = await apiClient.get<ClubPackage[]>(
      `/admin/clubs/${clubId}/packages`
    );
    return response.data;
  },

  // Get a single package (admin)
  async getClubPackage(clubId: string, packageId: string): Promise<ClubPackage> {
    const response = await apiClient.get<ClubPackage>(
      `/admin/clubs/${clubId}/packages/${packageId}`
    );
    return response.data;
  },

  // Create a package
  async createClubPackage(
    clubId: string,
    data: CreateClubPackageDto
  ): Promise<ClubPackage> {
    const response = await apiClient.post<ClubPackage>(
      `/admin/clubs/${clubId}/packages`,
      data
    );
    return response.data;
  },

  // Update a package
  async updateClubPackage(
    clubId: string,
    packageId: string,
    data: UpdateClubPackageDto
  ): Promise<ClubPackage> {
    const response = await apiClient.put<ClubPackage>(
      `/admin/clubs/${clubId}/packages/${packageId}`,
      data
    );
    return response.data;
  },

  // Delete a package
  async deleteClubPackage(clubId: string, packageId: string): Promise<void> {
    await apiClient.delete(`/admin/clubs/${clubId}/packages/${packageId}`);
  },

  // Shop: get packages for a club
  async getShopClubPackages(clubId: string): Promise<ClubPackage[]> {
    const response = await apiClient.get<ClubPackage[]>(
      `/shop/clubs/${clubId}/packages`
    );
    return response.data;
  },

  // Shop: get a single package detail
  async getShopClubPackage(
    clubId: string,
    packageId: string
  ): Promise<ClubPackage> {
    const response = await apiClient.get<ClubPackage>(
      `/shop/clubs/${clubId}/packages/${packageId}`
    );
    return response.data;
  },
};
