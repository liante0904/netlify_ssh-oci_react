import { useCallback, useState } from 'react';

export function useKeywordOverlayState() {
  const [isKeywordOverlayOpen, setIsKeywordOverlayOpen] = useState(false);
  const [lastDeleted, setLastDeleted] = useState(null);
  const clearDeleted = useCallback(() => setLastDeleted(null), []);
  const toggleKeywordOverlay = useCallback(() => { setIsKeywordOverlayOpen((current) => !current); clearDeleted(); }, [clearDeleted]);
  const openKeywordOverlay = useCallback(() => { setIsKeywordOverlayOpen(true); clearDeleted(); }, [clearDeleted]);
  const closeKeywordOverlay = useCallback(() => { setIsKeywordOverlayOpen(false); clearDeleted(); }, [clearDeleted]);
  return { isKeywordOverlayOpen, setIsKeywordOverlayOpen, lastDeleted, setLastDeleted, toggleKeywordOverlay, openKeywordOverlay, closeKeywordOverlay };
}
