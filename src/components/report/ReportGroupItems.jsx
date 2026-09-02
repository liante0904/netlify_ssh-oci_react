import ReportItem from './ReportItem';

export default function ReportGroupItems({ reports, isFavoritesPage, favorites, isAiSummary, hasSummaryContent, showFirmTag, expandedSummaries, onToggleFavorite, onToggleSummary, onOpenShareMenu, onWriterClick, isAdmin, onTriggerSummary, summaryRequestedIds, summaryCompletedIds }) {
  return reports.filter((report) => (!isFavoritesPage || favorites[report.id]) && (!isAiSummary || hasSummaryContent(report))).map((report) => <ReportItem key={report.id} report={report} isFavorite={!!favorites[report.id]} isSummaryExpanded={expandedSummaries[report.id]} onToggleFavorite={onToggleFavorite} onToggleSummary={onToggleSummary} onOpenShareMenu={onOpenShareMenu} showFirmTag={showFirmTag} onWriterClick={onWriterClick} isAdmin={isAdmin} onTriggerSummary={onTriggerSummary} summaryRequestedIds={summaryRequestedIds} summaryCompletedIds={summaryCompletedIds} />);
}
