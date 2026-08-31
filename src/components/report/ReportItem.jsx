import React, { useState } from 'react';
import { getArchiveDownloadUrl, getDirectUrl, prefetchPdf } from '../../utils/reportLinks';
import { useReport } from '../../context/useReport';
import ReportItemSummary from './ReportItemSummary';

const ReportItem = ({ 
  report, 
  isFavorite, 
  isSummaryExpanded, 
  onToggleFavorite, 
  onToggleSummary, 
  onOpenShareMenu,
  showFirmTag,
  onWriterClick,
  isAdmin,
  onTriggerSummary,
  summaryRequestedIds,
  summaryCompletedIds
}) => {
  const {
    id, title, writer, gemini_summary, fnguide_summary, firm, pdf_file_url,
    tags, stock_names, stock_tickers, sector, target_price, rating, revision_type,
    report_type
  } = report;
  const { setViewerReport, telegramUser, llmVisibility } = useReport();
  const [showConfirm, setShowConfirm] = useState(null);
  const [isArchiveDownloading, setIsArchiveDownloading] = useState(false);
  /* 기존 주석 유지: 요약 요청 및 완료 여부 파악 */
  const isSummaryRequested = summaryRequestedIds?.has(id);
  const isSummaryCompleted = summaryCompletedIds?.has(id);
  
  /* 글래스모피즘 토스트 전용 컴포넌트 상태 정의 */
  const [toast, setToast] = useState({ visible: false, message: '' });
  
  const showToast = (message) => {
    setToast({ visible: true, message });
    setTimeout(() => {
      setToast({ visible: false, message: '' });
    }, 3000);
  };
  
  const finalLink = getDirectUrl(report);
  const canDownloadArchive = report.pdf_archive?.archive_status === 'ARCHIVED'
    && Boolean(report.pdf_archive?.storage_key);

  const handleViewerClick = () => {
    if (firm === '현대차증권' && pdf_file_url) {
      setViewerReport({ ...report, link: pdf_file_url });
    } else {
      setViewerReport(report);
    }
  };

  const handleArchiveDownload = async () => {
    if (isArchiveDownloading) return;
    setIsArchiveDownloading(true);
    try {
      const response = await fetch(getArchiveDownloadUrl(id));
      if (!response.ok) throw new Error('archive download failed');
      const blob = await response.blob();
      const downloadUrl = URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = downloadUrl;
      anchor.download = report.pdf_archive?.file_name || `[${firm}] ${title}.pdf`;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      URL.revokeObjectURL(downloadUrl);
    } catch {
      showToast('아카이브 PDF를 내려받지 못했습니다. 잠시 후 다시 시도해 주세요.');
    } finally {
      setIsArchiveDownloading(false);
    }
  };

  // 프리패치 로직: 서버 미리 깨우기 (Cold Start 방지)
  const handlePrefetch = () => {
    const origin = window.location.origin;
    // 람다만 깨우면 되므로 복잡한 인자 생략
    const proxyUrl = `${origin}/.netlify/functions/proxy?warmup=true`;
    const shareUrl = `${origin}/.netlify/functions/share?warmup=true`;
    
    fetch(proxyUrl, { method: 'HEAD', mode: 'no-cors' }).catch(() => {});
    fetch(shareUrl, { method: 'HEAD', mode: 'no-cors' }).catch(() => {});

    prefetchPdf(report, origin);
  };
  
  // LLM 요약 노출 범위에 따른 판단 (기존 주석 유지 및 추가 권한 마스킹)
  const isLlmSummaryVisible = () => {
    const rawHasSummary = gemini_summary && gemini_summary.trim() !== "" && gemini_summary.trim() !== " ";
    if (!rawHasSummary) return false;
    
    // 설정 범위에 따른 마스킹 처리
    if (llmVisibility === 'admin') {
      return !!isAdmin;
    }
    if (llmVisibility === 'telegram') {
      return !!telegramUser;
    }
    // 기본적으로는 관리자만 노출
    return !!isAdmin;
  };

  const hasSummary = isLlmSummaryVisible();
  const hasFnguideSummary = !!fnguide_summary?.summary_text?.trim();
  const hasAnySummary = hasSummary || hasFnguideSummary;
  // target_price/rating is historically almost entirely FnGuide-derived.
  // Do not show it as a second, broker-originated signal beside the FnGuide card.
  // Industry/macro reports do not carry a single-company recommendation.
  // Historical enrichment wrote BUY/MAINTAIN defaults to some of these rows;
  // never present those defaults as an investment signal.
  const hasCompanyContext = report_type === 'COMPANY'
    || Boolean(stock_tickers?.length)
    || Boolean(stock_names?.length);
  const hasUnverifiedValuation = !fnguide_summary
    && hasCompanyContext
    && Boolean(target_price || rating || revision_type);
  const hasDirectSignal = Boolean(hasUnverifiedValuation || report_type || stock_tickers?.length);
  const formattedTargetPrice = Number.isFinite(Number(target_price)) && Number(target_price) > 0
    ? Number(target_price).toLocaleString('ko-KR')
    : null;

  return (
    <div className={`report-container-item ${hasAnySummary ? 'has-summary' : ''}`} key={id}>
      <div className="report">
        <div className="report-content">
          <div className="report-header">
            {showFirmTag && <span className="firm-tag">{firm}</span>}
            <div className="report-title-container">
              <a href={finalLink} target="_blank" rel="noopener noreferrer" className="report-title">
                {title}
              </a>
              {hasSummary && (
                <span className="ai-badge" onClick={() => onToggleSummary(id)}>
                  AI 요약
                </span>
              )}
              {hasFnguideSummary && (
                <span className="ai-badge fnguide-badge-title" onClick={() => onToggleSummary(id)}>
                  FnGuide 요약
                </span>
              )}
            </div>
          </div>
          {hasDirectSignal && (
            <div className="report-signals" aria-label="리포트 투자 신호">
              {hasUnverifiedValuation && rating && <span className="signal signal-rating">출처 확인 필요 · 의견 {rating}</span>}
              {hasUnverifiedValuation && formattedTargetPrice && <span className="signal signal-target">출처 확인 필요 · 목표가 {formattedTargetPrice}</span>}
              {hasUnverifiedValuation && revision_type && <span className="signal signal-revision">출처 확인 필요 · {revision_type}</span>}
              {report_type && <span className="signal signal-type">{report_type}</span>}
              {stock_tickers?.slice(0, 3).map((ticker) => (
                <span key={`ticker-${ticker}`} className="signal signal-ticker">{ticker}</span>
              ))}
            </div>
          )}
          {(tags && tags.length > 0 || stock_names && stock_names.length > 0 || sector) && (
            <div className="report-tags">
              {sector && <span className="tag tag-sector">{sector}</span>}
              {stock_names && stock_names.slice(0, 3).map((s, i) => (
                <span key={`stock-${i}`} className="tag tag-stock">{s}</span>
              ))}
              {tags && tags
                .filter(t => t !== sector && !stock_names?.includes(t))
                .slice(0, 5)
                .map((t, i) => (
                  <span key={`tag-${i}`} className="tag tag-keyword">{t}</span>
                ))}
            </div>
          )}
          
          {/* 관리자 요약 요청 버튼 영역 (report-tags 아래 배치하여 가시성 및 사용성 개선) */}
          {isAdmin && (
            <div className="admin-summary-section">
              <span className="admin-summary-label">AI 요약 요청:</span>
              {!isSummaryRequested && !isSummaryCompleted && (
                <span className="admin-summary-confirm">
                  <button 
                    className={`admin-summary-btn deepseek-btn ${showConfirm === 'deepseek' ? 'active' : ''}`}
                    onClick={() => setShowConfirm(showConfirm === 'deepseek' ? null : 'deepseek')}
                    title={hasSummary ? "DeepSeek AI 요약 재처리 요청" : "DeepSeek AI 요약 생성"}
                  >
                    <span className="summary-btn-icon summary-btn-icon-deepseek">!</span>
                    <span>DeepSeek</span>
                  </button>
                  <button 
                    className={`admin-summary-btn antigravity-btn ${showConfirm === 'ag' ? 'active' : ''}`}
                    onClick={() => setShowConfirm(showConfirm === 'ag' ? null : 'ag')}
                    title={hasSummary ? "Gemini AI 요약 재처리 요청" : "Gemini AI 요약 생성"}
                  >
                    <span className="summary-btn-icon summary-btn-icon-gemini">▲</span>
                    <span>Gemini</span>
                  </button>
                  {showConfirm && (
                    <span className="admin-summary-confirm-btns-wrapper">
                      {hasSummary && (
                        <span className="re-summarize-tooltip">
                          ⚠️ 이미 요약이 존재합니다. 재처리하시겠습니까?
                        </span>
                      )}
                      <span className="admin-summary-confirm-btns">
                        <button 
                          className="confirm-yes" 
                          onClick={() => { 
                            const engine = showConfirm; 
                            setShowConfirm(null); 
                            if (hasSummary) {
                              showToast("기존 요약이 존재하여 AI 재처리 요약을 요청합니다...");
                            } else {
                              showToast("AI 요약 요청을 시작합니다...");
                            }
                            onTriggerSummary(id, engine, hasSummary, report);
                          }}
                        >
                          ✓
                        </button>
                        <button className="confirm-no" onClick={() => setShowConfirm(null)}>✗</button>
                      </span>
                    </span>
                  )}
                </span>
              )}
              {isSummaryRequested && !isSummaryCompleted && (
                <span className="summary-requested-badge">요청됨</span>
              )}
              {isSummaryCompleted && (
                <span className="summary-completed-badge">✓</span>
              )}
            </div>
          )}
          
          {/* 요약 토글 버튼 영역 (태그 영역 아래 배치하여 작성자 뭉개짐 방지 및 개별 요약 가시성 증대) */}
          {hasAnySummary && (
            <div className="report-summary-buttons">
              {hasSummary && (
                <button 
                  className={`summary-toggle-btn ai-summary-btn ${isSummaryExpanded ? 'active' : ''}`}
                  onClick={() => onToggleSummary(id)}
                >
                  <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
                    <path d="M19 5v14H5V5h14m0-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-4.86 8.86l-3 3.87L9 13.14 6 17h12l-3.86-5.14z"/>
                  </svg>
                  {isSummaryExpanded ? 'AI 요약 닫기 ▲' : 'AI 요약 보기 ▼'}
                </button>
              )}
              {hasFnguideSummary && (
                <button 
                  className={`summary-toggle-btn fnguide-summary-btn ${isSummaryExpanded ? 'active' : ''}`}
                  onClick={() => onToggleSummary(id)}
                >
                  <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
                    <path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"/>
                  </svg>
                  {isSummaryExpanded ? 'FnGuide 요약 닫기 ▲' : 'FnGuide 요약 보기 ▼'}
                </button>
              )}
            </div>
          )}

          <div className="report-footer">
            <p className={`report-writer ${onWriterClick ? 'clickable' : ''}`} onClick={() => onWriterClick?.(writer)}>
              작성자: {writer} <span className="writer-search-icon">🔍</span>
            </p>
            <div className="report-actions">
              {canDownloadArchive && (
                <button
                  className="viewer-button archive-download-button"
                  onClick={handleArchiveDownload}
                  disabled={isArchiveDownloading}
                  title={isArchiveDownloading ? 'Google Drive에서 PDF를 준비 중입니다' : 'Google Drive 아카이브 PDF 다운로드'}
                  aria-label="아카이브 PDF 다운로드"
                >
                  {isArchiveDownloading ? <span aria-hidden="true">…</span> : (
                    <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" aria-hidden="true">
                      <path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z" />
                    </svg>
                  )}
                </button>
              )}
              <button 
                className="viewer-button" 
                onClick={handleViewerClick}
                onMouseEnter={handlePrefetch}
                onTouchStart={handlePrefetch}
                title="인앱 뷰어로 즉시 보기"
                aria-label="인앱 뷰어로 즉시 보기"
              >
                <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                  <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/>
                </svg>
              </button>
              <button 
                className={`favorite-button ${isFavorite ? 'active' : ''}`}
                onClick={() => onToggleFavorite(id)}
                title={isFavorite ? "즐겨찾기 해제" : "즐겨찾기 추가"}
                aria-label={isFavorite ? "즐겨찾기 해제" : "즐겨찾기 추가"}
              >
                <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                  <path d={isFavorite 
                    ? "M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"
                    : "M22 9.24l-7.19-.62L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21 12 17.27 18.18 21l-1.63-7.03L22 9.24zM12 15.4l-3.76 2.27 1-4.28-3.32-2.88 4.38-.38L12 6.1l1.71 4.04 4.38.38-3.32 2.88 1 4.28L12 15.4z"}
                  />
                </svg>
              </button>
              <button 
                className="share-button" 
                onClick={(e) => onOpenShareMenu(e, report)}
                title="공유하기"
              >
                <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                  <path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92 1.61 0 2.92-1.31 2.92-2.92s-1.31-2.92-2.92-2.92z"/>
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
      {hasAnySummary && (
        <div className={`summary-content ${isSummaryExpanded ? 'expanded' : 'collapsed'}`}>
          <ReportItemSummary
            geminiSummary={gemini_summary}
            fnguideSummary={hasFnguideSummary ? fnguide_summary : null}
            hasSummary={hasSummary}
          />
        </div>
      )}
      {/* 글래스모피즘 토스트 UI 렌더링 */}
      {toast.visible && (
        <div className={`toast-container ${toast.visible ? 'visible' : ''}`}>
          {toast.message}
        </div>
      )}
    </div>
  );
};

export default ReportItem;
