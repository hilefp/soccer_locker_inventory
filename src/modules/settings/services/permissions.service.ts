import { apiClient } from '@/shared/lib/api-client';
import type {
  Permission,
  CreatePermissionDto,
  UpdatePermissionDto,
  RolePermission,
  SetRolePermissionsDto,
} from '../types';

const BASE_URL = '/inventory/users';

// ==================== PERMISSIONS CRUD ====================

export const permissionsService = {
  async getAll(): Promise<Permission[]> {
    const response = await apiClient.get<Permission[]>(`${BASE_URL}/permissions`);
    return response.data;
  },

  async getById(id: string): Promise<Permission> {
    const response = await apiClient.get<Permission>(`${BASE_URL}/permissions/${id}`);
    return response.data;
  },

  async getBySection(section: string): Promise<Permission[]> {
    const response = await apiClient.get<Permission[]>(
      `${BASE_URL}/permissions/section/${section}`
    );
    return response.data;
  },

  async create(data: CreatePermissionDto): Promise<Permission> {
    const response = await apiClient.post<Permission>(`${BASE_URL}/permissions`, data);
    return response.data;
  },

  async update(id: string, data: UpdatePermissionDto): Promise<Permission> {
    const response = await apiClient.put<Permission>(
      `${BASE_URL}/permissions/${id}`,
      data
    );
    return response.data;
  },

  async delete(id: string): Promise<void> {
    await apiClient.delete(`${BASE_URL}/permissions/${id}`);
  },
};

// ==================== ROLE-PERMISSION ASSIGNMENTS ====================

export const rolePermissionsService = {
  async getRolePermissions(roleId: string): Promise<RolePermission[]> {
    const response = await apiClient.get<RolePermission[]>(
      `${BASE_URL}/roles/${roleId}/permissions`
    );
    return response.data;
  },

  async assignToRole(roleId: string, permissionId: string): Promise<RolePermission> {
    const response = await apiClient.post<RolePermission>(
      `${BASE_URL}/roles/${roleId}/permissions/${permissionId}`
    );
    return response.data;
  },

  async removeFromRole(roleId: string, permissionId: string): Promise<void> {
    await apiClient.delete(
      `${BASE_URL}/roles/${roleId}/permissions/${permissionId}`
    );
  },

  async setRolePermissions(
    roleId: string,
    data: SetRolePermissionsDto
  ): Promise<RolePermission[]> {
    const response = await apiClient.put<RolePermission[]>(
      `${BASE_URL}/roles/${roleId}/permissions`,
      data
    );
    return response.data;
  },

  async getUserPermissions(userId: string): Promise<Permission[]> {
    const response = await apiClient.get<Permission[]>(
      `${BASE_URL}/${userId}/permissions`
    );
    return response.data;
  },
};
