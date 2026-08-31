import React from 'react';

function ReportListFilters({ tagFilter, onClearTagFilter, isOutlook, isLoading, outlookYear, onSetOutlookYear }) {
  return (
    <>
      {tagFilter && (
        <div className="tag-filter-bar">
          <span className="tag-filter-label">🔍 필터: <strong>{tagFilter.keyword}</strong><span className="tag-filter-type">({tagFilter.category})</span></span>
          <button className="tag-filter-clear-btn" onClick={onClearTagFilter} title="필터 해제">✕ 해제</button>
        </div>
      )}
      {isOutlook && !isLoading && (
        <div className="outlook-year-filter">
          <button className={`year-chip ${outlookYear === null ? 'active' : ''}`} onClick={() => onSetOutlookYear(null)}>전체</button>
          {[2026, 2025, 2024, 2023].map((year) => (
            <button key={year} className={`year-chip ${outlookYear === year ? 'active' : ''}`} onClick={() => onSetOutlookYear(outlookYear === year ? null : year)}>{year}년</button>
          ))}
        </div>
      )}
    </>
  );
}

export default ReportListFilters;
