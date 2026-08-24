import { useQuery } from '@tanstack/react-query';
import { CONFIG } from '../constants/config';
import { request } from '../utils/api';

export function useFavorites(telegramUser) {
  const query = useQuery({
    queryKey: ['favorites', telegramUser?.id ?? null],
    queryFn: async ({ signal }) => {
      const data = await request(`${CONFIG.API.BASE_URL}/favorites`, { skipAuth: false, signal });
      return Array.isArray(data?.items) ? data.items : [];
    },
    enabled: Boolean(telegramUser?.id && localStorage.getItem(CONFIG.STORAGE_KEYS.AUTH_TOKEN)),
    staleTime: 60_000,
  });

  return {
    favoriteItems: query.data || [],
    isLoadingFavorites: query.isPending,
    favoriteQueryError: query.error,
    retryFavorites: query.refetch,
  };
}
