import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useBoards } from '../hooks/useBoards';
import { useLlmVisibilityMutation } from '../hooks/useLlmVisibilityMutation';
import { CONFIG } from '../constants/config';
import { FIRM_NAMES } from '../constants/firms';
import { request } from '../utils/api';
import {
  createEmptySearchSelection,
  getSelectedCompanyOrder,
  normalizeSearchSelection,
} from '../utils/searchSelection';
import ReportContext from './reportContext';
import { createReportContextValue } from './reportContextValue';
import { useTelegramSession } from '../hooks/useTelegramSession';

export function ReportProvider({ children }) {
  const [activeSearch, setActiveSearch] = useState(createEmptySearchSelection());
  const [stagedSearch, setStagedSearch] = useState(createEmptySearchSelection());
  const [isSearchOverlayOpen, setIsSearchOverlayOpen] = useState(false);

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isTopMenuOpen, setIsTopMenuOpen] = useState(false);

  const { telegramUser, setTelegramUser, isVerifying, authStatus, logout } = useTelegramSession();

  // LLM 요약 노출 범위 설정 ('admin' 또는 'telegram')
  const [llmVisibility, setLlmVisibility] = useState('admin');

  const llmSettingQuery = useQuery({
    queryKey: ['llm-visibility'],
    queryFn: () => request(CONFIG.API.LLM_SETTING_URL),
    staleTime: 60_000,
  });
  const llmVisibilityMutation = useLlmVisibilityMutation();

  useEffect(() => {
    if (llmSettingQuery.data?.visibility) setLlmVisibility(llmSettingQuery.data.visibility);
  }, [llmSettingQuery.data]);

  // LLM 노출 설정 변경 (관리자 전용)
  const updateLlmSetting = useCallback(async (newVisibility) => {
    try {
      const data = await llmVisibilityMutation.mutateAsync(newVisibility);
      setLlmVisibility(data.visibility);
      return { success: true, visibility: data.visibility };
    } catch (error) {
      console.error('Failed to update LLM visibility setting:', error);
      return { success: false, message: error.message };
    }
  }, [llmVisibilityMutation]);

  const [sortBy, setSortBy] = useState('time');
  const [viewerReport, setViewerReport] = useState(null);
  // 회사 코드는 DB/필터 매핑과 1:1로 맞아야 하므로 고정 순서를 유지한다.
  const companyNames = FIRM_NAMES;
  const companyIndex = getSelectedCompanyOrder(activeSearch, null);
  const { boards, isLoadingBoards } = useBoards(companyIndex);

  const [theme, setTheme] = useState(() => {
    const savedTheme = localStorage.getItem(CONFIG.STORAGE_KEYS.THEME);
    const userPrefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    return savedTheme || (userPrefersDark ? 'dark' : 'light');
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem(CONFIG.STORAGE_KEYS.THEME, theme);
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
  }, []);

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
    setTheme,
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
