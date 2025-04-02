import { useState } from 'react';
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
  const [searchQuery, setSearchQuery] = useState(null); // 검색 쿼리 상태 추가

  const toggleSearch = () => setIsSearchOpen(!isSearchOpen);
  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const toggleMenuTop = () => setIsTopMenuOpen(!isTopMenuOpen);

  const handleSearch = (query, category) => {
    setSearchQuery({ query, category }); // 검색 쿼리와 카테고리 저장
    toggleSearch(); // 오버레이 닫기
  };

  return (
    <>
      <Header toggleSearch={toggleSearch} toggleMenu={toggleMenuTop} isTopMenuOpen={isTopMenuOpen} />
      <div className="subtitle" id="subtitle">현재 메뉴</div>
      <ReportList searchQuery={searchQuery} />
      <SearchOverlay isOpen={isSearchOpen} toggleSearch={toggleSearch} onSearch={handleSearch} />
      <BottomNav toggleSearch={toggleSearch} toggleMenu={toggleMenu} />
      <FloatingMenu isOpen={isMenuOpen} toggleMenu={toggleMenu} toggleSearch={toggleSearch} />
    </>
  );
}

export default App;