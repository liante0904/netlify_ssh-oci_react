import { useCallback, useState } from 'react';

export function useReportUiState() {
  const [isSearchOverlayOpen, setIsSearchOverlayOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isTopMenuOpen, setIsTopMenuOpen] = useState(() => typeof window !== 'undefined' && window.matchMedia?.('(min-width: 1280px)').matches);
  const [sortBy, setSortBy] = useState('time');
  const [viewerReport, setViewerReport] = useState(null);
  const toggleSearch = useCallback(() => setIsSearchOverlayOpen((current) => !current), []);
  const toggleMenu = useCallback(() => setIsMenuOpen((current) => !current), []);
  const toggleMenuTop = useCallback(() => setIsTopMenuOpen((current) => !current), []);
  return { isSearchOverlayOpen, setIsSearchOverlayOpen, isMenuOpen, setIsMenuOpen, isTopMenuOpen, setIsTopMenuOpen, sortBy, setSortBy, viewerReport, setViewerReport, toggleSearch, toggleMenu, toggleMenuTop };
}
