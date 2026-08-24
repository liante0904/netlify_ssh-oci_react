import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useReport } from '../context/useReport';
import { CONFIG } from '../constants/config';
import { request } from '../utils/api';
import { DEV_AUTH_ENABLED } from '../utils/devAuth';

export const useKeywords = (telegramUser) => {
  const { logout } = useReport();
  const queryClient = useQueryClient();
  const [devKeywords, setDevKeywords] = useState([]);
  const [newKeyword, setNewKeyword] = useState('');
  const [isKeywordOverlayOpen, setIsKeywordOverlayOpen] = useState(false);
  const [lastDeleted, setLastDeleted] = useState(null);

  const hasAuthToken = Boolean(localStorage.getItem(CONFIG.STORAGE_KEYS.AUTH_TOKEN));
  const isDevBypassSession = DEV_AUTH_ENABLED && !hasAuthToken;

  const normalizeKeywordList = (data) => {
    if (Array.isArray(data)) return data;
    if (Array.isArray(data?.items)) return data.items;
    if (Array.isArray(data?.keywords)) return data.keywords;
    return [];
  };

  const queryKey = ['keywords', telegramUser?.id ?? null];
  const keywordsQuery = useQuery({
    queryKey,
    queryFn: async () => {
      const data = await request(`${CONFIG.API.BASE_URL}/keywords`, {}, logout);
      return normalizeKeywordList(data).filter(k => k.is_active);
    },
    enabled: Boolean(telegramUser) && !isDevBypassSession,
    staleTime: 60_000,
  });
  const keywords = isDevBypassSession ? devKeywords : (keywordsQuery.data || []);

  const keywordsMutation = useMutation({
    mutationFn: async (updatedKeywords) => {
      const data = await request(`${CONFIG.API.BASE_URL}/keywords/sync`, {
        method: 'POST',
        body: JSON.stringify({ keywords: updatedKeywords }),
      }, logout);
      return normalizeKeywordList(data).filter(k => k.is_active);
    },
    onSuccess: (keywordList) => {
      queryClient.setQueryData(queryKey, keywordList);
    },
  });

  const syncKeywords = (updatedKeywords) => {
    if (isDevBypassSession) {
      setDevKeywords(updatedKeywords.map((keyword) => ({ keyword, is_active: true })));
      return;
    }
    keywordsMutation.mutate(updatedKeywords);
  };

  const handleAddKeyword = () => {
    const trimmed = newKeyword.trim();
    if (!trimmed) return;

    if (keywords.some(k => k.keyword === trimmed)) {
      setNewKeyword('');
      return;
    }

    const nextKeywords = [...keywords.map(k => k.keyword), trimmed];
    setNewKeyword('');
    syncKeywords(nextKeywords);
  };

  const handleDeleteKeyword = (keywordToDelete) => {
    const nextKeywords = keywords
      .filter(k => k.keyword !== keywordToDelete)
      .map(k => k.keyword);

    setLastDeleted({ type: 'single', data: [keywordToDelete] });
    syncKeywords(nextKeywords);
  };

  const handleDeleteAllKeywords = () => {
    if (keywords.length === 0) return;
    if (!window.confirm('정말로 모든 키워드를 삭제하시겠습니까?')) return;

    const currentKeywords = keywords.map(k => k.keyword);
    setLastDeleted({ type: 'bulk', data: currentKeywords });
    syncKeywords([]);
  };

  const handleUndoDelete = () => {
    if (!lastDeleted) return;

    const currentKeywordList = keywords.map(k => k.keyword);
    const restoredKeywords = [...new Set([...currentKeywordList, ...lastDeleted.data])];

    syncKeywords(restoredKeywords);
    setLastDeleted(null);
  };

  const toggleKeywordOverlay = () => {
    setIsKeywordOverlayOpen(!isKeywordOverlayOpen);
    setLastDeleted(null);
  };

  const openKeywordOverlay = () => {
    setIsKeywordOverlayOpen(true);
    setLastDeleted(null);
  };

  const closeKeywordOverlay = () => {
    setIsKeywordOverlayOpen(false);
    setLastDeleted(null);
  };

  const isLoadingKeywords = keywordsQuery.isPending || keywordsMutation.isPending;

  return {
    keywords,
    newKeyword,
    setNewKeyword,
    isLoadingKeywords,
    isKeywordOverlayOpen,
    setIsKeywordOverlayOpen,
    lastDeleted,
    handleAddKeyword,
    handleDeleteKeyword,
    handleDeleteAllKeywords,
    handleUndoDelete,
    toggleKeywordOverlay,
    openKeywordOverlay,
    closeKeywordOverlay,
  };
};
