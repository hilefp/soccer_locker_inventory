import { apiClient } from '@/shared/lib/api-client';
import type {
  ClubProduct,
  ClubProductsResponse,
  UpdateClubProductDto,
  AddProductsToClubDto,
  ClubProductFilters,
  ClubProductStats,
  GroupClubProductsDto,
  UpdateGroupDto,
  ClubProductGroup,
  ClubProductAvailableVariantsResponse,
} from '../types/club-product';
import { CustomFields } from '../types';

export const defaultFields: CustomFields[] = [
  {
    key: "playerName",
    type: "text",
    required: true,
    label: "Player name",
    placeholder: "",
  },
  {
    key: "playerNumber",
    type: "number",
    required: true,
    label: "Player number",
    placeholder: "",
  },
  {
    key: "playerBirthYear",
    type: "date",
    required: true,
    label: "Player birth year",
    placeholder: "",
  },
  {
    key: "coachName",
    type: "text",
    required: true,
    label: "Coach",
    placeholder: "",
  },
  {
    key: "locationBase",
    type: "select",
    required: true,
    label: "Location (Base/Miami)",
    placeholder: "Select a location",
    options: [
      "BASE/MIAMI",
      "JACKSONVILLE",
      "NORTH ATLANTA",
      "ORLANDO",
      "RALEIGH",
      "SOUTH DADE",
      "SYRACUSE",
      "WESTON",
      "NAPA",
    ],
  },
  {
    key: "locationOpaLocka",
    type: "select",
    required: true,
    label: "Location (Opa-Locka)",
    placeholder: "Select a location",
    options: [
      "OPA-LOCKA",
      "JACKSONVILLE",
      "NORTH ATLANTA",
      "ORLANDO",
      "RALEIGH",
      "SOUTH DADE",
      "SYRACUSE",
      "WESTON",
      "NAPA",
    ],
  },
  {
    key: "gauchito",
    type: "select",
    required: true,
    label: "Gauchito",
    placeholder: "Select an option",
    options: [
      "GAUCHITO",
      "GAUCHITA",
    ],
  },
];

export const clubProductsService = {
  // Get a single club product by ID
  async getClubProduct(
    clubId: string,
    clubProductId: string
  ): Promise<ClubProduct> {
    const response = await apiClient.get<ClubProduct>(
      `/admin/clubs/${clubId}/products/${clubProductId}`
    );
    return response.data;
  },

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

  // Get available tags for a club's products
  async getClubProductTags(clubId: string): Promise<string[]> {
    const response = await apiClient.get<string[]>(
      `/admin/clubs/${clubId}/products/tags`
    );
    return response.data;
  },

  // Get stats for club products
  async getClubProductStats(clubId: string): Promise<ClubProductStats> {
    const response = await apiClient.get<ClubProductStats>(
      `/shop/clubs/${clubId}/products/stats`
    );
    return response.data;
  },

  // Group club products together
  async groupClubProducts(
    clubId: string,
    data: GroupClubProductsDto
  ): Promise<ClubProductGroup> {
    const response = await apiClient.post<ClubProductGroup>(
      `/admin/clubs/${clubId}/products/groups`,
      data
    );
    return response.data;
  },

  // Get all groups for a club
  async getClubProductGroups(clubId: string): Promise<ClubProductGroup[]> {
    const response = await apiClient.get<ClubProductGroup[]>(
      `/admin/clubs/${clubId}/products/groups`
    );
    return response.data;
  },

  // Update a group
  async updateGroup(
    clubId: string,
    groupId: string,
    data: UpdateGroupDto
  ): Promise<ClubProductGroup> {
    const response = await apiClient.put<ClubProductGroup>(
      `/admin/clubs/${clubId}/products/groups/${groupId}`,
      data
    );
    return response.data;
  },

  // Dissolve a group
  async ungroupClubProducts(
    clubId: string,
    groupId: string
  ): Promise<void> {
    await apiClient.delete(
      `/admin/clubs/${clubId}/products/groups/${groupId}`
    );
  },

  // Get available variants for a club product
  async getClubProductAvailableVariants(
    clubId: string,
    clubProductId: string
  ): Promise<ClubProductAvailableVariantsResponse> {
    const response = await apiClient.get<ClubProductAvailableVariantsResponse>(
      `/admin/clubs/${clubId}/products/${clubProductId}/variants`
    );
    return response.data;
  },
};


export const defaultFieldsMap = new Map<string, CustomFields>(
  defaultFields
    .filter((field): field is CustomFields & { key: string } => typeof field.key === 'string')
    .map((field) => [field.key, field] as [string, CustomFields])
);
