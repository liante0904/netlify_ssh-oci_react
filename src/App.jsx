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
  const lastScrollY = useRef(window.scrollY);

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
        isNavVisible={isNavVisible}
        toggleSearch={toggleSearch}
        toggleMenu={toggleMenuTop}
        isTopMenuOpen={isTopMenuOpen}
        onSearch={handleSearch}
      />
      <Routes>
        <Route path="/" element={<ReportList searchQuery={searchQuery} />} />
        <Route path="/global" element={<ReportList searchQuery={searchQuery} />} />
        <Route path="/industry" element={<ReportList searchQuery={searchQuery} />} />
      </Routes>
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
