import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { rolesService, userRolesService } from '../services/users.service';
import type {
  CreateRoleDto,
  UpdateRoleDto,
  AssignRoleDto,
  RemoveRoleDto,
} from '../types';

const QUERY_KEY = 'roles';
const USER_QUERY_KEY = 'inventoryUsers';

export function useRoles(includeInactive = false) {
  return useQuery({
    queryKey: [QUERY_KEY, includeInactive],
    queryFn: () => rolesService.getAll(includeInactive),
  });
}

export function useRole(id: string | undefined) {
  return useQuery({
    queryKey: [QUERY_KEY, id],
    queryFn: () => rolesService.getById(id!),
    enabled: !!id,
  });
}

export function useRoleByName(name: string | undefined) {
  return useQuery({
    queryKey: [QUERY_KEY, 'name', name],
    queryFn: () => rolesService.getByName(name!),
    enabled: !!name,
  });
}

export function useCreateRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateRoleDto) => rolesService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    },
  });
}

export function useUpdateRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateRoleDto }) =>
      rolesService.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, variables.id] });
    },
  });
}

export function useDeleteRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => rolesService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    },
  });
}

export function useActivateRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => rolesService.activate(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, id] });
    },
  });
}

export function useDeactivateRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => rolesService.deactivate(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, id] });
    },
  });
}

export function useRoleUsers(roleId: string | undefined) {
  return useQuery({
    queryKey: [QUERY_KEY, roleId, 'users'],
    queryFn: () => rolesService.getRoleUsers(roleId!),
    enabled: !!roleId,
  });
}

export function useAssignRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: AssignRoleDto) => userRolesService.assignRole(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [USER_QUERY_KEY, variables.userId, 'roles'] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, variables.roleId, 'users'] });
    },
  });
}

export function useRemoveRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: RemoveRoleDto) => userRolesService.removeRole(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [USER_QUERY_KEY, variables.userId, 'roles'] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, variables.roleId, 'users'] });
    },
  });
}

export function useUpdateRoleExpiration() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      userId,
      roleId,
      expiresAt,
    }: {
      userId: string;
      roleId: string;
      expiresAt: string | null;
    }) => userRolesService.updateRoleExpiration(userId, roleId, expiresAt),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [USER_QUERY_KEY, variables.userId, 'roles'] });
    },
  });
}

export function useRemoveExpiredRoles() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => userRolesService.removeExpiredRoles(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [USER_QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    },
  });
}
