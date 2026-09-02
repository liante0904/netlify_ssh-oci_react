import { useState, useEffect, useCallback, useMemo } from 'react';
import { useReport } from '../context/useReport';
import { useReportFetch } from './useReportFetch';
import { buildShareMenuData } from '../utils/shareMenuData';
import { useBoards } from './useBoards';
import { useFavoriteMutation } from './useFavoriteMutation';
import { useSummaryMutation } from './useSummaryMutation';
import { countReportGroups, datesWithReports, hasReportSummary } from '../utils/reportCollection';
import { useReportListInteractions } from './useReportListInteractions';
import { useSearchFilters } from './useSearchFilters';
import { useSearchSummaryActions } from './useSearchSummaryActions';

export function useSearchPageViewModel() {
  const { telegramUser } = useReport();
  const isAdmin = telegramUser?.is_admin === true;
  const { mutateFavorite } = useFavoriteMutation(telegramUser);
  const { triggerSummary } = useSummaryMutation();
  const { searchTerm, setSearchTerm, category, setCategory, selectedCompany, selectedBoard, setSelectedBoard, selectedRoute, setSelectedRoute, selectedSort, setSelectedSort, searchQuery, handleCompanyChange, resetFilters } = useSearchFilters();
  const { boards } = useBoards(selectedCompany);
  const { reports, isLoading, hasMore, offset, fetchReports, error, retry } = useReportFetch(searchQuery, `/${selectedRoute}`, null, selectedSort);
  const initialFavorites = useState(() => { const saved = localStorage.getItem('report_favorites'); try { return saved ? JSON.parse(saved) : {}; } catch { return {}; } })[0];
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 });
  const isAiSummary = selectedRoute === 'ai-summary';
  const sortedDates = datesWithReports(reports);
  const filteredSortedDates = isAiSummary ? datesWithReports(reports, hasReportSummary) : sortedDates;
  const { dateToggles, firmToggles, summaryToggles, favorites, reset, toggleDate, toggleFirm, toggleSummary, toggleFavorite } = useReportListInteractions({ dates: filteredSortedDates, hasMore, isLoading, fetchMore: fetchReports, initialFavorites, mutateFavorite });
  const { summaryRequestedIds, summaryCompletedIds, handleTriggerSummary, reset: resetSummary } = useSearchSummaryActions(triggerSummary);

  useEffect(() => { reset(); resetSummary(); }, [reset, resetSummary, searchQuery, selectedRoute, selectedSort]);

  const handleOpenShareMenu = useCallback((event, report) => {
    const rect = event.currentTarget.getBoundingClientRect();
    setMenuPosition({ top: rect.bottom + window.scrollY, left: rect.left + rect.width / 2 + window.scrollX });
    setSelectedReport(buildShareMenuData(report));
    setIsShareOpen(true);
  }, []);
  const handleLocalWriterClick = useCallback((writer) => { setCategory('writer'); setSearchTerm(writer); window.scrollTo({ top: 0, behavior: 'smooth' }); }, [setCategory, setSearchTerm]);
  const handleLocalTagClick = useCallback((value, type) => {
    const nextCategory = ({ sector: 'sector', stock: 'stock', keyword: 'tags' }[type] || 'tags');
    setCategory(nextCategory);
    setSearchTerm(value);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [setCategory, setSearchTerm]);
  const totalCount = useMemo(() => countReportGroups(reports), [reports]);

  return { isAdmin, searchTerm, setSearchTerm, category, setCategory, selectedCompany, selectedBoard, setSelectedBoard, selectedRoute, setSelectedRoute, selectedSort, setSelectedSort, boards, handleCompanyChange, resetFilters, totalCount, error, retry, offset, isLoading, filteredSortedDates, reports, fetchReports, hasMore, dateToggles, toggleDate, favorites, firmToggles, toggleFirm, summaryToggles, toggleSummary, toggleFavorite, handleOpenShareMenu, handleLocalWriterClick, handleLocalTagClick, handleTriggerSummary, summaryRequestedIds, summaryCompletedIds, isAiSummary, hasSummaryContent: hasReportSummary, isShareOpen, setIsShareOpen, selectedReport, menuPosition };
}
