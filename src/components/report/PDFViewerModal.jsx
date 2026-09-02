import React, { useCallback, useMemo, useRef, useState } from 'react';
import { getProxyPdfUrl } from '../../utils/reportLinks';
import LoadingSkeleton from '../LoadingSkeleton';
import './PDFViewerModal.css';
import PDFPageList from './PDFPageList';
import PDFPageCanvas from './PDFPageCanvas';
import { usePdfDocument } from '../../hooks/usePdfDocument';
import { usePdfModalLifecycle, usePdfViewport } from '../../hooks/usePdfModalLifecycle';

// ---------------------------------------------------------------------------
// PDFViewerModal
// ---------------------------------------------------------------------------
const PDFViewerModal = ({ report, onClose }) => {
  const bodyRef = useRef(null);
  const modalRef = useRef(null);
  const closeButtonRef = useRef(null);
  const [copied, setCopied] = useState(false);
  usePdfModalLifecycle({ report, onClose, modalRef, closeButtonRef });

  const { title = '', firm = '', writer = '', shareUrl = '' } = report || {};
  const proxyUrl = useMemo(() => report ? getProxyPdfUrl(report, window.location.origin) : '', [report]);
  const { loading, pages, scale, setScale, pageWidthRef } = usePdfDocument({ report, proxyUrl, bodyRef });

  usePdfViewport({ bodyRef, pageWidthRef, setScale });

  const copyUrl = useCallback(async () => { try { await navigator.clipboard.writeText(shareUrl || window.location.href); setCopied(true); setTimeout(() => setCopied(false), 2000); } catch { /* clipboard unavailable */ } }, [shareUrl]);

  const kakaoShare = useCallback(() => {
    const st = `[${firm}] ${title}`;
    if (window.Kakao?.isInitialized()) {
      window.Kakao.Share.sendDefault({ objectType: 'feed', content: { title: st, description: writer ? `작성자: ${writer}` : '', imageUrl: 'https://ssh-oci.netlify.app/og-image.png', link: { mobileWebUrl: shareUrl, webUrl: shareUrl } }, buttons: [{ title: '레포트 보기', link: { mobileWebUrl: shareUrl, webUrl: shareUrl } }] });
    } else {
      window.open(`https://sharer.kakao.com/talk/friends/picker/link?url=${encodeURIComponent(shareUrl)}`, '_blank');
    }
  }, [firm, title, writer, shareUrl]);

  if (!report) return null;

  return (
    <div ref={modalRef} className="pdf-viewer-overlay" role="dialog" aria-modal="true" aria-labelledby="pdf-viewer-title">
      <div className="pdf-viewer-header">
        <div className="pdf-viewer-header-left">
          {firm && <span className="pdf-viewer-firm-badge">{firm}</span>}
          <div id="pdf-viewer-title" className="pdf-viewer-title">{title || 'PDF 리포트 뷰어'}</div>
        </div>
        <div className="pdf-viewer-header-actions">
          <button className="pdf-viewer-share-btn" onClick={kakaoShare} title="카카오톡 공유" aria-label="카카오톡 공유">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 14c-3.36 0-6-2.64-6-6s2.64-6 6-6 6 2.64 6 6-2.64 6-6 6zm-2-6c0 .55.45 1 1 1s1-.45 1-1-.45-1-1-1-1 .45-1 1zm4 0c0 .55.45 1 1 1s1-.45 1-1-.45-1-1-1-1 .45-1 1z"/></svg>
          </button>
          <button className="pdf-viewer-share-btn" onClick={copyUrl} title="URL 복사" aria-label="URL 복사">
            {copied ? <svg viewBox="0 0 24 24" width="18" height="18" fill="#34c759"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>
              : <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/></svg>}
          </button>
          <button ref={closeButtonRef} className="pdf-viewer-close" onClick={onClose} aria-label="뷰어 닫기">
            <svg viewBox="0 0 24 24" width="24" height="24"><path d="M18.3 5.71 12 12l6.3 6.29-1.41 1.41L10.59 13.41 4.29 19.7 2.88 18.29 9.17 12 2.88 5.71 4.29 4.3l6.3 6.29 6.3-6.29z"/></svg>
          </button>
        </div>
      </div>

      <div className="pdf-viewer-body" ref={bodyRef}>
        {loading && (
          <LoadingSkeleton variant="spinner" label="PDF 불러오는 중" />
        )}
        <PDFPageList pages={pages} scale={scale} PageCanvas={PDFPageCanvas} style={{ visibility: loading ? 'hidden' : 'visible' }} />
      </div>
    </div>
  );
};

export default PDFViewerModal;
