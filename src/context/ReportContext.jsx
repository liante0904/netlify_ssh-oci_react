import React, { useState, useCallback, useMemo } from 'react';
import { useBoards } from '../hooks/useBoards';
import { CONFIG } from '../constants/config';
import { FIRM_NAMES } from '../constants/firms';
import {
  createEmptySearchSelection,
  getSelectedCompanyOrder,
  normalizeSearchSelection,
} from '../utils/searchSelection';
import ReportContext from './reportContext';
import { createReportContextValue } from './reportContextValue';
import { useTelegramSession } from '../hooks/useTelegramSession';
import { useThemePreference } from '../hooks/useThemePreference';
import { useLlmVisibilitySettings } from '../hooks/useLlmVisibilitySettings';

export function ReportProvider({ children }) {
  const [activeSearch, setActiveSearch] = useState(createEmptySearchSelection());
  const [stagedSearch, setStagedSearch] = useState(createEmptySearchSelection());
  const [isSearchOverlayOpen, setIsSearchOverlayOpen] = useState(false);

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isTopMenuOpen, setIsTopMenuOpen] = useState(false);

  const { telegramUser, setTelegramUser, isVerifying, authStatus, logout } = useTelegramSession();

  const { llmVisibility, updateLlmSetting } = useLlmVisibilitySettings();

  const [sortBy, setSortBy] = useState('time');
  const [viewerReport, setViewerReport] = useState(null);
  // 회사 코드는 DB/필터 매핑과 1:1로 맞아야 하므로 고정 순서를 유지한다.
  const companyNames = FIRM_NAMES;
  const companyIndex = getSelectedCompanyOrder(activeSearch, null);
  const { boards, isLoadingBoards } = useBoards(companyIndex);

  const { theme, themePreference, setTheme: setThemePreference, toggleTheme } = useThemePreference(CONFIG.STORAGE_KEYS.THEME, telegramUser?.id);

  const handleSearch = useCallback(({ query, category, board = null, companyOrder = null }) => {
    const nextSearch = normalizeSearchSelection({ query, category, board, companyOrder });
    setActiveSearch(prev => {
      if (
        prev.query === nextSearch.query &&
        prev.category === nextSearch.category &&
        prev.board === nextSearch.board &&
        prev.companyOrder === nextSearch.companyOrder
      ) return prev;
      return nextSearch;
    });
  }, []);

  const toggleSearch = useCallback(() => setIsSearchOverlayOpen(prev => !prev), []);
  const toggleMenu = useCallback(() => setIsMenuOpen(prev => !prev), []);
  const toggleMenuTop = useCallback(() => setIsTopMenuOpen(prev => !prev), []);

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
