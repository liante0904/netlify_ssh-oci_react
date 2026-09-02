import React, { useRef } from 'react';
import { useShareMenuPosition } from '../hooks/useShareMenuPosition';
import { useShareMenuActions } from '../hooks/useShareMenuActions';
import ShareMenuOptions from './ShareMenuOptions';
import './ShareMenu.css';

function ShareMenu({ isOpen, onClose, reportData, position }) {
  const menuRef = useRef(null);
  useShareMenuPosition(menuRef, isOpen, position);
  const { showToast, handleCopyLink, handleKakaoShare, handleTelegramShare, handleNativeShare } = useShareMenuActions({ isOpen, onClose, reportData });

  if (!isOpen || !reportData) return null;

  return (
    <div className="share-menu-overlay" onClick={onClose}>
      <div 
        className="share-menu-floating" 
        ref={menuRef}
        onClick={(e) => e.stopPropagation()}
      >
        <ShareMenuOptions canNativeShare={Boolean(navigator.share)} onKakao={handleKakaoShare} onTelegram={handleTelegramShare} onCopy={handleCopyLink} onNative={handleNativeShare} />
        <div className="share-menu-arrow"></div>
      </div>

      {showToast && (
        <div className="share-toast">
          링크가 복사되었습니다.
        </div>
      )}
    </div>
  );
}

export default ShareMenu;
