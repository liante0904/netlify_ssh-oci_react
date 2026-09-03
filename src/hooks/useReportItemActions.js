import { useState } from 'react';
import { getArchiveDownloadUrl, getShareLinkCreateUrl, prefetchPdf } from '../utils/reportLinks';
import { useReport } from '../context/useReport';

export function useReportItemActions(report) {
  const { id, title, firm, pdf_file_url } = report;
  const { setViewerReport } = useReport();
  const [isArchiveDownloading, setIsArchiveDownloading] = useState(false);
  const [isSecureSharing, setIsSecureSharing] = useState(false);
  const [toast, setToast] = useState({ visible: false, message: '' });

  const showToast = (message) => {
    setToast({ visible: true, message });
    window.setTimeout(() => setToast({ visible: false, message: '' }), 3000);
  };

  const handleViewerClick = () => {
    setViewerReport(firm === '현대차증권' && pdf_file_url ? { ...report, link: pdf_file_url } : report);
  };

  const handleArchiveDownload = async () => {
    if (isArchiveDownloading) return;
    setIsArchiveDownloading(true);
    try {
      const response = await fetch(getArchiveDownloadUrl(id));
      if (!response.ok) throw new Error('archive download failed');
      const blob = await response.blob();
      const downloadUrl = URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = downloadUrl;
      anchor.download = report.pdf_archive?.file_name || `[${firm}] ${title}.pdf`;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      URL.revokeObjectURL(downloadUrl);
    } catch {
      showToast('아카이브 PDF를 내려받지 못했습니다. 잠시 후 다시 시도해 주세요.');
    } finally {
      setIsArchiveDownloading(false);
    }
  };

  const handleSecureShare = async (event, onOpenShareMenu) => {
    if (isSecureSharing) return;
    const shareButton = event?.currentTarget;
    setIsSecureSharing(true);
    try {
      const response = await fetch(getShareLinkCreateUrl(), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ report_id: id }),
      });
      if (!response.ok) throw new Error('secure share link request failed');

      const data = await response.json();
      if (!data?.token) throw new Error('secure share token missing');

      const shareUrl = `${window.location.origin}/share?t=${encodeURIComponent(data.token)}`;
      onOpenShareMenu?.({ currentTarget: shareButton }, { ...report, shareUrl }, shareUrl);
    } catch {
      showToast('보안 공유 링크를 만들지 못했습니다. 잠시 후 다시 시도해 주세요.');
    } finally {
      setIsSecureSharing(false);
    }
  };

  const handlePrefetch = () => {
    const origin = window.location.origin;
    fetch(`${origin}/.netlify/functions/proxy?warmup=true`, { method: 'HEAD', mode: 'no-cors' }).catch(() => {});
    fetch(`${origin}/.netlify/functions/share?warmup=true`, { method: 'HEAD', mode: 'no-cors' }).catch(() => {});
    prefetchPdf(report, origin);
  };

  return {
    handleViewerClick,
    handleArchiveDownload,
    handleSecureShare,
    handlePrefetch,
    isArchiveDownloading,
    isSecureSharing,
    toast,
    showToast,
  };
}
