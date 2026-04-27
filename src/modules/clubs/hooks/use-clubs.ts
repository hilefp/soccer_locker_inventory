import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { clubsService } from '../services/clubs.service';
import type { Club, CreateClubDto, ReorderClubsDto, UpdateClubDto } from '../types';
import { toast } from 'sonner';

const QUERY_KEY = 'clubs';

export function useClubs() {
  return useQuery({
    queryKey: [QUERY_KEY],
    queryFn: () => clubsService.getAll(),
  });
}

export function useClub(id: string | undefined) {
  return useQuery({
    queryKey: [QUERY_KEY, id],
    queryFn: () => clubsService.getById(id!),
    enabled: !!id,
  });
}

export function useCreateClub() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateClubDto) => clubsService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      toast.success('Club created successfully');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to create club');
    },
  });
}

export function useUpdateClub() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateClubDto }) =>
      clubsService.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, variables.id] });
      toast.success('Club updated successfully');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to update club');
    },
  });
}

export function useDeleteClub() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => clubsService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      toast.success('Club deleted successfully');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to delete club');
    },
  });
}

export function useReorderClubs() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: ReorderClubsDto) => clubsService.reorder(data),
    onMutate: async (data) => {
      await queryClient.cancelQueries({ queryKey: [QUERY_KEY] });

      const previousClubs = queryClient.getQueryData<Club[]>([QUERY_KEY]);

      if (previousClubs) {
        const reordered = data.ids.map((id, index) => {
          const club = previousClubs.find((c) => c.id === id)!;
          return { ...club, sortPosition: index };
        });
        queryClient.setQueryData([QUERY_KEY], reordered);
      }

      return { previousClubs };
    },
    onError: (error: any, _data, context) => {
      if (context?.previousClubs) {
        queryClient.setQueryData([QUERY_KEY], context.previousClubs);
      }
      toast.error(error?.response?.data?.message || 'Failed to reorder clubs');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    },
  });
}
