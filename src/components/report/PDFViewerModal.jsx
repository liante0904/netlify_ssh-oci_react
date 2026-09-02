import React, { useCallback, useMemo, useRef, useState } from 'react';
import { getProxyPdfUrl } from '../../utils/reportLinks';
import LoadingSkeleton from '../LoadingSkeleton';
import './PDFViewerModal.css';
import PDFPageList from './PDFPageList';
import PDFPageCanvas from './PDFPageCanvas';
import PDFViewerHeader from './PDFViewerHeader';
import { usePdfDocument } from '../../hooks/usePdfDocument';
import { usePdfModalLifecycle } from '../../hooks/usePdfModalLifecycle';
import { usePdfViewport } from '../../hooks/usePdfViewport';

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
      <PDFViewerHeader firm={firm} title={title} copied={copied} onShare={kakaoShare} onCopy={copyUrl} closeButtonRef={closeButtonRef} onClose={onClose} />
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
