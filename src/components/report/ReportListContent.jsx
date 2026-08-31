import InfiniteScroll from 'react-infinite-scroll-component';
import MenuSummary from '../MenuSummary';
import ReportListFilters from './ReportListFilters';
import ReportGroup from './ReportGroup';
import ShareMenu from '../ShareMenu';
import AsyncErrorState from '../AsyncErrorState';
import LoadingSkeleton from '../LoadingSkeleton';

export default function ReportListContent({ meta, filters, data, controls, share, options }) {
  const { displayReports, filteredDates } = data;
  const { isLoading, error, offset, retry, fetchReports, hasMore } = controls;
  return <div className="report-list-wrapper"><div className="container" id="report-container"><MenuSummary menuName={meta.title} description={meta.description} summaryItems={meta.summaryItems} variant="compact" /><ReportListFilters {...filters} />{error && offset === 0 ? <AsyncErrorState onRetry={retry} /> : offset === 0 && isLoading ? <LoadingSkeleton rows={6} label="리포트 불러오는 중" /> : !filteredDates.length && !isLoading ? <div className="empty-favorites"><div className="empty-icon">{options.isAiSummary ? '🤖' : options.isOutlook ? '🔮' : '★'}</div><p>{options.emptyMessage}</p></div> : <InfiniteScroll dataLength={offset} next={fetchReports} hasMore={options.isFavoritesPage ? false : hasMore} scrollThreshold={0.6}>{filteredDates.map((date, index) => <ReportGroup key={date} date={date} items={displayReports[date]} isCollapsed={!!options.collapsedDates[date]} onToggleDate={options.onToggleDate} sortBy={options.sortBy} isFavoritesPage={options.isFavoritesPage} favorites={options.favorites} collapsedFirms={options.collapsedFirms} onToggleFirm={options.onToggleFirm} expandedSummaries={options.expandedSummaries} onToggleSummary={options.onToggleSummary} onToggleFavorite={options.onToggleFavorite} onOpenShareMenu={share.onOpen} onWriterClick={options.onWriterClick} showSortOptions={index === 0 && options.isRecent && !options.isSearchActive} setSortBy={options.setSortBy} isAdmin={options.isAdmin} onTriggerSummary={options.onTriggerSummary} summaryRequestedIds={options.summaryRequestedIds} summaryCompletedIds={options.summaryCompletedIds} isAiSummary={options.isAiSummary} hasSummaryContent={options.hasSummaryContent} showTagCloud={options.isRecent && !options.isSearchActive} onTagClick={options.onTagClick} />)}</InfiniteScroll>}{isLoading && offset > 0 && <LoadingSkeleton variant="spinner" label="리포트 더 불러오는 중" />}</div><ShareMenu isOpen={share.isOpen} onClose={share.onClose} reportData={share.report} position={share.position} /></div>;
}
