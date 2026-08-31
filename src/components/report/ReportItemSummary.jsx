import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

function ReportItemSummary({ geminiSummary, fnguideSummary, hasSummary }) {
  return (
    <div className="summary-inner-wrapper">
      {hasSummary && (
        <div className="summary-inner">
          <div className="summary-title-row">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="var(--primary-color)" aria-hidden="true">
              <path d="M19 5v14H5V5h14m0-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-4.86 8.86l-3 3.87L9 13.14 6 17h12l-3.86-5.14z" />
            </svg>
            AI 핵심 요약
          </div>
          <div className="summary-text">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{geminiSummary}</ReactMarkdown>
          </div>
        </div>
      )}

      {fnguideSummary && (
        <div className={`summary-inner fnguide-summary-section ${hasSummary ? 'has-gemini-summary' : ''}`}>
          <div className="summary-title-row fnguide-summary-title-row">
            <div className="fnguide-summary-title">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="#2e7d32" aria-hidden="true">
                <path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z" />
              </svg>
              <span>FnGuide 요약</span>
            </div>
            <div className="fnguide-meta-badges">
              {fnguideSummary.opinion && (
                <span className="fnguide-badge opinion-badge">의견: {fnguideSummary.opinion}</span>
              )}
              {fnguideSummary.target_price && fnguideSummary.target_price !== '0' && fnguideSummary.target_price !== '-' && (
                <span className="fnguide-badge target-price-badge">목표가: {fnguideSummary.target_price}</span>
              )}
            </div>
          </div>
          <div className="summary-text fnguide-summary-text">{fnguideSummary.summary_text}</div>
        </div>
      )}
    </div>
  );
}

export default ReportItemSummary;
