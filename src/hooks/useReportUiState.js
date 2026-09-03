import { useCallback, useEffect, useState } from 'react';
import { useMediaQuery } from './useMediaQuery';

export function useReportUiState() {
  const isDesktop = useMediaQuery('(min-width: 1280px)');
  const [isSearchOverlayOpen, setIsSearchOverlayOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isTopMenuOpen, setIsTopMenuOpen] = useState(isDesktop);
  const [sortBy, setSortBy] = useState('time');
  const [viewerReport, setViewerReport] = useState(null);
  const toggleSearch = useCallback(() => setIsSearchOverlayOpen((current) => !current), []);
  const toggleMenu = useCallback(() => setIsMenuOpen((current) => !current), []);
  const toggleMenuTop = useCallback(() => setIsTopMenuOpen((current) => !current), []);
  useEffect(() => { setIsTopMenuOpen(isDesktop); }, [isDesktop]);
  return { isSearchOverlayOpen, setIsSearchOverlayOpen, isMenuOpen, setIsMenuOpen, isTopMenuOpen, setIsTopMenuOpen, sortBy, setSortBy, viewerReport, setViewerReport, toggleSearch, toggleMenu, toggleMenuTop };
}
