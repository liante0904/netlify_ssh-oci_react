import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { CONFIG } from '../constants/config';
import { request } from '../utils/api';

export function useNotificationReadStatus(telegramUser) {
  const queryClient = useQueryClient();
  const queryKey = ['notification-read-status', telegramUser?.id ?? null];
  const query = useQuery({
    queryKey,
    queryFn: async ({ signal }) => {
      const data = await request(`${CONFIG.API.REPORT_API_URL}/reports/notifications/read-status`, {
        skipAuth: false,
        logoutOn401: false,
        signal,
      });
      return Array.isArray(data) ? data : [];
    },
    enabled: Boolean(telegramUser?.id),
    staleTime: 30_000,
  });

  const mutation = useMutation({
    mutationFn: ({ type, keys, notificationKey }) => request(
      `${CONFIG.API.REPORT_API_URL}/reports/notifications/${type === 'all' ? 'mark-all-read' : 'mark-read'}`,
      {
        method: 'POST',
        skipAuth: false,
        logoutOn401: false,
        body: JSON.stringify(type === 'all' ? { keys } : { notification_key: notificationKey }),
      }
    ),
    onMutate: async ({ type, keys, notificationKey }) => {
      await queryClient.cancelQueries({ queryKey });
      const previous = queryClient.getQueryData(queryKey) || [];
      const next = type === 'all'
        ? keys
        : [...new Set([...previous, notificationKey])];
      queryClient.setQueryData(queryKey, next);
      return { previous };
    },
    onError: (_error, _variables, context) => {
      if (context?.previous) queryClient.setQueryData(queryKey, context.previous);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey });
    },
  });

  return {
    readNotifyIds: query.data || [],
    markAllAsRead: (keys) => mutation.mutate({ type: 'all', keys }),
    markAsRead: (notificationKey) => mutation.mutate({ type: 'single', notificationKey }),
    isUpdatingReadStatus: mutation.isPending,
  };
}
