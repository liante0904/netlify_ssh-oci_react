import React, { useMemo } from 'react';
import { useBoards } from '../hooks/useBoards';
import { CONFIG } from '../constants/config';
import { FIRM_NAMES } from '../constants/firms';
import { getSelectedCompanyOrder } from '../utils/searchSelection';
import ReportContext from './reportContext';
import { createReportContextValue } from './reportContextValue';
import { useTelegramSession } from '../hooks/useTelegramSession';
import { useThemePreference } from '../hooks/useThemePreference';
import { useLlmVisibilitySettings } from '../hooks/useLlmVisibilitySettings';
import { useReportSearchState } from '../hooks/useReportSearchState';
import { useReportUiState } from '../hooks/useReportUiState';

export function ReportProvider({ children }) {
  const searchState = useReportSearchState();
  const uiState = useReportUiState();
  const { activeSearch, setActiveSearch, stagedSearch, setStagedSearch, handleSearch } = searchState;
  const { isSearchOverlayOpen, setIsSearchOverlayOpen, isMenuOpen, setIsMenuOpen, isTopMenuOpen, setIsTopMenuOpen, sortBy, setSortBy, viewerReport, setViewerReport, toggleSearch, toggleMenu, toggleMenuTop } = uiState;

  const { telegramUser, setTelegramUser, isVerifying, authStatus, logout } = useTelegramSession();

  const { llmVisibility, updateLlmSetting } = useLlmVisibilitySettings();

  // 회사 코드는 DB/필터 매핑과 1:1로 맞아야 하므로 고정 순서를 유지한다.
  const companyNames = FIRM_NAMES;
  const companyIndex = getSelectedCompanyOrder(activeSearch, null);
  const { boards, isLoadingBoards } = useBoards(companyIndex);

  const { theme, themePreference, setTheme: setThemePreference, toggleTheme } = useThemePreference(CONFIG.STORAGE_KEYS.THEME, telegramUser?.id);

  const contextState = {
    searchQuery: activeSearch,
    setSearchQuery: setActiveSearch,
    pendingSearch: stagedSearch,
    setPendingSearch: setStagedSearch,
    activeSearch,
    stagedSearch,
    handleSearch,
    isSearchOpen: isSearchOverlayOpen,
    setIsSearchOpen: setIsSearchOverlayOpen,
    isSearchOverlayOpen,
    toggleSearch,
    isMenuOpen,
    setIsMenuOpen,
    toggleMenu,
    isTopMenuOpen,
    setIsTopMenuOpen,
    toggleMenuTop,
    sortBy,
    setSortBy,
    boards,
    isLoadingBoards,
    viewerReport,
    setViewerReport,
    firm_names: companyNames,
    companyNames,
    theme,
    themePreference,
    setTheme: setThemePreference,
    toggleTheme,
    telegramUser,
    setTelegramUser,
    isVerifying,
    authStatus,
    llmVisibility,
    updateLlmSetting,
    logout
  };
  // contextState is assembled from the explicit dependency list below.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const value = useMemo(() => createReportContextValue(contextState), [
    activeSearch,
    stagedSearch,
    isSearchOverlayOpen,
    isMenuOpen,
    isTopMenuOpen,
    sortBy,
    boards,
    isLoadingBoards,
    viewerReport,
    companyNames,
    theme,
    themePreference,
    telegramUser,
    isVerifying,
    authStatus,
    llmVisibility,
    handleSearch,
    toggleSearch,
    toggleMenu,
    toggleMenuTop,
    toggleTheme,
    updateLlmSetting,
    logout,
  ]);

  return (
    <ReportContext.Provider value={value}>
      {children}
    </ReportContext.Provider>
  );
}
