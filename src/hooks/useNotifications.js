import { useQuery } from '@tanstack/react-query';
import { CONFIG } from '../constants/config';
import { request } from '../utils/api';

export function getNotificationKey(item) {
  return item?.notification_key || `${item?.source || 'summary'}:${item?.id}`;
}

function normalizeNotificationItem(item) {
  return {
    ...item,
    source: item.summary_model ? 'summary' : 'telegram',
    notification_key: item.notification_key || `${item.summary_model ? 'summary' : 'telegram'}:${item.id}`,
    created_at: item.created_at,
    pdf_url: item.pdf_file_url || null,
    telegram_url: item.telegram_url || null,
    source_url: item.source_url || null,
    sec_firm_order: item.sec_firm_order ?? null,
  };
}

export function useNotifications(telegramUser) {
  const query = useQuery({
    queryKey: ['notifications', telegramUser?.id ?? null],
    queryFn: async ({ signal }) => {
      const data = await request(`${CONFIG.API.REPORT_API_URL}/reports/notifications?limit=50`, { skipAuth: false, signal });
      const items = Array.isArray(data) ? data.map(normalizeNotificationItem) : [];
      return items.sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));
    },
    enabled: Boolean(telegramUser?.id),
    staleTime: 15_000,
    refetchInterval: 30_000,
  });

  return {
    notifications: query.data || [],
    isLoadingNotifications: query.isPending,
    notificationError: query.error,
    retryNotifications: query.refetch,
  };
}
