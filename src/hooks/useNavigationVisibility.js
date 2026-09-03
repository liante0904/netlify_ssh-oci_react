import { useCallback, useEffect, useRef, useState } from 'react';
import { useReport } from '../context/useReport';

export function useNavigationVisibility() {
  const { isMenuOpen, setIsMenuOpen, isTopMenuOpen, setIsTopMenuOpen } = useReport();
  const [isNavVisible, setIsNavVisible] = useState(true);
  const [isFloatingNavVisible, setIsFloatingNavVisible] = useState(true);
  const lastScrollY = useRef(window.scrollY);
  const rafId = useRef(null);
  const scrollDir = useRef(null);
  const dirDistance = useRef(0);
  const isMenuOpenRef = useRef(isMenuOpen);
  const isTopMenuOpenRef = useRef(isTopMenuOpen);
  isMenuOpenRef.current = isMenuOpen;
  isTopMenuOpenRef.current = isTopMenuOpen;

  const toggleFloatingNav = useCallback(() => setIsFloatingNavVisible((current) => !current), []);

  useEffect(() => {
    const handleResize = () => setIsFloatingNavVisible(window.innerWidth >= 640);
    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    let menuCloseAccum = 0;
    const handleScroll = () => {
      if (rafId.current !== null) return;
      rafId.current = requestAnimationFrame(() => {
        rafId.current = null;
        const currentScrollY = window.scrollY;
        const delta = currentScrollY - lastScrollY.current;
        menuCloseAccum += Math.abs(delta);
        if (menuCloseAccum > 25) {
          if (isMenuOpenRef.current) setIsMenuOpen(false);
          if (isTopMenuOpenRef.current) setIsTopMenuOpen(false);
          menuCloseAccum = 0;
        }
        if (delta > 5) {
          if (scrollDir.current !== 'down') { scrollDir.current = 'down'; dirDistance.current = 0; }
          dirDistance.current += delta;
          if (dirDistance.current > 15 && currentScrollY > 100) setIsNavVisible(false);
        } else if (delta < -5) {
          if (scrollDir.current !== 'up') { scrollDir.current = 'up'; dirDistance.current = 0; }
          dirDistance.current += Math.abs(delta);
          if (dirDistance.current > 15) setIsNavVisible(true);
        }
        lastScrollY.current = currentScrollY;
      });
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => { window.removeEventListener('scroll', handleScroll); if (rafId.current !== null) { cancelAnimationFrame(rafId.current); rafId.current = null; } };
  }, [setIsMenuOpen, setIsTopMenuOpen]);

  return { isNavVisible, isFloatingNavVisible, toggleFloatingNav };
}
