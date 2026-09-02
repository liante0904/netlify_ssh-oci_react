import React from 'react';
import SearchFilters from './search/SearchFilters';
import SearchResults from './search/SearchResults';
import { useSearchPageViewModel } from '../hooks/useSearchPageViewModel';
import './SearchPageNew.css';
import './search/SearchResults.css';

function SearchPageNew() {
  const view = useSearchPageViewModel();
  return <div className="search-page-new">
    <section className="search-page-header"><h1>통합 검색 및 필터</h1><p>조건을 선택하는 즉시 실시간으로 최적화된 리포트를 분석합니다.</p></section>
    <SearchFilters category={view.category} searchTerm={view.searchTerm} selectedCompany={view.selectedCompany} selectedBoard={view.selectedBoard} selectedRoute={view.selectedRoute} selectedSort={view.selectedSort} boards={view.boards} onCategoryChange={(event) => view.setCategory(event.target.value)} onSearchTermChange={(event) => view.setSearchTerm(event.target.value)} onCompanyChange={view.handleCompanyChange} onBoardChange={(event) => view.setSelectedBoard(event.target.value)} onRouteChange={view.setSelectedRoute} onSortChange={view.setSelectedSort} onReset={view.resetFilters} />
    <SearchResults totalCount={view.totalCount} error={view.error} retry={view.retry} offset={view.offset} isLoading={view.isLoading} filteredSortedDates={view.filteredSortedDates} reports={view.reports} fetchReports={view.fetchReports} hasMore={view.hasMore} dateToggles={view.dateToggles} toggleDate={view.toggleDate} selectedSort={view.selectedSort} favorites={view.favorites} firmToggles={view.firmToggles} toggleFirm={view.toggleFirm} summaryToggles={view.summaryToggles} toggleSummary={view.toggleSummary} toggleFavorite={view.toggleFavorite} handleOpenShareMenu={view.handleOpenShareMenu} handleLocalWriterClick={view.handleLocalWriterClick} onTagClick={view.handleLocalTagClick} isAdmin={view.isAdmin} handleTriggerSummary={view.handleTriggerSummary} summaryRequestedIds={view.summaryRequestedIds} summaryCompletedIds={view.summaryCompletedIds} isAiSummary={view.isAiSummary} hasSummaryContent={view.hasSummaryContent} onSortChange={view.setSelectedSort} isShareOpen={view.isShareOpen} setIsShareOpen={view.setIsShareOpen} selectedReport={view.selectedReport} menuPosition={view.menuPosition} />
  </div>;
}

export default SearchPageNew;
