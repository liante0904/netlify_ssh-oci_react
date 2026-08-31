import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { getProxyPdfUrl } from '../../utils/reportLinks';
import LoadingSkeleton from '../LoadingSkeleton';
import './PDFViewerModal.css';
import PDFPageList from './PDFPageList';
import PDFPageCanvas from './PDFPageCanvas';
import { usePdfDocument } from '../../hooks/usePdfDocument';

// ---------------------------------------------------------------------------
// PDFViewerModal
// ---------------------------------------------------------------------------
const PDFViewerModal = ({ report, onClose }) => {
  const histRef = useRef(false);
  const bodyRef = useRef(null);
  const modalRef = useRef(null);
  const closeButtonRef = useRef(null);
  const previousActiveElementRef = useRef(null);
  const [copied, setCopied] = useState(false);
  const onCloseRef = useRef(onClose);

  useEffect(() => { onCloseRef.current = onClose; }, [onClose]);

  // body lock + viewport pinch-zoom toggle
  useEffect(() => {
    if (!report) return;
    const vp = document.querySelector('meta[name="viewport"]');
    const prevVP = vp?.getAttribute('content') || '';
    const prevO = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    if (vp) vp.setAttribute('content', 'width=device-width, initial-scale=1.0, maximum-scale=10.0, user-scalable=yes, viewport-fit=cover');
    return () => {
      document.body.style.overflow = prevO;
      if (vp) vp.setAttribute('content', prevVP);
    };
  }, [report]);

  // 키보드 사용자도 동일한 닫기 동작을 사용할 수 있게 한다.
  useEffect(() => {
    if (!report) return;
    previousActiveElementRef.current = document.activeElement;
    requestAnimationFrame(() => closeButtonRef.current?.focus());
    return () => previousActiveElementRef.current?.focus?.();
  }, [report]);

  useEffect(() => {
    if (!report) return;
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        onCloseRef.current();
        return;
      }
      if (event.key !== 'Tab' || !modalRef.current) return;
      const focusable = [...modalRef.current.querySelectorAll(
        'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
      )];
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [report]);

  // iOS PWA height
  useEffect(() => {
    if (!report) return;
    const setH = () => document.documentElement.style.setProperty('--pdf-viewer-height', `${window.visualViewport?.height || window.innerHeight}px`);
    setH();
    window.visualViewport?.addEventListener('resize', setH);
    window.addEventListener('resize', setH);
    return () => { window.visualViewport?.removeEventListener('resize', setH); window.removeEventListener('resize', setH); document.documentElement.style.removeProperty('--pdf-viewer-height'); };
  }, [report]);

  // history back
  useEffect(() => {
    if (!report) return;
    window.history.pushState({ ...window.history.state, pdf: 1 }, '', window.location.href);
    histRef.current = true;
    const h = () => { histRef.current = false; onCloseRef.current(); };
    window.addEventListener('popstate', h);
    return () => { window.removeEventListener('popstate', h); if (histRef.current && window.history.state?.pdf) { histRef.current = false; window.history.back(); } };
  }, [report]);

  const { title = '', firm = '', writer = '', shareUrl = '' } = report || {};
  const proxyUrl = useMemo(() => report ? getProxyPdfUrl(report, window.location.origin) : '', [report]);
  const { loading, pages, scale, setScale, pageWidthRef } = usePdfDocument({ report, proxyUrl, bodyRef });

  // pinch zoom (user-scalable=no 환경에서도 동작)
  const zoomRef = useRef(1);
  const pinchRef = useRef({ dist: 0, base: 1 });
  useEffect(() => {
    const el = bodyRef.current;
    if (!el) return;
    const dist = (t) => { const dx = t[0].clientX - t[1].clientX; const dy = t[0].clientY - t[1].clientY; return Math.sqrt(dx * dx + dy * dy); };
    const onStart = (e) => { if (e.touches.length === 2) { pinchRef.current = { dist: dist(e.touches), base: zoomRef.current }; } };
    const onMove = (e) => {
      if (e.touches.length !== 2 || !pinchRef.current.dist) return;
      const z = Math.max(0.5, Math.min(5, pinchRef.current.base * (dist(e.touches) / pinchRef.current.dist)));
      zoomRef.current = z;
      setScale((pageWidthRef.current && bodyRef.current) ? (bodyRef.current.clientWidth / pageWidthRef.current) * z : z);
    };
    const onEnd = () => { pinchRef.current = { dist: 0, base: 1 }; };
    el.addEventListener('touchstart', onStart, { passive: false });
    el.addEventListener('touchmove', onMove, { passive: false });
    el.addEventListener('touchend', onEnd);
    el.addEventListener('touchcancel', onEnd);
    return () => { el.removeEventListener('touchstart', onStart); el.removeEventListener('touchmove', onMove); el.removeEventListener('touchend', onEnd); el.removeEventListener('touchcancel', onEnd); };
  }, [pageWidthRef, setScale]);

  // resize → scale 재계산
  useEffect(() => {
    const onR = () => {
      if (!bodyRef.current || !pageWidthRef.current) return;
      const cw = bodyRef.current.clientWidth;
      if (cw > 0) setScale(cw / pageWidthRef.current);
    };
    window.addEventListener('resize', onR);
    window.visualViewport?.addEventListener('resize', onR);
    return () => { window.removeEventListener('resize', onR); window.visualViewport?.removeEventListener('resize', onR); };
  }, [pageWidthRef, setScale]);

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
