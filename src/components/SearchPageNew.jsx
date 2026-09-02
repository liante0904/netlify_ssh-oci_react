import React, { useState, useEffect, useCallback, useMemo } from 'react';
import SearchFilters from './search/SearchFilters';
import SearchResults from './search/SearchResults';
import { useReport } from '../context/useReport';
import { useReportFetch } from '../hooks/useReportFetch';
import { buildShareMenuData } from '../utils/shareMenuData';
import { useBoards } from '../hooks/useBoards';
import { useFavoriteMutation } from '../hooks/useFavoriteMutation';
import { useSummaryMutation } from '../hooks/useSummaryMutation';
import { countReportGroups, datesWithReports, hasReportSummary } from '../utils/reportCollection';
import { useReportListInteractions } from '../hooks/useReportListInteractions';
import { useSearchFilters } from '../hooks/useSearchFilters';
import { useSearchSummaryActions } from '../hooks/useSearchSummaryActions';
import './SearchPageNew.css';
import './search/SearchResults.css';

function SearchPageNew() {
  const { telegramUser } = useReport();
  const isAdmin = telegramUser?.is_admin === true;
  const { mutateFavorite } = useFavoriteMutation(telegramUser);
  const { triggerSummary } = useSummaryMutation();
  const { searchTerm, setSearchTerm, category, setCategory, selectedCompany, selectedBoard, setSelectedBoard, selectedRoute, setSelectedRoute, selectedSort, setSelectedSort, searchQuery, handleCompanyChange, resetFilters } = useSearchFilters();

  const { boards } = useBoards(selectedCompany);


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
  const initialFavorites = useState(() => {
    const saved = localStorage.getItem('report_favorites');
    try {
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  })[0];

  const [isShareOpen, setIsShareOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 });

  const isAiSummary = selectedRoute === 'ai-summary';
  const hasSummaryContent = hasReportSummary;
  const sortedDates = datesWithReports(reports);
  const filteredSortedDates = isAiSummary ? datesWithReports(reports, hasSummaryContent) : sortedDates;
  const { dateToggles, firmToggles, summaryToggles, favorites, reset, toggleDate, toggleFirm, toggleSummary, toggleFavorite } = useReportListInteractions({ dates: filteredSortedDates, hasMore, isLoading, fetchMore: fetchReports, initialFavorites, mutateFavorite });
  const { summaryRequestedIds, summaryCompletedIds, handleTriggerSummary, reset: resetSummary } = useSearchSummaryActions(triggerSummary);

  // 검색 조건 변경 시 날짜 토글 및 요약 초기화
  useEffect(() => {
    reset();
    resetSummary();
  }, [reset, resetSummary, searchQuery, selectedRoute, selectedSort]);


  const handleOpenShareMenu = useCallback((e, report) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setMenuPosition({ 
      top: rect.bottom + window.scrollY, 
      left: rect.left + rect.width / 2 + window.scrollX
    });
    setSelectedReport(buildShareMenuData(report));
    setIsShareOpen(true);
  }, []);

  const handleLocalWriterClick = useCallback((writer) => {
    setCategory('writer');
    setSearchTerm(writer);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [setCategory, setSearchTerm]);

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
        onReset={resetFilters}
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
