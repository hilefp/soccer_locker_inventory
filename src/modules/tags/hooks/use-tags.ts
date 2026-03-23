import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { tagsService } from '../services/tags.service';
import type { CreateTagDto, ReorderTagsDto, Tag, UpdateTagDto } from '../types/tag';

const QUERY_KEY = 'tags';

export function useTags(includeInactive?: boolean) {
  return useQuery({
    queryKey: [QUERY_KEY, { includeInactive }],
    queryFn: () => tagsService.getAll(includeInactive),
  });
}

export function useTag(id: string | undefined) {
  return useQuery({
    queryKey: [QUERY_KEY, id],
    queryFn: () => tagsService.getById(id!),
    enabled: !!id,
  });
}

export function useCreateTag() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateTagDto) => tagsService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    },
  });
}

export function useUpdateTag() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateTagDto }) =>
      tagsService.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, variables.id] });
    },
  });
}

export function useDeleteTag() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => tagsService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    },
  });
}

export function useReorderTags() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: ReorderTagsDto) => tagsService.reorder(data),
    onMutate: async (data) => {
      await queryClient.cancelQueries({ queryKey: [QUERY_KEY] });

      const previousTags = queryClient.getQueryData<Tag[]>([
        QUERY_KEY,
        { includeInactive: true },
      ]);

      if (previousTags) {
        const reordered = data.ids.map((id, index) => {
          const tag = previousTags.find((t) => t.id === id)!;
          return { ...tag, sortPosition: index };
        });
        queryClient.setQueryData(
          [QUERY_KEY, { includeInactive: true }],
          reordered,
        );
      }

      return { previousTags };
    },
    onError: (_err, _data, context) => {
      if (context?.previousTags) {
        queryClient.setQueryData(
          [QUERY_KEY, { includeInactive: true }],
          context.previousTags,
        );
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    },
  });
}
