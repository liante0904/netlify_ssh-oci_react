import React from 'react';

export default function PDFViewerHeader({ firm, title, copied, onShare, onCopy, closeButtonRef, onClose }) {
  return <div className="pdf-viewer-header">
    <div className="pdf-viewer-header-left">
      {firm && <span className="pdf-viewer-firm-badge">{firm}</span>}
      <div id="pdf-viewer-title" className="pdf-viewer-title">{title || 'PDF 리포트 뷰어'}</div>
    </div>
    <div className="pdf-viewer-header-actions">
      <button className="pdf-viewer-share-btn" onClick={onShare} title="카카오톡 공유" aria-label="카카오톡 공유"><svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 14c-3.36 0-6-2.64-6-6s2.64-6 6-6 6 2.64 6 6-2.64 6-6 6zm-2-6c0 .55.45 1 1 1s1-.45 1-1-.45-1-1-1-1 .45-1 1zm4 0c0 .55.45 1 1 1s1-.45 1-1-.45-1-1-1-1 .45-1 1z" /></svg></button>
      <button className="pdf-viewer-share-btn" onClick={onCopy} title="URL 복사" aria-label="URL 복사">{copied ? <svg viewBox="0 0 24 24" width="18" height="18" fill="#34c759"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" /></svg> : <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z" /></svg>}</button>
      <button ref={closeButtonRef} className="pdf-viewer-close" onClick={onClose} aria-label="뷰어 닫기"><svg viewBox="0 0 24 24" width="24" height="24"><path d="M18.3 5.71 12 12l6.3 6.29-1.41 1.41L10.59 13.41 2.88 18.29 9.17 12 2.88 5.71 4.29 4.3l6.3 6.29z" /></svg></button>
    </div>
  </div>;
}
