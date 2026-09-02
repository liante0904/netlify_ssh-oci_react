import { useEffect, useMemo, useRef } from 'react';
import { useQueries, useQueryClient } from '@tanstack/react-query';
import { CONFIG } from '../constants/config';
import { HOME_SECTIONS } from '../constants/reportSections';
import { request } from '../utils/api';

const PREVIEW_LIMIT = 3;

export function useHomeDashboardData(normalizeFnGuideItem, normalizeReportPreview) {
  const queryClient = useQueryClient();
  const lastRefreshRef = useRef(0);
  const homeQueries = useQueries({ queries: [
    { queryKey: ['home', 'fnguide'], queryFn: async ({ signal }) => { const data = await request(`${CONFIG.API.BASE_URL}/api/fnguide/report-summaries?limit=${PREVIEW_LIMIT}&offset=0`, { signal, logoutOn401: false }); return Array.isArray(data) ? data.map(normalizeFnGuideItem) : []; } },
    ...['recent', 'industry', 'global'].map((key) => ({ queryKey: ['home', key], queryFn: async ({ signal }) => { const data = await request(`${CONFIG.API.REPORT_API_URL}/${key}?limit=${PREVIEW_LIMIT}&offset=0`, { signal }); return Array.isArray(data?.items) ? data.items.map(normalizeReportPreview).filter(Boolean) : []; } })),
  ] });

  const sections = useMemo(() => Object.fromEntries(HOME_SECTIONS.map((section, index) => {
    const query = homeQueries[index];
    return [section.key, { items: query.data || [], isLoading: query.isPending, error: query.isError ? `${section.title}을(를) 불러오지 못했습니다.` : '' }];
  })), [homeQueries]);

  useEffect(() => {
    const handleVisibility = () => {
      if (document.visibilityState !== 'visible') return;
      const now = Date.now();
      if (now - lastRefreshRef.current > 30000) {
        lastRefreshRef.current = now;
        queryClient.invalidateQueries({ queryKey: ['home'] });
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, [queryClient]);

  return sections;
}
