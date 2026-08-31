import React from 'react';
import { calculateUpsidePercent, formatUpsidePercent } from '../../utils/financial';
import { tokenizeFinancialHighlights } from '../../utils/fnguide';

function HighlightedSummary({ text }) {
  return tokenizeFinancialHighlights(text).map((token, index) => (
    token.highlighted
      ? <strong className={token.kind === 'financial' ? 'financial-highlight' : `investment-keyword-highlight ${token.kind}`} key={`${token.text}-${index}`}>{token.text}</strong>
      : <React.Fragment key={`${index}-${token.text.slice(0, 12)}`}>{token.text}</React.Fragment>
  ));
}

function FnGuideSummaryCard({ item, showCompany, isSelected, isExpanded, selectedIndex, visibleSummaries, onNavigate, onToggleExpand }) {
  const previousSummary = selectedIndex > 0 ? visibleSummaries[selectedIndex - 1] : null;
  const nextSummary = selectedIndex >= 0 && selectedIndex < visibleSummaries.length - 1
    ? visibleSummaries[selectedIndex + 1]
    : null;
  const upsidePercent = calculateUpsidePercent(item.target_price, item.prev_close);
  const hasTargetPrice = Boolean(item.target_price && item.target_price !== '0');
  const textLimit = 300;
  const needsTruncate = item.summary_text && item.summary_text.length > textLimit;
  const displayText = isExpanded
    ? item.summary_text
    : (item.summary_text ? `${item.summary_text.slice(0, textLimit)}${needsTruncate ? '...' : ''}` : '');

  return (
    <article id={`fnguide-summary-${item.summary_id}`} className={`fnguide-card ${isSelected ? 'selected-summary' : ''} ${isExpanded ? 'expanded-summary' : ''}`}>
      {isSelected && <div className="selected-summary-label">선택한 레포트</div>}
      {isSelected && visibleSummaries.length > 1 && (
        <nav className="summary-sequence-nav" aria-label="선택한 레포트 이동">
          <button type="button" className="summary-sequence-btn" disabled={!previousSummary} onClick={() => previousSummary && onNavigate(previousSummary.summary_id)} aria-label={previousSummary ? `이전 레포트: ${previousSummary.company_name}` : '이전 레포트 없음'}><span aria-hidden="true">←</span><span>이전</span></button>
          <span className="summary-sequence-position">{selectedIndex + 1} / {visibleSummaries.length}</span>
          <button type="button" className="summary-sequence-btn" disabled={!nextSummary} onClick={() => nextSummary && onNavigate(nextSummary.summary_id)} aria-label={nextSummary ? `다음 레포트: ${nextSummary.company_name}` : '다음 레포트 없음'}><span>다음</span><span aria-hidden="true">→</span></button>
        </nav>
      )}
      <div className="card-top-meta"><span className="card-provider-badge">{item.provider || '증권사 미상'}</span>{item.author && <span className="card-author-badge">{item.author}</span>}</div>
      {showCompany && <div className="card-company-section"><span className="card-company-name">{item.company_name}</span>{item.company_code && <span className="card-company-code">{item.company_code}</span>}</div>}
      <h3 className="card-report-title">{item.report_title}</h3>
      {item.summary_text ? <div className="card-summary-text"><p className="summary-preserve-lines"><HighlightedSummary text={displayText} /></p>{needsTruncate && <button type="button" className="toggle-expand-btn" onClick={() => onToggleExpand(item.summary_id)} aria-expanded={Boolean(isExpanded)}>{isExpanded ? '접기 ▲' : '더보기 ▼'}</button>}</div> : <div className="card-summary-empty">요약 정보 본문이 없습니다.</div>}
      <div className="card-financial-grid">
        <div className="grid-cell"><span className="cell-label">투자의견</span><strong className="cell-value opinion">{item.opinion || '-'}</strong></div>
        <div className="grid-cell"><span className="cell-label">목표가</span><strong className="cell-value target-price">{hasTargetPrice ? item.target_price : '-'}</strong></div>
        <div className="grid-cell"><span className="cell-label">직전 종가</span><strong className="cell-value prev-close">{item.prev_close && item.prev_close !== '0' ? item.prev_close : '-'}</strong></div>
        <div className="grid-cell"><span className="cell-label">상승여력</span><strong className={`cell-value upside ${upsidePercent === null ? '' : upsidePercent >= 0 ? 'positive' : 'negative'}`}>{upsidePercent === null ? '-' : formatUpsidePercent(upsidePercent)}</strong></div>
      </div>
      {hasTargetPrice && upsidePercent === null && <p className="upside-data-note">직전 종가 데이터가 없어 상승여력을 계산하지 못했습니다.</p>}
      <div className="card-actions">
        {item.pdf_url && <a href={item.pdf_url} target="_blank" rel="noopener noreferrer" className="pdf-action-btn pdf-action-primary" title="PDF 원문 보기"><span aria-hidden="true">📄</span> PDF 보기</a>}
        {(item.pdf_url || item.article_url) && <a href={item.pdf_url || item.article_url} target="_blank" rel="noopener noreferrer" className="pdf-action-btn pdf-action-fnguide">↗ FnGuide 원문 보기</a>}
        {item.sec_reports?.map((secReport) => {
          const reportUrl = secReport.pdf_file_url || secReport.telegram_url;
          if (!reportUrl) return null;
          return <a key={secReport.report_id} href={reportUrl} target="_blank" rel="noopener noreferrer" className="pdf-action-btn sec-pdf-btn" title={`${secReport.firm_nm}: ${secReport.article_title}`}>📄 {secReport.firm_nm} 원본 PDF 보기</a>;
        })}
      </div>
    </article>
  );
}

export default FnGuideSummaryCard;
