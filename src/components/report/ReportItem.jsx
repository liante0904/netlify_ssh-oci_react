import React from 'react';
import { getDirectUrl } from '../../utils/reportLinks';
import { useReport } from '../../context/useReport';
import ReportItemSummary from './ReportItemSummary';
import ReportItemActions from './ReportItemActions';
import ReportItemAdminSummary from './ReportItemAdminSummary';
import ReportItemSummaryButtons from './ReportItemSummaryButtons';
import { getReportItemViewModel } from '../../utils/reportItemViewModel';
import { useReportItemActions } from '../../hooks/useReportItemActions';
import './ReportSummaryControls.css';
import './ReportSummaryContent.css';

const ReportItem = ({ report, isFavorite, isSummaryExpanded, onToggleFavorite, onToggleSummary, onOpenShareMenu, showFirmTag, onWriterClick, isAdmin, onTriggerSummary, summaryRequestedIds, summaryCompletedIds }) => {
  const { telegramUser, llmVisibility } = useReport();
  const viewModel = getReportItemViewModel(report, { isAdmin, telegramUser, llmVisibility });
  const { id, title, writer, firm, geminiSummary, fnguideSummary, rating, revisionType, reportType, stockTickers, visibleTags, canDownloadArchive, hasSummary, hasFnguideSummary, hasAnySummary, hasUnverifiedValuation, hasDirectSignal, formattedTargetPrice } = viewModel;
  const isSummaryRequested = summaryRequestedIds?.has(id);
  const isSummaryCompleted = summaryCompletedIds?.has(id);
  const { handleViewerClick, handleArchiveDownload, handlePrefetch, isArchiveDownloading, toast, showToast } = useReportItemActions(report);
  const finalLink = getDirectUrl(report);

  return (
    <div className={`report-container-item ${hasAnySummary ? 'has-summary' : ''}`} key={id}>
      <div className="report">
        <div className="report-content">
          <div className="report-header">
            {showFirmTag && <span className="firm-tag">{firm}</span>}
            <div className="report-title-container">
              <a href={finalLink} target="_blank" rel="noopener noreferrer" className="report-title">{title}</a>
              {hasSummary && <span className="ai-badge" onClick={() => onToggleSummary(id)}>AI 요약</span>}
              {hasFnguideSummary && <span className="ai-badge fnguide-badge-title" onClick={() => onToggleSummary(id)}>FnGuide 요약</span>}
            </div>
          </div>
          {hasDirectSignal && <div className="report-signals" aria-label="리포트 투자 신호">
            {hasUnverifiedValuation && rating && <span className="signal signal-rating">출처 확인 필요 · 의견 {rating}</span>}
            {hasUnverifiedValuation && formattedTargetPrice && <span className="signal signal-target">출처 확인 필요 · 목표가 {formattedTargetPrice}</span>}
            {hasUnverifiedValuation && revisionType && <span className="signal signal-revision">출처 확인 필요 · {revisionType}</span>}
            {reportType && <span className="signal signal-type">{reportType}</span>}
            {stockTickers.map((ticker) => <span key={`ticker-${ticker}`} className="signal signal-ticker">{ticker}</span>)}
          </div>}
          {visibleTags.length > 0 && <div className="report-tags">{visibleTags.map(({ value, type }, index) => <span key={`${type}-${index}`} className={`tag tag-${type}`}>{value}</span>)}</div>}
          {isAdmin && <ReportItemAdminSummary id={id} report={report} hasSummary={hasSummary} isSummaryRequested={isSummaryRequested} isSummaryCompleted={isSummaryCompleted} onTriggerSummary={onTriggerSummary} showToast={showToast} />}
          <ReportItemSummaryButtons id={id} hasSummary={hasSummary} hasFnguideSummary={hasFnguideSummary} expanded={isSummaryExpanded} onToggle={onToggleSummary} />
          <div className="report-footer">
            <p className={`report-writer ${onWriterClick ? 'clickable' : ''}`} onClick={() => onWriterClick?.(writer)}>작성자: {writer} <span className="writer-search-icon">🔍</span></p>
            <ReportItemActions report={report} id={id} isFavorite={isFavorite} canDownloadArchive={canDownloadArchive} isArchiveDownloading={isArchiveDownloading} handleArchiveDownload={handleArchiveDownload} handleViewerClick={handleViewerClick} handlePrefetch={handlePrefetch} onToggleFavorite={onToggleFavorite} onOpenShareMenu={onOpenShareMenu} />
          </div>
        </div>
      </div>
      {hasAnySummary && <div className={`summary-content ${isSummaryExpanded ? 'expanded' : 'collapsed'}`}><ReportItemSummary geminiSummary={geminiSummary} fnguideSummary={hasFnguideSummary ? fnguideSummary : null} hasSummary={hasSummary} /></div>}
      {toast.visible && <div className="toast-container visible">{toast.message}</div>}
    </div>
  );
};

export default ReportItem;
