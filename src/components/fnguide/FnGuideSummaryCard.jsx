import React from 'react';
import { tokenizeFinancialHighlights } from '../../utils/fnguide';
import FnGuideCardActions from './FnGuideCardActions';
import FnGuideFinancialGrid from './FnGuideFinancialGrid';
import './FnGuideSummaryCard.css';

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
      <FnGuideFinancialGrid item={item} />
      <FnGuideCardActions item={item} />
    </article>
  );
}

export default FnGuideSummaryCard;
