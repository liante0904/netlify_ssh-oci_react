import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CONFIG } from '../constants/config';
import { request } from '../utils/api';

export function useFavoriteSync() {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: (reportIds) => Promise.allSettled(
      reportIds.map((id) => request(`${CONFIG.API.BASE_URL}/favorites/${id}`, {
        method: 'POST',
        skipAuth: false,
      }))
    ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['favorites'] });
      queryClient.invalidateQueries({ queryKey: ['reports'] });
    },
  });

  return {
    syncFavoriteIds: mutation.mutate,
    isSyncingFavorites: mutation.isPending,
  };
}
