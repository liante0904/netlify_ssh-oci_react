import { useState, useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { useReport } from '../context/useReport';
import { useReportFetch } from '../hooks/useReportFetch';
import { useFavoriteMutation } from '../hooks/useFavoriteMutation';
import { useFavorites } from '../hooks/useFavorites';
import { useFavoriteSync } from '../hooks/useFavoriteSync';
import { useSummaryMutation } from '../hooks/useSummaryMutation';
import { CONFIG } from '../constants/config';
import { getReportSectionByPath } from '../constants/reportSections';
import { isDsReport, prefetchPdf } from '../utils/reportLinks';
import { normalizeReportItem } from '../utils/reportNormalizer';
import { hasReportSummary, flattenReportGroup, datesWithReports } from '../utils/reportCollection';
import { buildShareMenuData } from '../utils/shareMenuData';
import { useReportListInteractions } from '../hooks/useReportListInteractions';
import ReportListContent from './report/ReportListContent';
import './ReportList.css';

function emitSummary(detail) { window.dispatchEvent(new CustomEvent('ssh-summary-notification', { detail: { created_at: new Date().toISOString(), ...detail } })); }

export default function ReportList({ onWriterClick }) {
  const { searchQuery, sortBy, setSortBy, telegramUser, handleSearch } = useReport();
  const location = useLocation();
  const isAdmin = telegramUser?.is_admin === true;
  const isFavoritesPage = location.pathname.includes('favorites');
  const isAiSummary = location.pathname.includes('ai-summary');
  const isOutlook = location.pathname.includes('outlook');
  const isRecent = location.pathname === '/recent';
  const { mutateFavorite } = useFavoriteMutation(telegramUser);
  const { favoriteItems } = useFavorites(telegramUser);
  const { syncFavoriteIds } = useFavoriteSync();
  const { triggerSummary } = useSummaryMutation();
  const [outlookYear, setOutlookYear] = useState(null);
  const initialFavorites = useState(() => { try { return JSON.parse(localStorage.getItem('report_favorites') || '{}'); } catch { return {}; } })[0];
  const [favoriteReports, setFavoriteReports] = useState(null);
  const [summaryRequestedIds, setSummaryRequestedIds] = useState(new Set());
  const [summaryCompletedIds, setSummaryCompletedIds] = useState(new Set());
  const [share, setShare] = useState({ isOpen: false, report: null, position: { top: 0, left: 0 } });
  const { reports, isLoading, hasMore, offset, fetchReports, error, retry } = useReportFetch(searchQuery, location.pathname, outlookYear, sortBy);
  useEffect(() => { if (!telegramUser || localStorage.getItem('report_favorites_synced')) return; const token = localStorage.getItem(CONFIG.STORAGE_KEYS.AUTH_TOKEN); if (!token) return; const ids = Object.keys(favorites).filter((id) => favorites[id]).map(Number); if (ids.length) syncFavoriteIds(ids); localStorage.setItem('report_favorites_synced', '1'); }, [favorites, syncFavoriteIds, telegramUser]);
  useEffect(() => { if (!favoriteItems.length) return; setFavorites((current) => { const next = { ...current }; favoriteItems.forEach((item) => { next[item.report_id] = true; }); localStorage.setItem('report_favorites', JSON.stringify(next)); return next; }); }, [favoriteItems, setFavorites]);
  useEffect(() => { if (!isFavoritesPage || !favoriteItems.length) { if (isFavoritesPage) setFavoriteReports({}); return; } const grouped = {}; favoriteItems.map(normalizeReportItem).filter(Boolean).forEach((item) => { grouped[item.date] ||= []; if (!grouped[item.date].some((row) => row.id === item.id)) grouped[item.date].push(item); }); setFavoriteReports(grouped); }, [favoriteItems, isFavoritesPage]);
  useEffect(() => { reset(); setSummaryRequestedIds(new Set()); window.scrollTo(0, 0); }, [location.pathname, reset, searchQuery, sortBy]);
  const displayReports = isFavoritesPage && favoriteReports ? favoriteReports : reports;
  const sortedDates = datesWithReports(displayReports);
  const filteredDates = isFavoritesPage && favoriteReports ? sortedDates : sortedDates.filter((date) => flattenReportGroup(displayReports[date]).some((item) => (!isFavoritesPage || favorites[item.id]) && (!isAiSummary || hasReportSummary(item))));
  const meta = getReportSectionByPath(location.pathname) || {};
  const { dateToggles: collapsedDates, firmToggles: collapsedFirms, summaryToggles: expandedSummaries, favorites, setFavorites, reset, toggleDate, toggleFirm, toggleSummary, toggleFavorite } = useReportListInteractions({ dates: sortedDates, hasMore, isLoading, fetchMore: fetchReports, revealEnabled: isRecent, initialFavorites, mutateFavorite });
  const openShare = useCallback((event, report) => { const rect = event.currentTarget.getBoundingClientRect(); setShare({ isOpen: true, report: buildShareMenuData(report), position: { top: rect.bottom, left: rect.left + rect.width / 2 } }); }, []);
  const onTriggerSummary = useCallback(async (reportId, engine = 'deepseek', force = false, report = null) => { const token = localStorage.getItem(CONFIG.STORAGE_KEYS.AUTH_TOKEN); if (!token || (!force && summaryRequestedIds.has(reportId))) return; const title = report?.title || report?.article_title || `리포트 #${reportId}`; setSummaryRequestedIds((current) => new Set(current).add(reportId)); emitSummary({ report_id: reportId, article_title: title, status: 'requested', message: `${engine === 'ag' ? 'Gemini' : 'DeepSeek'} 요약 요청을 접수했습니다: ${title}` }); try { const result = await triggerSummary({ reportId, engine, force }); if (result?.status === 'success' || result?.status === 'skipped') setSummaryCompletedIds((current) => new Set(current).add(reportId)); } catch { setSummaryRequestedIds((current) => { const next = new Set(current); next.delete(reportId); return next; }); } }, [summaryRequestedIds, triggerSummary]);
  const handleTagClick = (keyword, isSector) => handleSearch({ query: keyword, category: isSector ? 'sector' : 'title' });
  const summaryItems = [{ label: meta.title || '레포트', value: filteredDates.length, icon: '📰' }, ...(searchQuery.query ? [{ label: '검색', value: searchQuery.query, icon: '🔍' }] : [])];
  useEffect(() => { if (isLoading) return; const reportsToPrefetch = filteredDates.slice(0, 2).flatMap((date) => flattenReportGroup(displayReports[date])).filter(isDsReport).slice(0, 3); reportsToPrefetch.forEach((report, index) => window.setTimeout(() => prefetchPdf(report, window.location.origin), index * 700)); }, [displayReports, filteredDates, isLoading]);
  return <ReportListContent meta={{ title: meta.title || '레포트', description: meta.description, summaryItems }} filters={{ isOutlook, isLoading, outlookYear, onSetOutlookYear: setOutlookYear, tagFilter: null, onClearTagFilter: () => {} }} data={{ dates: sortedDates, displayReports, filteredDates }} controls={{ isLoading, error, offset, retry, fetchReports, hasMore }} share={{ ...share, onOpen: openShare, onClose: () => setShare((current) => ({ ...current, isOpen: false })) }} options={{ isFavoritesPage, isAiSummary, isRecent, isSearchActive: Boolean(searchQuery.query), collapsedDates, onToggleDate: toggleDate, sortBy, favorites, collapsedFirms, onToggleFirm: toggleFirm, expandedSummaries, onToggleSummary: toggleSummary, onToggleFavorite: toggleFavorite, onWriterClick, setSortBy, isAdmin, onTriggerSummary, summaryRequestedIds, summaryCompletedIds, hasSummaryContent: hasReportSummary, emptyMessage: isAiSummary ? 'AI 요약이 생성된 레포트가 없습니다.' : isOutlook ? '전망 관련 레포트가 없습니다.' : '즐겨찾기한 레포트가 없습니다.', onTagClick: handleTagClick }} />;
}
