import InfiniteScroll from 'react-infinite-scroll-component';
import ShareMenu from '../ShareMenu';
import ReportGroup from '../report/ReportGroup';
import AsyncErrorState from '../AsyncErrorState';
import LoadingSkeleton from '../LoadingSkeleton';

export default function SearchResults({
  totalCount, error, retry, offset, isLoading, filteredSortedDates, reports, fetchReports,
  hasMore, dateToggles, toggleDate, selectedSort, favorites, firmToggles, toggleFirm,
  summaryToggles, toggleSummary, toggleFavorite, handleOpenShareMenu, handleLocalWriterClick,
  isAdmin, handleTriggerSummary, summaryRequestedIds, summaryCompletedIds, isAiSummary,
  hasSummaryContent, isShareOpen, setIsShareOpen, selectedReport, menuPosition, onSortChange,
}) {
  return (
    <section className="search-results-section">
      <div className="results-header">
        <h3>검색 결과 <span className="results-count">{totalCount}건</span></h3>
      </div>
      <div className="results-list-container">
        {error && offset === 0 ? <AsyncErrorState onRetry={retry} /> : offset === 0 && isLoading ? (
          <LoadingSkeleton rows={6} label="검색 결과 불러오는 중" />
        ) : filteredSortedDates.length === 0 && !isLoading ? (
          <div className="search-state-msg empty-msg"><span className="empty-icon">📂</span><p>조건에 일치하는 리포트 데이터가 존재하지 않습니다.<br />상단 필터 설정을 변경해 보세요.</p></div>
        ) : (
          <InfiniteScroll dataLength={offset} next={fetchReports} hasMore={hasMore} scrollThreshold={0.7} loader={<LoadingSkeleton variant="spinner" label="검색 결과 더 불러오는 중" />}>
            {filteredSortedDates.map((date) => (
              <ReportGroup key={date} date={date} items={reports[date]} isCollapsed={!!dateToggles[date]} onToggleDate={toggleDate} sortBy={selectedSort} isFavoritesPage={false} favorites={favorites} collapsedFirms={firmToggles} onToggleFirm={toggleFirm} expandedSummaries={summaryToggles} onToggleSummary={toggleSummary} onToggleFavorite={toggleFavorite} onOpenShareMenu={handleOpenShareMenu} onWriterClick={handleLocalWriterClick} showSortOptions={false} setSortBy={onSortChange} isAdmin={isAdmin} onTriggerSummary={handleTriggerSummary} summaryRequestedIds={summaryRequestedIds} summaryCompletedIds={summaryCompletedIds} isAiSummary={isAiSummary} hasSummaryContent={hasSummaryContent} />
            ))}
          </InfiniteScroll>
        )}
      </div>
      <ShareMenu isOpen={isShareOpen} onClose={() => setIsShareOpen(false)} reportData={selectedReport} position={menuPosition} />
    </section>
  );
}
