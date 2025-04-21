import { useEffect, useState } from 'react';
import './BottomNav.css'; // Assuming you have a CSS file for styles

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
      </button>
      <button className="nav-button" onClick={toggleSearch}>
        <span>🔍</span>
      </button>
      <button className="nav-button" onClick={toggleMenu}>
        <span>☰</span>
      </button>
    </nav>
  );
}

export default BottomNav;