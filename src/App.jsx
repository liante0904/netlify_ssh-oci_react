import { useState } from 'react';
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
  const [searchQuery, setSearchQuery] = useState(null);

  const toggleSearch = () => {
    console.log('toggleSearch called, current isSearchOpen:', isSearchOpen); // 디버깅
    setIsSearchOpen((prev) => {
      console.log('Setting isSearchOpen to:', !prev); // 디버깅
      return !prev;
    });
  };
  const toggleMenuTop = () => setIsTopMenuOpen((prev) => !prev);
  const toggleMenu = () => setIsMenuOpen((prev) => !prev);
  const handleSearch = (query) => {
    console.log('handleSearch called with query:', query); // 디버깅
    setSearchQuery(query);
  };

  return (
    <Router>
      <Header
        toggleSearch={toggleSearch}
        toggleMenu={toggleMenuTop}
        isTopMenuOpen={isTopMenuOpen}
      />
      <Routes>
        <Route path="/" element={<ReportList searchQuery={searchQuery} />} />
        <Route path="/global" element={<ReportList searchQuery={searchQuery} />} />
      </Routes>
      <SearchOverlay
        isOpen={isSearchOpen}
        toggleSearch={toggleSearch}
        onSearch={handleSearch}
      />
      <BottomNav toggleSearch={toggleSearch} toggleMenu={toggleMenu} />
      <FloatingMenu
        isOpen={isMenuOpen}
        toggleMenu={toggleMenu}
        toggleSearch={toggleSearch}
      />
    </Router>
  );
}

export default App;