import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { usersService } from '../services/users.service';
import type {
  CreateInventoryUserDto,
  UpdateInventoryUserDto,
  UserStatus,
} from '../types';

const QUERY_KEY = 'inventoryUsers';

export function useInventoryUsers() {
  return useQuery({
    queryKey: [QUERY_KEY],
    queryFn: () => usersService.getAll(),
  });
}

export function useInventoryUser(id: string | undefined) {
  return useQuery({
    queryKey: [QUERY_KEY, id],
    queryFn: () => usersService.getById(id!),
    enabled: !!id,
  });
}

export function useCreateInventoryUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateInventoryUserDto) => usersService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    },
  });
}

export function useUpdateInventoryUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateInventoryUserDto }) =>
      usersService.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, variables.id] });
    },
  });
}

export function useDeleteInventoryUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => usersService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    },
  });
}

export function useUpdateUserStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: UserStatus }) =>
      usersService.updateStatus(id, status),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, variables.id] });
    },
  });
}

export function useUserRoles(userId: string | undefined) {
  return useQuery({
    queryKey: [QUERY_KEY, userId, 'roles'],
    queryFn: () => usersService.getUserRoles(userId!),
    enabled: !!userId,
  });
}
