import './BottomNav.css';

function BottomNav({ isNavVisible, toggleSearch, toggleMenu }) {
  return (
    <nav className={`bottom-nav ${isNavVisible ? '' : 'hidden'}`}>
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
