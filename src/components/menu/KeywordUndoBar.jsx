import React from 'react';

export default function KeywordUndoBar({ lastDeleted, onUndo }) {
  if (!lastDeleted) return null;
  return <div className="undo-bar-container"><div className="undo-bar"><span className="undo-msg">{lastDeleted.type === 'bulk' ? '전체 삭제되었습니다' : `'${lastDeleted.data[0]}' 키워드가 삭제되었습니다`}</span><button className="undo-btn" onClick={onUndo}>삭제 취소</button></div></div>;
}
