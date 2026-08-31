import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import SearchFilters from './search/SearchFilters';
import SearchResults from './search/SearchResults';
import { useReport } from '../context/useReport';
import { useReportFetch } from '../hooks/useReportFetch';
import { CONFIG } from '../constants/config';
import { buildShareMenuData } from '../utils/shareMenuData';
import { useBoards } from '../hooks/useBoards';
import { useFavoriteMutation } from '../hooks/useFavoriteMutation';
import { useSummaryMutation } from '../hooks/useSummaryMutation';
import { countReportGroups, datesWithReports, hasReportSummary } from '../utils/reportCollection';
import { useRevealOlderDate } from '../hooks/useRevealOlderDate';
import './SearchPageNew.css';
import './search/SearchResults.css';

const SUMMARY_NOTIFICATION_EVENT = 'ssh-summary-notification';

function emitSummaryNotification(detail) {
  window.dispatchEvent(new CustomEvent(SUMMARY_NOTIFICATION_EVENT, {
    detail: {
      created_at: new Date().toISOString(),
      ...detail,
    },
  }));
}

function SearchPageNew() {
  const { telegramUser } = useReport();
  const isAdmin = telegramUser?.is_admin === true;
  const { mutateFavorite } = useFavoriteMutation(telegramUser);
  const { triggerSummary } = useSummaryMutation();
  const [searchParams, setSearchParams] = useSearchParams();

  // 로컬 필터 상태
  const [searchTerm, setSearchTerm] = useState(() => searchParams.get('q') || '');
  const [debouncedQuery, setDebouncedQuery] = useState(() => searchParams.get('q') || '');
  const [category, setCategory] = useState(() => searchParams.get('category') || 'title');
  const [selectedCompany, setSelectedCompany] = useState(() => searchParams.get('company') || '');
  const [selectedBoard, setSelectedBoard] = useState(() => searchParams.get('board') || '');
  const [selectedRoute, setSelectedRoute] = useState(() => searchParams.get('route') || 'recent');
  const [selectedSort, setSelectedSort] = useState(() => searchParams.get('sort') || 'time');

  // 텍스트 디바운스
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(searchTerm);
    }, 300);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  // 검색 화면의 필터를 URL에 반영해 새로고침/공유/뒤로가기를 보존한다.
  useEffect(() => {
    const params = new URLSearchParams();
    const trimmedQuery = debouncedQuery.trim();
    if (trimmedQuery) params.set('q', trimmedQuery);
    if (category !== 'title') params.set('category', category);
    if (selectedCompany) params.set('company', selectedCompany);
    if (selectedBoard) params.set('board', selectedBoard);
    if (selectedRoute !== 'recent') params.set('route', selectedRoute);
    if (selectedSort !== 'time') params.set('sort', selectedSort);
    setSearchParams(params, { replace: true });
  }, [category, debouncedQuery, selectedBoard, selectedCompany, selectedRoute, selectedSort, setSearchParams]);

  const { boards } = useBoards(selectedCompany);

  // 증권사 변경 시 기존 게시판 선택 초기화
  useEffect(() => {
    if (!selectedCompany) setSelectedBoard('');
  }, [selectedCompany]);

  // 검색 쿼리 빌드
  const searchQuery = useMemo(() => {
    const trimmed = debouncedQuery.trim();
    const isCompanyOnly = !trimmed && selectedCompany;
    return {
      query: isCompanyOnly ? selectedCompany : trimmed,
      category: isCompanyOnly ? 'company' : (trimmed ? category : ''),
      companyOrder: selectedCompany || null,
      board: selectedBoard ? Number(selectedBoard) : null,
    };
  }, [debouncedQuery, category, selectedCompany, selectedBoard]);

  // useReportFetch를 활용하여 실시간 검색 결과 fetch
  const fetchPathname = `/${selectedRoute}`;
  const {
    reports,
    isLoading,
    hasMore,
    offset,
    fetchReports,
    error,
    retry,
  } = useReportFetch(searchQuery, fetchPathname, null, selectedSort);

  // 리스트 컨트롤 상태 (즐겨찾기, 토글 등)
  const [dateToggles, setDateToggles] = useState({});
  const [firmToggles, setFirmToggles] = useState({});
  const [summaryToggles, setSummaryToggles] = useState({});
  const [favorites, setFavorites] = useState(() => {
    const saved = localStorage.getItem('report_favorites');
    try {
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const [summaryRequestedIds, setSummaryRequestedIds] = useState(new Set());
  const [summaryCompletedIds, setSummaryCompletedIds] = useState(new Set());
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 });

  // 검색 조건 변경 시 날짜 토글 및 요약 초기화
  useEffect(() => {
    setDateToggles({});
    setFirmToggles({});
    setSummaryToggles({});
    setSummaryRequestedIds(new Set());
  }, [searchQuery, selectedRoute, selectedSort]);

  const toggleDate = useCallback((date) => {
    const willCollapse = !dateToggles[date];
    setDateToggles(prev => ({ ...prev, [date]: willCollapse }));
    if (willCollapse) requestReveal(date);
  }, [dateToggles, requestReveal]);

  const toggleFirm = useCallback((date, firm) => {
    setFirmToggles(prev => ({
      ...prev,
      [date]: { ...prev[date], [firm]: !prev[date]?.[firm] }
    }));
  }, []);

  const toggleSummary = useCallback((id) => {
    setSummaryToggles(prev => ({ ...prev, [id]: !prev[id] }));
  }, []);

  const toggleFavorite = useCallback((id) => {
    const isAdding = !favorites[id];
    const previous = favorites;
    const next = { ...favorites, [id]: isAdding };
    setFavorites(next);
    localStorage.setItem('report_favorites', JSON.stringify(next));
    mutateFavorite(id, isAdding)?.catch(() => {
      setFavorites(previous);
      localStorage.setItem('report_favorites', JSON.stringify(previous));
    });
  }, [favorites, mutateFavorite]);

  const handleOpenShareMenu = useCallback((e, report) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setMenuPosition({ 
      top: rect.bottom + window.scrollY, 
      left: rect.left + rect.width / 2 + window.scrollX
    });
    setSelectedReport(buildShareMenuData(report));
    setIsShareOpen(true);
  }, []);

  const handleTriggerSummary = useCallback(async (reportId, engine = 'deepseek', force = false, report = null) => {
    const token = localStorage.getItem(CONFIG.STORAGE_KEYS.AUTH_TOKEN);
    if (!token) return;
    const title = report?.title || report?.article_title || `리포트 #${reportId}`;
    const firm = report?.firm || report?.firm_nm || '';
    const modelLabel = engine === 'ag' ? 'Gemini' : 'DeepSeek';

    /* 기존 주석 유지: 중복 요청 방지 (force=true일 때는 우회를 위해 상태 초기화) */
    if (force) {
      setSummaryCompletedIds(prev => {
        const next = new Set(prev);
        next.delete(reportId);
        return next;
      });
      setSummaryRequestedIds(prev => {
        const next = new Set(prev);
        next.delete(reportId);
        return next;
      });
    } else if (summaryRequestedIds.has(reportId)) {
      return;
    }

    setSummaryRequestedIds(prev => new Set(prev).add(reportId));
    emitSummaryNotification({
      report_id: reportId,
      article_title: title,
      firm_nm: firm,
      summary_model: engine === 'ag' ? 'gemini' : engine,
      status: 'requested',
      message: `${modelLabel} 요약 요청을 접수했습니다: ${title}`,
    });

    try {
      const result = await triggerSummary({ reportId, engine, force });
      if (result?.status === 'success' || result?.status === 'skipped') {
        setSummaryCompletedIds(prev => new Set(prev).add(reportId));
        emitSummaryNotification({
          report_id: reportId,
          article_title: title,
          firm_nm: firm,
          summary_model: engine === 'ag' ? 'gemini' : engine,
          status: result.status === 'skipped' ? 'skipped' : 'completed',
          message: `${modelLabel} 요약이 ${result.status === 'skipped' ? '이미 완료되어 있습니다' : '완료되었습니다'}: ${title}`,
        });
      }
    } catch (error) {
      console.error('[Admin] ❌ 요약 실패:', error.message);
      setSummaryRequestedIds(prev => {
        const next = new Set(prev);
        next.delete(reportId);
        return next;
      });
      emitSummaryNotification({
        report_id: reportId,
        article_title: title,
        firm_nm: firm,
        summary_model: engine === 'ag' ? 'gemini' : engine,
        status: 'failed',
        message: `${modelLabel} 요약 요청에 실패했습니다: ${title}`,
      });
    }
  }, [summaryRequestedIds, triggerSummary]);

  const handleReset = () => {
    setSearchTerm('');
    setCategory('title');
    setSelectedCompany('');
    setSelectedBoard('');
    setSelectedRoute('recent');
    setSelectedSort('time');
  };

  const handleCompanyChange = useCallback((e) => {
    setSelectedCompany(e.target.value);
    setSelectedBoard('');
  }, []);

  const handleLocalWriterClick = useCallback((writer) => {
    setCategory('writer');
    setSearchTerm(writer);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const isAiSummary = selectedRoute === 'ai-summary';
  const hasSummaryContent = hasReportSummary;

  const sortedDates = datesWithReports(reports);
  const filteredSortedDates = isAiSummary ? datesWithReports(reports, hasSummaryContent) : sortedDates;

  const { requestReveal } = useRevealOlderDate({ dates: filteredSortedDates, hasMore, isLoading, fetchMore: fetchReports });

  // 결과 개수 카운트
  const totalCount = useMemo(() => countReportGroups(reports), [reports]);

  return (
    <div className="search-page-new">
      <section className="search-page-header">
        <h1>통합 검색 및 필터</h1>
        <p>조건을 선택하는 즉시 실시간으로 최적화된 리포트를 분석합니다.</p>
      </section>

      <SearchFilters
        category={category}
        searchTerm={searchTerm}
        selectedCompany={selectedCompany}
        selectedBoard={selectedBoard}
        selectedRoute={selectedRoute}
        selectedSort={selectedSort}
        boards={boards}
        onCategoryChange={(e) => setCategory(e.target.value)}
        onSearchTermChange={(e) => setSearchTerm(e.target.value)}
        onCompanyChange={handleCompanyChange}
        onBoardChange={(e) => setSelectedBoard(e.target.value)}
        onRouteChange={setSelectedRoute}
        onSortChange={setSelectedSort}
        onReset={handleReset}
      />

      <SearchResults
        totalCount={totalCount} error={error} retry={retry} offset={offset} isLoading={isLoading}
        filteredSortedDates={filteredSortedDates} reports={reports} fetchReports={fetchReports} hasMore={hasMore}
        dateToggles={dateToggles} toggleDate={toggleDate} selectedSort={selectedSort} favorites={favorites}
        firmToggles={firmToggles} toggleFirm={toggleFirm} summaryToggles={summaryToggles} toggleSummary={toggleSummary}
        toggleFavorite={toggleFavorite} handleOpenShareMenu={handleOpenShareMenu} handleLocalWriterClick={handleLocalWriterClick}
        isAdmin={isAdmin} handleTriggerSummary={handleTriggerSummary} summaryRequestedIds={summaryRequestedIds}
        summaryCompletedIds={summaryCompletedIds} isAiSummary={isAiSummary} hasSummaryContent={hasSummaryContent}
        onSortChange={setSelectedSort}
        isShareOpen={isShareOpen} setIsShareOpen={setIsShareOpen} selectedReport={selectedReport} menuPosition={menuPosition}
      />
    </div>
  );
}

export default SearchPageNew;
