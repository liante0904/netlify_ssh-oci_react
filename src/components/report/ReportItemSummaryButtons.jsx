import React from 'react';

export default function ReportItemSummaryButtons({ id, hasSummary, hasFnguideSummary, expanded, onToggle }) {
  if (!hasSummary && !hasFnguideSummary) return null;
  return <div className="report-summary-buttons">{hasSummary && <button className={`summary-toggle-btn ai-summary-btn ${expanded ? 'active' : ''}`} onClick={() => onToggle(id)}><span aria-hidden="true">▣</span>{expanded ? 'AI 요약 닫기 ▲' : 'AI 요약 보기 ▼'}</button>}{hasFnguideSummary && <button className={`summary-toggle-btn fnguide-summary-btn ${expanded ? 'active' : ''}`} onClick={() => onToggle(id)}><span aria-hidden="true">▤</span>{expanded ? 'FnGuide 요약 닫기 ▲' : 'FnGuide 요약 보기 ▼'}</button>}</div>;
}
