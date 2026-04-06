import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { clubPackagesService } from '../services/club-packages.service';
import type {
  CreateClubPackageDto,
  UpdateClubPackageDto,
} from '../types/club-package';

const CLUB_PACKAGES_QUERY_KEY = 'club-packages';
const CLUB_PACKAGE_QUERY_KEY = 'club-package';

// Get all packages for a club
export function useClubPackages(clubId: string | undefined) {
  return useQuery({
    queryKey: [CLUB_PACKAGES_QUERY_KEY, clubId],
    queryFn: () => clubPackagesService.getClubPackages(clubId!),
    enabled: !!clubId,
  });
}

// Get a single package
export function useClubPackage(
  clubId: string | undefined,
  packageId: string | undefined
) {
  return useQuery({
    queryKey: [CLUB_PACKAGE_QUERY_KEY, clubId, packageId],
    queryFn: () => clubPackagesService.getClubPackage(clubId!, packageId!),
    enabled: !!clubId && !!packageId,
  });
}

// Create a package
export function useCreateClubPackage(clubId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateClubPackageDto) =>
      clubPackagesService.createClubPackage(clubId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [CLUB_PACKAGES_QUERY_KEY, clubId],
      });
      toast.success('Package created successfully');
    },
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message || 'Failed to create package'
      );
    },
  });
}

// Update a package
export function useUpdateClubPackage(clubId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      packageId,
      data,
    }: {
      packageId: string;
      data: UpdateClubPackageDto;
    }) => clubPackagesService.updateClubPackage(clubId, packageId, data),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: [CLUB_PACKAGES_QUERY_KEY, clubId],
      });
      queryClient.invalidateQueries({
        queryKey: [CLUB_PACKAGE_QUERY_KEY, clubId, variables.packageId],
      });
      toast.success('Package updated successfully');
    },
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message || 'Failed to update package'
      );
    },
  });
}

// Delete a package
export function useDeleteClubPackage(clubId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (packageId: string) =>
      clubPackagesService.deleteClubPackage(clubId, packageId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [CLUB_PACKAGES_QUERY_KEY, clubId],
      });
      toast.success('Package deleted successfully');
    },
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message || 'Failed to delete package'
      );
    },
  });
}
