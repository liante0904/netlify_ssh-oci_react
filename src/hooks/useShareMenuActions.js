import { useCallback, useEffect, useState } from 'react';

export function useShareMenuActions({ isOpen, onClose, reportData }) {
  const [showToast, setShowToast] = useState(false);

  useEffect(() => {
    if (!isOpen) setShowToast(false);
  }, [isOpen]);

  const handleCopyLink = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(reportData.shareUrl);
      setShowToast(true);
      window.setTimeout(() => {
        setShowToast(false);
        onClose();
      }, 2000);
    } catch (error) {
      console.error('Failed to copy: ', error);
    }
  }, [onClose, reportData]);

  const handleKakaoShare = useCallback(() => {
    const { firm, title, shareUrl, writer } = reportData;
    if (window.Kakao && window.Kakao.isInitialized()) {
      window.Kakao.Share.sendDefault({
        objectType: 'feed',
        content: {
          title: `[${firm}] ${title}`,
          description: writer ? `작성자: ${writer}` : '증권사 레포트 리스트',
          imageUrl: 'https://ssh-oci.netlify.app/og-image.png',
          link: { mobileWebUrl: shareUrl, webUrl: shareUrl },
        },
        buttons: [{ title: '레포트 보기', link: { mobileWebUrl: shareUrl, webUrl: shareUrl } }],
      });
    } else {
      window.open(`https://sharer.kakao.com/talk/friends/picker/link?url=${encodeURIComponent(shareUrl)}`, '_blank');
    }
    onClose();
  }, [onClose, reportData]);

  const handleTelegramShare = useCallback(() => {
    const { firm, title, shareUrl, writer } = reportData;
    const text = `제목: [${firm}] ${title}\n작성자: ${writer || '알 수 없음'}\n원문: ${shareUrl}`;
    window.open(`https://t.me/share/url?url=${encodeURIComponent(text)}`, '_blank');
    onClose();
  }, [onClose, reportData]);

  const handleNativeShare = useCallback(() => {
    const { firm, title, shareUrl, writer } = reportData;
    if (navigator.share) {
      navigator.share({
        title: `[${firm}] ${title}`,
        text: `제목: [${firm}] ${title}\n작성자: ${writer || '알 수 없음'}\n원문: ${shareUrl}`,
      }).catch(console.error);
    }
    onClose();
  }, [onClose, reportData]);

  return { showToast, handleCopyLink, handleKakaoShare, handleTelegramShare, handleNativeShare };
}
