import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CONFIG } from '../constants/config';
import { request } from '../utils/api';

export function useFavoriteMutation(telegramUser) {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: ({ id, isAdding }) => request(`${CONFIG.API.BASE_URL}/favorites/${id}`, {
      method: isAdding ? 'POST' : 'DELETE',
      skipAuth: false,
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['favorites'] });
      queryClient.invalidateQueries({ queryKey: ['reports'] });
    },
  });

  const mutateFavorite = (id, isAdding) => {
    if (!telegramUser || !localStorage.getItem(CONFIG.STORAGE_KEYS.AUTH_TOKEN)) return null;
    return mutation.mutateAsync({ id, isAdding });
  };

  return {
    mutateFavorite,
    isUpdatingFavorite: mutation.isPending,
    favoriteMutationError: mutation.error,
  };
}
