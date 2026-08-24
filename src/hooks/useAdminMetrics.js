import { useQuery } from '@tanstack/react-query';
import { FIRM_NAMES } from '../constants/firms';
import { CONFIG } from '../constants/config';
import { request } from '../utils/api';

function formatActivityTime(value) {
  if (!value) return '-';
  const diffMin = Math.floor((Date.now() - new Date(value).getTime()) / 60000);
  if (diffMin < 1) return '방금 전';
  if (diffMin < 60) return `${diffMin}분 전`;
  return `${Math.floor(diffMin / 60)}시간 전`;
}

export function useAdminMetrics(enabled, refreshInterval) {
  const query = useQuery({
    queryKey: ['admin', 'metrics'],
    queryFn: async ({ signal }) => {
      const [data, firmHealth] = await Promise.all([
        request(`${CONFIG.API.BASE_URL}/admin/metrics`, { skipAuth: false, signal }),
        request(`${CONFIG.API.BASE_URL}/admin/firm-health`, { skipAuth: false, signal }).catch((error) => {
          if (error.name === 'AbortError') throw error;
          return null;
        }),
      ]);
      const activityTime = formatActivityTime(data.last_activity?.last_save_time);
      const archiveHistory = (data.reports?.archive_history || []).map((item) => ({
        label: item.label,
        count: item.count,
      }));
      return {
        systemStatus: {
          overall: data.overall || 'unknown',
          db: data.database?.status || 'unknown',
          api: data.overall === 'online' ? 'online' : 'degraded',
          cpu: data.cpu?.percent ?? '-',
          cpuCores: data.cpu?.cores ?? 0,
          cpuFreq: data.cpu?.frequency_mhz,
          memoryPercent: data.memory?.percent ?? 0,
          memoryUsed: data.memory?.used_gb ?? 0,
          memoryTotal: data.memory?.total_gb ?? 0,
          diskPercent: data.disk?.percent ?? 0,
          diskUsed: data.disk?.used_gb ?? 0,
          diskTotal: data.disk?.total_gb ?? 0,
          lastCrawl: activityTime,
          lastPdfGen: activityTime,
          totalReports: data.reports?.total?.toLocaleString() ?? '-',
          todayReports: data.reports?.today_inserts ?? 0,
          uptimeDays: data.system?.uptime_days ?? 0,
        },
        firmRecords: (data.reports?.by_firm_today || []).map((item) => ({
          name: item.firm,
          todayCount: item.count,
        })),
        archiveHistory,
        summary: {
          totalArchived: archiveHistory.reduce((sum, item) => sum + item.count, 0),
          todayCount: archiveHistory.length ? archiveHistory[archiveHistory.length - 1].count : 0,
          activeFirms: data.reports?.active_firms_today ?? 0,
          totalFirms: FIRM_NAMES.length,
          pendingReprocess: 0,
        },
        firmHealth,
      };
    },
    enabled,
    staleTime: 15_000,
    refetchInterval: enabled ? refreshInterval : false,
  });

  return {
    ...(query.data || {
      systemStatus: null,
      firmRecords: [],
      archiveHistory: [],
      summary: { totalArchived: 0, todayCount: 0, activeFirms: 0, totalFirms: FIRM_NAMES.length, pendingReprocess: 0 },
      firmHealth: null,
    }),
    statusLoading: query.isPending || query.isFetching,
    statusError: query.error,
    retryMetrics: query.refetch,
  };
}
