import React from 'react';
import TelegramAuth from './menu/TelegramAuth';
import AdminSection from './menu/AdminSection';
import HamburgerNavigation from './menu/HamburgerNavigation';
import HamburgerFilters from './menu/HamburgerFilters';
import HamburgerSettings from './menu/HamburgerSettings';
import { useTelegramAuth } from '../hooks/useTelegramAuth';
import { useReport } from '../context/useReport';
import './HamburgerMenu.css';

function HamburgerMenu({
  isOpen,
  toggleMenu,
  selectedCompany,
  handleCompanyChange,
  handleHeaderClick,
  boards = [],
  selectedBoard,
  handleBoardChange,
  keywordState,
}) {
  const { telegramUser, logout, theme, themePreference, toggleTheme } = useReport();
  const {
    isAuthenticating,
    loginWithTelegram,
    loginWithDevBypass,
  } = useTelegramAuth();

  const handleMenuItemClick = (key) => {
    handleHeaderClick(key);
  };

  const handleOverlayClick = (event) => {
    if (window.matchMedia?.('(min-width: 1280px)').matches) return;
    if (event.target === event.currentTarget) toggleMenu();
  };

  const handleOpenKeywordOverlay = (event) => {
    event?.preventDefault();
    event?.stopPropagation();
    if (isOpen) toggleMenu();
    keywordState.openKeywordOverlay();
  };

  return (
    <>
      {isOpen && (
        <div className={`menu-overlay ${isOpen ? 'open' : ''}`} onClick={handleOverlayClick}>
          <div className={`menu-panel ${isOpen ? 'open' : ''}`} onClick={(e) => e.stopPropagation()}>
            <div className="menu-panel-header">
              <div>
                <div className="menu-eyebrow">Reports Hub</div>
                <h2>메뉴</h2>
              </div>
              <button type="button" className="menu-close-btn" onClick={toggleMenu} title="닫기">×</button>
            </div>

            <section className="menu-section account-section">
              <div className="menu-section-title">내 계정</div>
              <TelegramAuth
                telegramUser={telegramUser}
                isAuthenticating={isAuthenticating}
                loginWithTelegram={loginWithTelegram}
                loginWithDevBypass={loginWithDevBypass}
                handleLogout={logout}
                toggleKeywordOverlay={handleOpenKeywordOverlay}
              />
            </section>

            <HamburgerNavigation onNavigate={handleMenuItemClick} />
            <HamburgerFilters selectedCompany={selectedCompany} onCompanyChange={handleCompanyChange} boards={boards} selectedBoard={selectedBoard} onBoardChange={handleBoardChange} closeMenu={toggleMenu} />
            {!telegramUser && <HamburgerSettings theme={theme} themePreference={themePreference} onToggleTheme={toggleTheme} />}

            <AdminSection isAdmin={telegramUser?.is_admin} />
          </div>
          <button
            type="button"
            className="menu-mobile-close-btn"
            onClick={(event) => {
              event.stopPropagation();
              toggleMenu();
            }}
            aria-label="메뉴 닫기"
          >
            <span aria-hidden="true">×</span>
            닫기
          </button>
        </div>
      )}
    </>
  );
}

export default HamburgerMenu;
