import { useState, useEffect } from 'react';
import { useReportFetch } from '../hooks/useReportFetch';
import { useFavoriteMutation } from '../hooks/useFavoriteMutation';
import { useFavorites } from '../hooks/useFavorites';
import { useFavoriteSync } from '../hooks/useFavoriteSync';
import { useSummaryMutation } from '../hooks/useSummaryMutation';
import { hasReportSummary } from '../utils/reportCollection';
import { useReportListInteractions } from '../hooks/useReportListInteractions';
import { useSearchSummaryActions } from '../hooks/useSearchSummaryActions';
import { useReportFavorites } from '../hooks/useReportFavorites';
import { useReportListViewData } from '../hooks/useReportListViewData';
import { useReportFavoritePersistence } from '../hooks/useReportFavoritePersistence';
import { useReportListRoute } from '../hooks/useReportListRoute';
import { useReportListActions } from '../hooks/useReportListActions';
import ReportListContent from './report/ReportListContent';
import './ReportList.css';

export default function ReportList({ onWriterClick }) {
  const { searchQuery, sortBy, setSortBy, telegramUser, handleSearch, location, pathname, isAdmin, isFavoritesPage, isAiSummary, isOutlook, isRecent, meta } = useReportListRoute();
  const { mutateFavorite } = useFavoriteMutation(telegramUser);
  const { favoriteItems } = useFavorites(telegramUser);
  const { syncFavoriteIds } = useFavoriteSync();
  const { triggerSummary } = useSummaryMutation();
  const [outlookYear, setOutlookYear] = useState(null);
  const initialFavorites = useState(() => { try { return JSON.parse(localStorage.getItem('report_favorites') || '{}'); } catch { return {}; } })[0];
  const [share, setShare] = useState({ isOpen: false, report: null, position: { top: 0, left: 0 } });
  const { reports, isLoading, hasMore, offset, fetchReports, error, retry } = useReportFetch(searchQuery, pathname, outlookYear, sortBy);
  const { summaryRequestedIds, summaryCompletedIds, handleTriggerSummary, reset: resetSummary } = useSearchSummaryActions(triggerSummary);
  const favoriteReports = useReportFavorites({ favoriteItems, isFavoritesPage });
  const { displayReports, sortedDates, filteredDates, summaryItems } = useReportListViewData({ reports, favoriteReports, isFavoritesPage, isAiSummary, searchQuery, meta, isLoading });
  const { dateToggles: collapsedDates, firmToggles: collapsedFirms, summaryToggles: expandedSummaries, favorites, setFavorites, reset, toggleDate, toggleFirm, toggleSummary, toggleFavorite } = useReportListInteractions({ dates: sortedDates, hasMore, isLoading, fetchMore: fetchReports, revealEnabled: isRecent, initialFavorites, mutateFavorite });
  useReportFavoritePersistence({ telegramUser, favorites, setFavorites, favoriteItems, syncFavoriteIds });
  useEffect(() => { reset(); resetSummary(); window.scrollTo(0, 0); }, [location.pathname, reset, resetSummary, searchQuery, sortBy]);
  const { openShare, handleTagClick, closeShare } = useReportListActions({ setShare, handleSearch });
  return <ReportListContent meta={{ title: meta.title || '레포트', description: meta.description, summaryItems }} filters={{ isOutlook, isLoading, outlookYear, onSetOutlookYear: setOutlookYear, tagFilter: null, onClearTagFilter: () => {} }} data={{ dates: sortedDates, displayReports, filteredDates }} controls={{ isLoading, error, offset, retry, fetchReports, hasMore }} share={{ ...share, onOpen: openShare, onClose: closeShare }} options={{ isFavoritesPage, isAiSummary, isRecent, isSearchActive: Boolean(searchQuery.query), collapsedDates, onToggleDate: toggleDate, sortBy, favorites, collapsedFirms, onToggleFirm: toggleFirm, expandedSummaries, onToggleSummary: toggleSummary, onToggleFavorite: toggleFavorite, onWriterClick, setSortBy, isAdmin, onTriggerSummary: handleTriggerSummary, summaryRequestedIds, summaryCompletedIds, hasSummaryContent: hasReportSummary, emptyMessage: isAiSummary ? 'AI 요약이 생성된 레포트가 없습니다.' : isOutlook ? '전망 관련 레포트가 없습니다.' : '즐겨찾기한 레포트가 없습니다.', onTagClick: handleTagClick }} />;
}
