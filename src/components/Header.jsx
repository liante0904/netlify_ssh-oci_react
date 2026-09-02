import React, { forwardRef } from 'react';
import { useHeaderController } from '../hooks/useHeaderController';
import { getNotificationKey } from '../hooks/useNotifications';
import HeaderLayout from './header/HeaderLayout';
import HeaderAccountBadge from './header/HeaderAccountBadge';
import './Header.css';
import './header/HeaderNotificationToast.css';
import './header/NotificationListShell.css';
import './header/NotificationListItems.css';
import './header/NotificationListActions.css';

const Header = forwardRef(({ isNavVisible }, ref) => {
  const { activePopover, setActivePopover, isTopMenuOpen, toggleMenuTop, telegramUser, boards, activeSearch, theme, themePreference, toggleTheme, keywordState, isAuthenticating, loginWithTelegram, selectedCompanyOrder, closePopover, handleBadge, handleOpenSettings, handleNotificationClick, handleButtonClick, unreadCount, visibleNotifications, isLoadingNotifications, readNotifyIds, markAllAsRead, handleNotificationItemClick, notificationToast, logout, handleCompanyChange, handleBoardChange } = useHeaderController(isNavVisible);
  const renderTelegramBadge = <HeaderAccountBadge user={telegramUser} isAuthenticating={isAuthenticating} onLogin={loginWithTelegram} onOpen={handleBadge} expanded={activePopover === 'account'} />;
  return <HeaderLayout refProp={ref} hidden={!isNavVisible} onHome={() => handleButtonClick('home')} badge={renderTelegramBadge} onSearch={() => handleButtonClick('search')} user={telegramUser} onNotifications={handleNotificationClick} active={activePopover} unread={unreadCount} menuOpen={isTopMenuOpen} toggleMenu={toggleMenuTop} closePopover={closePopover} keywordState={keywordState} authLoading={isAuthenticating} login={loginWithTelegram} notifications={visibleNotifications} loading={isLoadingNotifications} readIds={readNotifyIds} markAllAsRead={() => markAllAsRead(visibleNotifications.flatMap((item) => [getNotificationKey(item), item.id]))} onNotification={handleNotificationItemClick} toast={notificationToast} setActive={setActivePopover} logout={logout} selectedCompany={selectedCompanyOrder} companyChange={handleCompanyChange} headerClick={handleButtonClick} boards={boards} selectedBoard={activeSearch.board} boardChange={handleBoardChange} onOpenSettings={handleOpenSettings} theme={theme} themePreference={themePreference} onToggleTheme={toggleTheme} />;
});

export default Header;
