import { useCallback, useMemo } from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';
import { CONFIG } from '../constants/config';
import { request } from '../utils/api';
import { buildReportFetchUrl } from '../utils/reportFetch';
import { normalizeReportItem } from '../utils/reportNormalizer';

function mergeReports(pages) {
  const updated = {};

  pages.flatMap((page) => Array.isArray(page?.items) ? page.items : []).forEach((item) => {
    const report = normalizeReportItem(item);
    if (!report) return;

    if (!Array.isArray(updated[report.date])) updated[report.date] = [];
    if (!updated[report.date].some((existing) => existing.id === report.id)) {
      updated[report.date].push(report);
    }
  });

  return updated;
}

export function useReportFetch(searchQuery, pathname, outlookYear, sortBy) {
  const query = searchQuery?.query || '';
  const category = searchQuery?.category || '';
  const companyOrder = searchQuery?.companyOrder ?? null;
  const board = searchQuery?.board ?? null;

  const queryKey = useMemo(() => [
    'reports',
    { pathname, outlookYear: outlookYear ?? null, sortBy, query, category, companyOrder, board },
  ], [pathname, outlookYear, sortBy, query, category, companyOrder, board]);

  const fetchPage = useCallback(async ({ pageParam = 0, signal }) => {
    const url = buildReportFetchUrl({
      pathname,
      offset: pageParam,
      sortBy,
      searchQuery: { query, category, companyOrder, board },
      outlookYear,
      baseUrl: CONFIG.API.REPORT_API_URL,
    });

    return request(url, { signal });
  }, [pathname, outlookYear, sortBy, query, category, companyOrder, board]);

  const reportsQuery = useInfiniteQuery({
    queryKey,
    queryFn: fetchPage,
    initialPageParam: 0,
    getNextPageParam: (lastPage, pages) => {
      if (!lastPage?.hasMore) return undefined;
      return pages.reduce((total, page) => total + (Array.isArray(page?.items) ? page.items.length : 0), 0);
    },
  });

  const pages = useMemo(() => reportsQuery.data?.pages || [], [reportsQuery.data?.pages]);
  const reports = useMemo(() => mergeReports(pages), [pages]);
  const offset = pages.reduce((total, page) => total + (Array.isArray(page?.items) ? page.items.length : 0), 0);
  const {
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = reportsQuery;
  const fetchReports = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      return fetchNextPage();
    }
    return undefined;
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  return {
    reports,
    isLoading: reportsQuery.isPending || reportsQuery.isFetching,
    hasMore: Boolean(hasNextPage),
    offset,
    fetchReports,
    error: reportsQuery.error,
    retry: reportsQuery.refetch,
  };
}
