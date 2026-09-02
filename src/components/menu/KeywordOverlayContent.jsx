import React from 'react';
import LoadingSkeleton from '../LoadingSkeleton';

export default function KeywordOverlayContent({ keywords, loading, onDelete, onDeleteAll }) {
  return <div className="grid-overlay-content"><div className="keyword-management-container"><div className="keyword-status-info"><span className="count-badge">등록된 키워드: {keywords.length}개</span>{keywords.length > 0 && <button className="delete-all-btn" onClick={onDeleteAll}>전체 삭제</button>}</div><div className="keyword-large-list">{loading ? <LoadingSkeleton rows={3} label="키워드 불러오는 중" /> : keywords.length > 0 ? <div className="keyword-grid">{keywords.map((keyword) => <div key={keyword.keyword} className="keyword-large-tag"><span className="keyword-text">{keyword.keyword}</span><button className="keyword-delete-btn" onClick={() => onDelete(keyword.keyword)} aria-label={`${keyword.keyword} 삭제`}>×</button></div>)}</div> : <div className="keyword-empty-state"><div className="empty-icon">🔔</div><p>등록된 키워드가 없습니다.<br />위에서 키워드를 추가해보세요!</p></div>}</div></div></div>;
}
