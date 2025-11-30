import { apiClient } from '@/shared/lib/api-client';
import type {
  InventoryUser,
  CreateInventoryUserDto,
  UpdateInventoryUserDto,
  UserStatus,
  Role,
  CreateRoleDto,
  UpdateRoleDto,
  AssignRoleDto,
  RemoveRoleDto,
  UserRole,
} from '../types';

const BASE_URL = '/inventory/users';

// ==================== INVENTORY USERS API ====================

export const usersService = {
  async getAll(): Promise<InventoryUser[]> {
    const response = await apiClient.get<InventoryUser[]>(BASE_URL);
    return response.data;
  },

  async getById(id: string): Promise<InventoryUser> {
    const response = await apiClient.get<InventoryUser>(`${BASE_URL}/${id}`);
    return response.data;
  },

  async create(data: CreateInventoryUserDto): Promise<InventoryUser> {
    const response = await apiClient.post<InventoryUser>(BASE_URL, data);
    return response.data;
  },

  async update(id: string, data: UpdateInventoryUserDto): Promise<InventoryUser> {
    const response = await apiClient.put<InventoryUser>(`${BASE_URL}/${id}`, data);
    return response.data;
  },

  async delete(id: string): Promise<void> {
    await apiClient.delete(`${BASE_URL}/${id}`);
  },

  async updateStatus(id: string, status: UserStatus): Promise<InventoryUser> {
    const response = await apiClient.patch<InventoryUser>(
      `${BASE_URL}/${id}/status/${status}`
    );
    return response.data;
  },

  async getUserRoles(userId: string): Promise<UserRole[]> {
    const response = await apiClient.get<UserRole[]>(`${BASE_URL}/${userId}/roles`);
    return response.data;
  },
};

// ==================== ROLES API ====================

export const rolesService = {
  async getAll(includeInactive = false): Promise<Role[]> {
    const response = await apiClient.get<Role[]>(`${BASE_URL}/roles`, {
      params: { includeInactive },
    });
    return response.data;
  },

  async getById(id: string): Promise<Role> {
    const response = await apiClient.get<Role>(`${BASE_URL}/roles/${id}`);
    return response.data;
  },

  async getByName(name: string): Promise<Role> {
    const response = await apiClient.get<Role>(`${BASE_URL}/roles/name/${name}`);
    return response.data;
  },

  async create(data: CreateRoleDto): Promise<Role> {
    const response = await apiClient.post<Role>(`${BASE_URL}/roles`, data);
    return response.data;
  },

  async update(id: string, data: UpdateRoleDto): Promise<Role> {
    const response = await apiClient.put<Role>(`${BASE_URL}/roles/${id}`, data);
    return response.data;
  },

  async delete(id: string): Promise<void> {
    await apiClient.delete(`${BASE_URL}/roles/${id}`);
  },

  async activate(id: string): Promise<Role> {
    const response = await apiClient.patch<Role>(`${BASE_URL}/roles/${id}/activate`);
    return response.data;
  },

  async deactivate(id: string): Promise<Role> {
    const response = await apiClient.patch<Role>(`${BASE_URL}/roles/${id}/deactivate`);
    return response.data;
  },

  async getRoleUsers(roleId: string): Promise<InventoryUser[]> {
    const response = await apiClient.get<InventoryUser[]>(
      `${BASE_URL}/roles/${roleId}/users`
    );
    return response.data;
  },
};

// ==================== ROLE ASSIGNMENTS API ====================

export const userRolesService = {
  async assignRole(data: AssignRoleDto): Promise<UserRole> {
    const response = await apiClient.post<UserRole>(
      `${BASE_URL}/role-assignments`,
      data
    );
    return response.data;
  },

  async removeRole(data: RemoveRoleDto): Promise<void> {
    await apiClient.delete(`${BASE_URL}/role-assignments`, { data });
  },

  async updateRoleExpiration(
    userId: string,
    roleId: string,
    expiresAt: string | null
  ): Promise<UserRole> {
    const response = await apiClient.patch<UserRole>(
      `${BASE_URL}/role-assignments/${userId}/${roleId}/expiration`,
      { expiresAt }
    );
    return response.data;
  },

  async removeExpiredRoles(): Promise<{ count: number }> {
    const response = await apiClient.delete<{ count: number }>(
      `${BASE_URL}/role-assignments/expired`
    );
    return response.data;
  },
};
