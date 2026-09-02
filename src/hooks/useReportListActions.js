import { useCallback } from 'react';
import { buildShareMenuData } from '../utils/shareMenuData';

export function useReportListActions({ setShare, handleSearch }) {
  const openShare = useCallback((event, report) => {
    const rect = event.currentTarget.getBoundingClientRect();
    setShare({ isOpen: true, report: buildShareMenuData(report), position: { top: rect.bottom, left: rect.left + rect.width / 2 } });
  }, [setShare]);
  const handleTagClick = useCallback((keyword, isSector) => handleSearch({ query: keyword, category: isSector ? 'sector' : 'title' }), [handleSearch]);
  const closeShare = useCallback(() => setShare((current) => ({ ...current, isOpen: false })), [setShare]);
  return { openShare, handleTagClick, closeShare };
}
