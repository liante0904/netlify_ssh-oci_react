import React from 'react';

export default function KeywordOverlayHeader({ value, onChange, onAdd, onClose }) {
  return <div className="grid-overlay-header"><div className="grid-header-top"><h3>알림 키워드 설정</h3><button className="grid-close-btn" onClick={onClose} aria-label="알림 키워드 설정 닫기">×</button></div><div className="keyword-overlay-desc">관심 있는 <b>종목명(예: 삼성전자)</b>이나 <b>애널리스트 이름</b>을 등록해 보세요.<br />레포트 제목이나 작성자 정보에 해당 키워드가 포함되면 즉시 알려드립니다.</div><div className="grid-search-wrapper keyword-input-wrapper"><input type="text" placeholder="키워드 입력" value={value} onChange={(event) => onChange(event.target.value)} onKeyDown={(event) => event.key === 'Enter' && onAdd()} /><button className="keyword-add-btn" onClick={onAdd}>추가</button></div></div>;
}
