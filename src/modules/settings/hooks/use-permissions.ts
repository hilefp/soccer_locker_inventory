import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  permissionsService,
  rolePermissionsService,
} from '../services/permissions.service';
import type {
  CreatePermissionDto,
  UpdatePermissionDto,
  SetRolePermissionsDto,
} from '../types';

const PERMISSIONS_KEY = 'permissions';
const ROLE_PERMISSIONS_KEY = 'rolePermissions';
const ROLES_KEY = 'roles';

export function usePermissions() {
  return useQuery({
    queryKey: [PERMISSIONS_KEY],
    queryFn: () => permissionsService.getAll(),
  });
}

export function usePermissionsBySection(section: string | undefined) {
  return useQuery({
    queryKey: [PERMISSIONS_KEY, 'section', section],
    queryFn: () => permissionsService.getBySection(section!),
    enabled: !!section,
  });
}

export function useRolePermissions(roleId: string | undefined) {
  return useQuery({
    queryKey: [ROLE_PERMISSIONS_KEY, roleId],
    queryFn: () => rolePermissionsService.getRolePermissions(roleId!),
    enabled: !!roleId,
  });
}

export function useUserPermissions(userId: string | undefined) {
  return useQuery({
    queryKey: [PERMISSIONS_KEY, 'user', userId],
    queryFn: () => rolePermissionsService.getUserPermissions(userId!),
    enabled: !!userId,
  });
}

export function useCreatePermission() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreatePermissionDto) => permissionsService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [PERMISSIONS_KEY] });
    },
  });
}

export function useUpdatePermission() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdatePermissionDto }) =>
      permissionsService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [PERMISSIONS_KEY] });
    },
  });
}

export function useDeletePermission() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => permissionsService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [PERMISSIONS_KEY] });
    },
  });
}

export function useSetRolePermissions() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      roleId,
      data,
    }: {
      roleId: string;
      data: SetRolePermissionsDto;
    }) => rolePermissionsService.setRolePermissions(roleId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: [ROLE_PERMISSIONS_KEY, variables.roleId],
      });
      queryClient.invalidateQueries({ queryKey: [ROLES_KEY] });
    },
  });
}

export function useAssignPermissionToRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      roleId,
      permissionId,
    }: {
      roleId: string;
      permissionId: string;
    }) => rolePermissionsService.assignToRole(roleId, permissionId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: [ROLE_PERMISSIONS_KEY, variables.roleId],
      });
    },
  });
}

export function useRemovePermissionFromRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      roleId,
      permissionId,
    }: {
      roleId: string;
      permissionId: string;
    }) => rolePermissionsService.removeFromRole(roleId, permissionId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: [ROLE_PERMISSIONS_KEY, variables.roleId],
      });
    },
  });
}
