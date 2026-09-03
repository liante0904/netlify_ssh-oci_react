import React from 'react';
import { getDirectUrl } from '../../utils/reportLinks';
import { useReport } from '../../context/useReport';
import ReportItemSummary from './ReportItemSummary';
import ReportItemActions from './ReportItemActions';
import ReportItemAdminSummary from './ReportItemAdminSummary';
import ReportItemSummaryButtons from './ReportItemSummaryButtons';
import ReportItemMetadata from './ReportItemMetadata';
import { getReportItemViewModel } from '../../utils/reportItemViewModel';
import { useReportItemActions } from '../../hooks/useReportItemActions';
import './ReportSummaryControls.css';
import './ReportSummaryContent.css';

const ReportItem = ({ report, isFavorite, isSummaryExpanded, onToggleFavorite, onToggleSummary, onOpenShareMenu, showFirmTag, onWriterClick, onTagClick, isAdmin, onTriggerSummary, summaryRequestedIds, summaryCompletedIds }) => {
  const { telegramUser, llmVisibility } = useReport();
  const viewModel = getReportItemViewModel(report, { isAdmin, telegramUser, llmVisibility });
  const { id, title, writer, firm, geminiSummary, fnguideSummary, rating, revisionType, reportType, stockTickers, visibleTags, canDownloadArchive, hasSummary, hasFnguideSummary, hasAnySummary, hasUnverifiedValuation, hasDirectSignal, formattedTargetPrice } = viewModel;
  const isSummaryRequested = summaryRequestedIds?.has(id);
  const isSummaryCompleted = summaryCompletedIds?.has(id);
  const { handleViewerClick, handleArchiveDownload, handleSecureShare, handlePrefetch, isArchiveDownloading, isSecureSharing, toast, showToast } = useReportItemActions(report);
  const finalLink = getDirectUrl(report);

  return (
    <div className={`report-container-item ${hasAnySummary ? 'has-summary' : ''}`} key={id}>
      <div className="report">
        <div className="report-content">
          <ReportItemMetadata firm={firm} title={title} finalLink={finalLink} showFirmTag={showFirmTag} hasSummary={hasSummary} hasFnguideSummary={hasFnguideSummary} onToggleSummary={onToggleSummary} id={id} hasDirectSignal={hasDirectSignal} hasUnverifiedValuation={hasUnverifiedValuation} rating={rating} formattedTargetPrice={formattedTargetPrice} revisionType={revisionType} reportType={reportType} stockTickers={stockTickers} visibleTags={visibleTags} onTagClick={onTagClick} />
          {isAdmin && <ReportItemAdminSummary id={id} report={report} hasSummary={hasSummary} isSummaryRequested={isSummaryRequested} isSummaryCompleted={isSummaryCompleted} onTriggerSummary={onTriggerSummary} showToast={showToast} />}
          <ReportItemSummaryButtons id={id} hasSummary={hasSummary} hasFnguideSummary={hasFnguideSummary} expanded={isSummaryExpanded} onToggle={onToggleSummary} />
          <div className="report-footer">
            <p className={`report-writer ${onWriterClick ? 'clickable' : ''}`} onClick={() => onWriterClick?.(writer)}>작성자: {writer} <span className="writer-search-icon">🔍</span></p>
            <ReportItemActions report={report} id={id} isFavorite={isFavorite} canDownloadArchive={canDownloadArchive} isArchiveDownloading={isArchiveDownloading} isSecureSharing={isSecureSharing} handleArchiveDownload={handleArchiveDownload} handleSecureShare={handleSecureShare} handleViewerClick={handleViewerClick} handlePrefetch={handlePrefetch} onToggleFavorite={onToggleFavorite} onOpenShareMenu={onOpenShareMenu} />
          </div>
        </div>
      </div>
      {hasAnySummary && <div className={`summary-content ${isSummaryExpanded ? 'expanded' : 'collapsed'}`}><ReportItemSummary geminiSummary={geminiSummary} fnguideSummary={hasFnguideSummary ? fnguideSummary : null} hasSummary={hasSummary} /></div>}
      {toast.visible && <div className="toast-container visible">{toast.message}</div>}
    </div>
  );
};

export default ReportItem;
