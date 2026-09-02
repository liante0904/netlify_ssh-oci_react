import { useEffect, useMemo } from 'react';
import { isDsReport, prefetchPdf } from '../utils/reportLinks';
import { hasReportSummary, flattenReportGroup, datesWithReports } from '../utils/reportCollection';

export function useReportListViewData({ reports, favoriteReports, isFavoritesPage, isAiSummary, searchQuery, meta, isLoading }) {
  const displayReports = isFavoritesPage && favoriteReports ? favoriteReports : reports;
  const sortedDates = useMemo(() => datesWithReports(displayReports), [displayReports]);
  const filteredDates = useMemo(() => sortedDates.filter((date) => flattenReportGroup(displayReports[date]).some((item) => !isAiSummary || hasReportSummary(item))), [displayReports, isAiSummary, sortedDates]);
  const summaryItems = useMemo(() => [{ label: meta.title || '레포트', value: filteredDates.length, icon: '📰' }, ...(searchQuery.query ? [{ label: '검색', value: searchQuery.query, icon: '🔍' }] : [])], [filteredDates.length, meta.title, searchQuery.query]);

  useEffect(() => {
    if (isLoading) return;
    const reportsToPrefetch = filteredDates.slice(0, 2).flatMap((date) => flattenReportGroup(displayReports[date])).filter(isDsReport).slice(0, 3);
    reportsToPrefetch.forEach((report, index) => window.setTimeout(() => prefetchPdf(report, window.location.origin), index * 700));
  }, [displayReports, filteredDates, isLoading]);

  return { displayReports, sortedDates, filteredDates, summaryItems };
}
