import { useState, useEffect, useRef } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import SearchOverlay from './components/SearchOverlay';
import ReportList from './components/ReportList';
import BottomNav from './components/BottomNav';
import FloatingMenu from './components/FloatingMenu';
import './index.css';

function App() {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isTopMenuOpen, setIsTopMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState({ query: '', category: '' });
  const [isNavVisible, setIsNavVisible] = useState(true);
  const [headerHeight, setHeaderHeight] = useState(0);
  const lastScrollY = useRef(window.scrollY);
  const headerRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const isDesktop = window.innerWidth >= 1024;

      if (isDesktop) {
        setIsNavVisible(false);
        return;
      }

      // Hide nav on scroll down, show on scroll up
      if (currentScrollY > lastScrollY.current && currentScrollY > 100) {
        setIsNavVisible(false);
      } else {
        setIsNavVisible(true);
      }
      lastScrollY.current = currentScrollY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const updateHeaderHeight = () => {
      if (headerRef.current) {
        setHeaderHeight(headerRef.current.offsetHeight);
      }
    };

    updateHeaderHeight();
    const resizeObserver = new ResizeObserver(updateHeaderHeight);
    if (headerRef.current) {
      resizeObserver.observe(headerRef.current);
    }

    return () => {
      if (headerRef.current) {
        resizeObserver.unobserve(headerRef.current);
      }
    };
  }, []);

  const toggleSearch = () => {
    setIsSearchOpen((prev) => !prev);
  };

  const toggleMenuTop = () => setIsTopMenuOpen((prev) => !prev);
  const toggleMenu = () => setIsMenuOpen((prev) => !prev);

  const handleSearch = ({ query, category }) => {
    setSearchQuery({ query, category });
  };

  return (
    <Router>
      <Header
        ref={headerRef}
        isNavVisible={isNavVisible}
        toggleSearch={toggleSearch}
        toggleMenu={toggleMenuTop}
        isTopMenuOpen={isTopMenuOpen}
        onSearch={handleSearch}
      />
      <main className="main-content" style={{ paddingTop: headerHeight }}>
        <Routes>
          <Route path="/" element={<ReportList searchQuery={searchQuery} />} />
          <Route path="/global" element={<ReportList searchQuery={searchQuery} />} />
          <Route path="/industry" element={<ReportList searchQuery={searchQuery} />} />
        </Routes>
      </main>
      <SearchOverlay
        isOpen={isSearchOpen}
        toggleSearch={toggleSearch}
        onSearch={handleSearch}
      />
      <BottomNav 
        isNavVisible={isNavVisible} 
        toggleSearch={toggleSearch} 
        toggleMenu={toggleMenu} 
      />
      <FloatingMenu
        isOpen={isMenuOpen}
        toggleMenu={toggleMenu}
        toggleSearch={toggleSearch}
      />
    </Router>
  );
}

export default App;
