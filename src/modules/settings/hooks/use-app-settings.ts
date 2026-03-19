import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { appSettingsService } from '../services/app-settings.service';
import type { UpdateAppSettingDto } from '../types';

const QUERY_KEY = 'appSettings';

export function useAppSettings() {
  return useQuery({
    queryKey: [QUERY_KEY],
    queryFn: () => appSettingsService.getAll(),
  });
}

export function useUpdateAppSetting() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ key, data }: { key: string; data: UpdateAppSettingDto }) =>
      appSettingsService.update(key, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    },
  });
}
