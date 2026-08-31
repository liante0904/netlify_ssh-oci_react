import React, { forwardRef, useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useReport } from '../context/useReport';
import { getDirectUrl } from '../utils/reportLinks';
import { HEADER_PATHS } from '../utils/headerNavigation';
import { useHeaderSearchState } from '../hooks/useHeaderSearchState';
import { useKeywords } from '../hooks/useKeywords';
import { useTelegramAuth } from '../hooks/useTelegramAuth';
import { useNotificationReadStatus } from '../hooks/useNotificationReadStatus';
import { getNotificationKey, useNotifications } from '../hooks/useNotifications';
import HeaderLayout from './header/HeaderLayout';
import './Header.css';

const SUMMARY_NOTIFICATION_EVENT = 'ssh-summary-notification';
const TOAST_TIMEOUT = 4500;

function normalizeLocalSummaryEvent(detail) {
  const id = `local-${detail.status || 'summary'}-${detail.report_id}-${Date.now()}`;
  return { id, report_id: detail.report_id, article_title: detail.article_title, firm_nm: detail.firm_nm || '', source: 'summary', notification_key: `local-summary:${id}`, message: detail.message, created_at: detail.created_at || new Date().toISOString(), status: detail.status };
}

const Header = forwardRef(({ isNavVisible }, ref) => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [activePopover, setActivePopover] = useState(null);
  const [localNotifications, setLocalNotifications] = useState([]);
  const [notificationToast, setNotificationToast] = useState(null);
  const triggerRef = useRef(null);
  const { isTopMenuOpen, toggleMenuTop, isMenuOpen, toggleMenu, handleSearch, setSortBy, boards, activeSearch, telegramUser, logout, toggleSearch } = useReport();
  const { isAuthenticating, loginWithTelegram } = useTelegramAuth();
  const keywordState = useKeywords(telegramUser);
  const { clearSearchState, handleCompanyChange, handleBoardChange, handleSearchButtonClick, selectedCompanyOrder } = useHeaderSearchState({ activeSearch, boards, handleSearch, navigate, searchParams, setSearchParams, setSortBy, toggleSearch });
  const { readNotifyIds, markAllAsRead, markAsRead } = useNotificationReadStatus(telegramUser);
  const { notifications, isLoadingNotifications } = useNotifications(telegramUser);

  useEffect(() => {
    if (!telegramUser) return;
    try {
      const saved = localStorage.getItem('ssh_read_notifications');
      const ids = saved ? JSON.parse(saved) : [];
      if (Array.isArray(ids) && ids.length && readNotifyIds.length === 0) markAllAsRead(ids);
      if (saved) localStorage.removeItem('ssh_read_notifications');
    } catch { /* malformed legacy storage */ }
  }, [markAllAsRead, readNotifyIds, telegramUser]);

  const visibleNotifications = [...localNotifications, ...notifications].filter((item, index, all) => all.findIndex((candidate) => getNotificationKey(candidate) === getNotificationKey(item)) === index).sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0)).slice(0, 50);
  const unreadCount = visibleNotifications.filter((item) => !readNotifyIds.includes(getNotificationKey(item)) && !readNotifyIds.includes(item.id)).length;
  const closePopover = useCallback(() => { const trigger = triggerRef.current; triggerRef.current = null; setActivePopover(null); window.setTimeout(() => trigger?.focus(), 0); }, []);
  const handleBadge = (event) => { triggerRef.current = event.currentTarget; setActivePopover((current) => current === 'account' ? null : 'account'); };
  const renderTelegramBadge = telegramUser ? <button type="button" className="tg-badge tg-badge-on" title={`텔레그램 로그인: ${telegramUser.first_name} (ID:${telegramUser.id})`} onClick={handleBadge} aria-expanded={activePopover === 'account'}><span className="tg-badge-icon">✈️</span><span className="tg-badge-name">{telegramUser.first_name}</span></button> : <button type="button" className="tg-badge tg-badge-off" title="텔레그램 브라우저 로그인" onClick={loginWithTelegram} disabled={isAuthenticating}><span className="tg-badge-icon">✈️</span><span className="tg-badge-name">{isAuthenticating ? '인증 중' : '로그인'}</span></button>;
  const handleNotificationItemClick = useCallback((item) => {
    const key = getNotificationKey(item);
    if (!readNotifyIds.includes(key) && !readNotifyIds.includes(item.id)) markAsRead(key);
    setActivePopover(null);
    const report = { report_id: item.report_id, article_title: item.article_title || '', firm_nm: item.firm_nm || '', sec_firm_order: item.sec_firm_order ?? null, link: item.pdf_file_url || item.telegram_url || '', pdf_file_url: item.pdf_file_url || null, telegram_url: item.telegram_url || null };
    const url = getDirectUrl(report);
    if (url && item.report_id) window.open(url, '_blank'); else if (item.article_title) { handleSearch(item.article_title); navigate('/'); }
  }, [handleSearch, markAsRead, navigate, readNotifyIds]);
  useEffect(() => { const handler = (event) => { if (!telegramUser) return; const item = normalizeLocalSummaryEvent(event.detail || {}); setLocalNotifications((current) => [item, ...current].slice(0, 20)); setNotificationToast(item); }; window.addEventListener(SUMMARY_NOTIFICATION_EVENT, handler); return () => window.removeEventListener(SUMMARY_NOTIFICATION_EVENT, handler); }, [telegramUser]);
  useEffect(() => { if (!notificationToast) return undefined; const id = window.setTimeout(() => setNotificationToast(null), TOAST_TIMEOUT); return () => window.clearTimeout(id); }, [notificationToast]);
  useEffect(() => { if (isTopMenuOpen || !isNavVisible) setActivePopover(null); }, [isNavVisible, isTopMenuOpen]);
  const handleOpenSettings = () => { setActivePopover(null); if (!telegramUser) loginWithTelegram(); else keywordState.openKeywordOverlay(); };
  const handleNotificationClick = (event) => { triggerRef.current = event.currentTarget; setActivePopover((current) => current === 'notifications' ? null : 'notifications'); };
  const handleButtonClick = (name) => { if (isTopMenuOpen) toggleMenuTop(); if (isMenuOpen) toggleMenu(); if (name !== 'search') clearSearchState({ navigateHome: false }); if (name === 'recent') setSortBy('time'); if (HEADER_PATHS[name] && name !== 'search') navigate({ pathname: HEADER_PATHS[name] }); if (name === 'search') handleSearchButtonClick(); };
  return <HeaderLayout refProp={ref} hidden={!isNavVisible} onHome={() => handleButtonClick('home')} badge={renderTelegramBadge} onSearch={() => handleButtonClick('search')} user={telegramUser} onNotifications={handleNotificationClick} active={activePopover} unread={unreadCount} menuOpen={isTopMenuOpen} toggleMenu={toggleMenuTop} closePopover={closePopover} keywordState={keywordState} authLoading={isAuthenticating} login={loginWithTelegram} notifications={visibleNotifications} loading={isLoadingNotifications} readIds={readNotifyIds} markAllAsRead={() => markAllAsRead(visibleNotifications.flatMap((item) => [getNotificationKey(item), item.id]))} onNotification={handleNotificationItemClick} toast={notificationToast} setActive={setActivePopover} logout={logout} selectedCompany={selectedCompanyOrder} companyChange={handleCompanyChange} headerClick={handleButtonClick} boards={boards} selectedBoard={activeSearch.board} boardChange={handleBoardChange} onOpenSettings={handleOpenSettings} />;
});

export default Header;
