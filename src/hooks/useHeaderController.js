import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useReport } from '../context/useReport';
import { HEADER_PATHS } from '../utils/headerNavigation';
import { useHeaderSearchState } from './useHeaderSearchState';
import { useKeywords } from './useKeywords';
import { useTelegramAuth } from './useTelegramAuth';
import { useNotificationReadStatus } from './useNotificationReadStatus';
import { useNotifications } from './useNotifications';
import { useHeaderNotifications } from './useHeaderNotifications';

export function useHeaderController(isNavVisible) {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [activePopover, setActivePopover] = useState(null);
  const triggerRef = useRef(null);
  const { isTopMenuOpen, toggleMenuTop, isMenuOpen, toggleMenu, handleSearch, setSortBy, boards, activeSearch, telegramUser, logout, toggleSearch, theme, themePreference, toggleTheme } = useReport();
  const { isAuthenticating, loginWithTelegram } = useTelegramAuth();
  const keywordState = useKeywords(telegramUser);
  const { clearSearchState, handleCompanyChange, handleBoardChange, handleSearchButtonClick, selectedCompanyOrder } = useHeaderSearchState({ activeSearch, boards, handleSearch, navigate, searchParams, setSearchParams, setSortBy, toggleSearch });
  const { readNotifyIds, markAllAsRead, markAsRead } = useNotificationReadStatus(telegramUser);
  const { notifications, isLoadingNotifications } = useNotifications(telegramUser);
  const { visibleNotifications, unreadCount, notificationToast, handleNotificationItemClick } = useHeaderNotifications({ telegramUser, notifications, readNotifyIds, markAllAsRead, markAsRead, handleSearch, navigate, setActivePopover });
  const closePopover = useCallback(() => { const trigger = triggerRef.current; triggerRef.current = null; setActivePopover(null); window.setTimeout(() => trigger?.focus(), 0); }, []);
  const handleBadge = (event) => { triggerRef.current = event.currentTarget; setActivePopover((current) => current === 'account' ? null : 'account'); };
  const handleOpenSettings = (event) => {
    event?.preventDefault();
    event?.stopPropagation();
    setActivePopover(null);
    if (!telegramUser) loginWithTelegram();
    else keywordState.openKeywordOverlay();
  };
  const handleNotificationClick = (event) => { triggerRef.current = event.currentTarget; setActivePopover((current) => current === 'notifications' ? null : 'notifications'); };
  const handleButtonClick = (name) => { if (isTopMenuOpen) toggleMenuTop(); if (isMenuOpen) toggleMenu(); if (name !== 'search') clearSearchState({ navigateHome: false }); if (name === 'recent') setSortBy('time'); if (HEADER_PATHS[name] && name !== 'search') navigate({ pathname: HEADER_PATHS[name] }); if (name === 'search') handleSearchButtonClick(); };
  useEffect(() => { if (isTopMenuOpen || !isNavVisible) setActivePopover(null); }, [isNavVisible, isTopMenuOpen]);
  return { activePopover, setActivePopover, isTopMenuOpen, toggleMenuTop, telegramUser, boards, activeSearch, theme, themePreference, toggleTheme, keywordState, isAuthenticating, loginWithTelegram, selectedCompanyOrder, closePopover, handleBadge, handleOpenSettings, handleNotificationClick, handleButtonClick, unreadCount, visibleNotifications, isLoadingNotifications, readNotifyIds, markAllAsRead, handleNotificationItemClick, notificationToast, logout, handleCompanyChange, handleBoardChange };
}
