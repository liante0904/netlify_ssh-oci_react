import { useEffect, useState } from 'react';

function BottomNav({ toggleSearch, toggleMenu }) {
  const [isVisible, setIsVisible] = useState(true);
  let lastScrollY = window.scrollY;

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const isDesktop = window.innerWidth >= 1024;

      if (isDesktop) {
        setIsVisible(false);
      } else {
        setIsVisible(currentScrollY <= lastScrollY);
      }
      lastScrollY = currentScrollY;
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className="bottom-nav" style={{ display: isVisible ? 'flex' : 'none' }}>
      <button className="nav-button" onClick={() => (window.location.href = '/')}>
        <span>🏠</span>
        <span>홈</span>
      </button>
      <button className="nav-button" onClick={toggleSearch}>
        <span>🔍</span>
        <span>검색</span>
      </button>
      <button className="nav-button" onClick={toggleMenu}>
        <span>☰</span>
        <span>메뉴</span>
      </button>
    </nav>
  );
}

export default BottomNav;