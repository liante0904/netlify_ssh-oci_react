import React, { forwardRef, useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useReport } from '../context/useReport';
import { HEADER_PATHS } from '../utils/headerNavigation';
import { useHeaderSearchState } from '../hooks/useHeaderSearchState';
import { useKeywords } from '../hooks/useKeywords';
import { useTelegramAuth } from '../hooks/useTelegramAuth';
import { useNotificationReadStatus } from '../hooks/useNotificationReadStatus';
import { getNotificationKey, useNotifications } from '../hooks/useNotifications';
import { useHeaderNotifications } from '../hooks/useHeaderNotifications';
import HeaderLayout from './header/HeaderLayout';
import './Header.css';
import './header/HeaderNotificationToast.css';
import './header/HeaderNotificationList.css';

const Header = forwardRef(({ isNavVisible }, ref) => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [activePopover, setActivePopover] = useState(null);
  const triggerRef = useRef(null);
  const { isTopMenuOpen, toggleMenuTop, isMenuOpen, toggleMenu, handleSearch, setSortBy, boards, activeSearch, telegramUser, logout, toggleSearch } = useReport();
  const { isAuthenticating, loginWithTelegram } = useTelegramAuth();
  const keywordState = useKeywords(telegramUser);
  const { clearSearchState, handleCompanyChange, handleBoardChange, handleSearchButtonClick, selectedCompanyOrder } = useHeaderSearchState({ activeSearch, boards, handleSearch, navigate, searchParams, setSearchParams, setSortBy, toggleSearch });
  const { readNotifyIds, markAllAsRead, markAsRead } = useNotificationReadStatus(telegramUser);
  const { notifications, isLoadingNotifications } = useNotifications(telegramUser);

  const { visibleNotifications, unreadCount, notificationToast, handleNotificationItemClick } = useHeaderNotifications({ telegramUser, notifications, readNotifyIds, markAllAsRead, markAsRead, handleSearch, navigate, setActivePopover });
  const closePopover = useCallback(() => { const trigger = triggerRef.current; triggerRef.current = null; setActivePopover(null); window.setTimeout(() => trigger?.focus(), 0); }, []);
  const handleBadge = (event) => { triggerRef.current = event.currentTarget; setActivePopover((current) => current === 'account' ? null : 'account'); };
  const renderTelegramBadge = telegramUser ? <button type="button" className="tg-badge tg-badge-on account-trigger" title={`내 계정 설정: ${telegramUser.first_name} (ID:${telegramUser.id})`} onClick={handleBadge} aria-label={`${telegramUser.first_name}님 내 계정 설정 열기`} aria-expanded={activePopover === 'account'}><span className="tg-badge-icon">👤</span><span className="tg-badge-name">{telegramUser.first_name}님</span><span className="tg-badge-settings">⚙️</span><span className="tg-badge-chevron">⌄</span></button> : <button type="button" className="tg-badge tg-badge-off" title="텔레그램 브라우저 로그인" onClick={loginWithTelegram} disabled={isAuthenticating}><span className="tg-badge-icon">✈️</span><span className="tg-badge-name">{isAuthenticating ? '인증 중' : '로그인'}</span></button>;
  useEffect(() => { if (isTopMenuOpen || !isNavVisible) setActivePopover(null); }, [isNavVisible, isTopMenuOpen]);
  const handleOpenSettings = () => { setActivePopover(null); if (!telegramUser) loginWithTelegram(); else keywordState.openKeywordOverlay(); };
  const handleNotificationClick = (event) => { triggerRef.current = event.currentTarget; setActivePopover((current) => current === 'notifications' ? null : 'notifications'); };
  const handleButtonClick = (name) => { if (isTopMenuOpen) toggleMenuTop(); if (isMenuOpen) toggleMenu(); if (name !== 'search') clearSearchState({ navigateHome: false }); if (name === 'recent') setSortBy('time'); if (HEADER_PATHS[name] && name !== 'search') navigate({ pathname: HEADER_PATHS[name] }); if (name === 'search') handleSearchButtonClick(); };
  return <HeaderLayout refProp={ref} hidden={!isNavVisible} onHome={() => handleButtonClick('home')} badge={renderTelegramBadge} onSearch={() => handleButtonClick('search')} user={telegramUser} onNotifications={handleNotificationClick} active={activePopover} unread={unreadCount} menuOpen={isTopMenuOpen} toggleMenu={toggleMenuTop} closePopover={closePopover} keywordState={keywordState} authLoading={isAuthenticating} login={loginWithTelegram} notifications={visibleNotifications} loading={isLoadingNotifications} readIds={readNotifyIds} markAllAsRead={() => markAllAsRead(visibleNotifications.flatMap((item) => [getNotificationKey(item), item.id]))} onNotification={handleNotificationItemClick} toast={notificationToast} setActive={setActivePopover} logout={logout} selectedCompany={selectedCompanyOrder} companyChange={handleCompanyChange} headerClick={handleButtonClick} boards={boards} selectedBoard={activeSearch.board} boardChange={handleBoardChange} onOpenSettings={handleOpenSettings} />;
});

export default Header;
