import { useMemo } from 'react';
import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { CONFIG } from '../constants/config';
import { request } from '../utils/api';

const LIMIT = 100;

export function useFnGuideQueries({ searchQuery, providerFilter, selectedDate }) {
  const datesQuery = useQuery({
    queryKey: ['fnguide', 'report-dates', { searchQuery, providerFilter }],
    queryFn: async ({ signal }) => {
      const params = new URLSearchParams();
      if (searchQuery) params.set('q', searchQuery);
      if (providerFilter) params.set('provider', providerFilter);
      return (await request(`${CONFIG.API.BASE_URL}/api/fnguide/report-dates?${params}`, { skipAuth: false, signal })) || [];
    },
    staleTime: 60000,
  });
  const summariesQuery = useInfiniteQuery({
    queryKey: ['fnguide', 'report-summaries', { searchQuery, providerFilter, selectedDate }],
    queryFn: async ({ pageParam = 0, signal }) => {
      const params = new URLSearchParams({ limit: String(LIMIT), offset: String(pageParam) });
      if (searchQuery) params.set('q', searchQuery);
      if (providerFilter) params.set('provider', providerFilter);
      if (selectedDate) params.set('report_date', selectedDate);
      return (await request(`${CONFIG.API.BASE_URL}/api/fnguide/report-summaries?${params}`, { skipAuth: false, signal })) || [];
    },
    initialPageParam: 0,
    getNextPageParam: (last, all, offset) => last.length === LIMIT ? offset + last.length : undefined,
    enabled: selectedDate !== null,
    staleTime: 60000,
  });
  const dates = useMemo(() => datesQuery.data || [], [datesQuery.data]);
  const summaries = useMemo(() => summariesQuery.data?.pages.flat() || [], [summariesQuery.data]);
  return { datesQuery, dates, summariesQuery, summaries };
}
