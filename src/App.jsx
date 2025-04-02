import { useState } from 'react';
import Header from './components/Header';
import SearchOverlay from './components/SearchOverlay';
import ReportList from './components/ReportList';
import BottomNav from './components/BottomNav';
import FloatingMenu from './components/FloatingMenu';
import './index.css';

function App() {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false); // 오타 수정
  const [isTopMenuOpen, setIsTopMenuOpen] = useState(false);
  const [searchResults, setSearchResults] = useState(null);

  const toggleSearch = () => setIsSearchOpen(!isSearchOpen);
  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const toggleMenuTop = () => setIsTopMenuOpen(!isTopMenuOpen);

  const handleSearch = (results) => {
    setSearchResults(results);
  };

  return (
    <>
      <Header toggleSearch={toggleSearch} toggleMenu={toggleMenuTop} isTopMenuOpen={isTopMenuOpen} />
      <div className="subtitle" id="subtitle">현재 메뉴</div>
      <ReportList searchResults={searchResults} />
      <SearchOverlay isOpen={isSearchOpen} toggleSearch={toggleSearch} onSearch={handleSearch} />
      <BottomNav toggleSearch={toggleSearch} toggleMenu={toggleMenu} />
      <FloatingMenu isOpen={isMenuOpen} toggleMenu={toggleMenu} toggleSearch={toggleSearch} />
    </>
  );
}

export default App;