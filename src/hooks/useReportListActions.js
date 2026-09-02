import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { buildShareMenuData } from '../utils/shareMenuData';
import { buildSearchParams, createTextSearch } from '../utils/searchSelection';

export function useReportListActions({ setShare, handleSearch }) {
  const navigate = useNavigate();
  const openShare = useCallback((event, report) => {
    const rect = event.currentTarget.getBoundingClientRect();
    setShare({ isOpen: true, report: buildShareMenuData(report), position: { top: rect.bottom, left: rect.left + rect.width / 2 } });
  }, [setShare]);
  const handleTagClick = useCallback((keyword, isSector) => {
    const nextSearch = createTextSearch(keyword, isSector ? 'sector' : 'title');
    handleSearch(nextSearch);
    const params = buildSearchParams(nextSearch);
    navigate({ pathname: '/recent', search: `?${params.toString()}` });
  }, [handleSearch, navigate]);
  const closeShare = useCallback(() => setShare((current) => ({ ...current, isOpen: false })), [setShare]);
  return { openShare, handleTagClick, closeShare };
}
