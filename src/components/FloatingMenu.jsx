function FloatingMenu({ isOpen, toggleMenu, toggleSearch }) {
    return (
      <>
        <nav className="floating-nav">
          <button className="floating-button search-fab" onClick={toggleSearch}>
            🔍
          </button>
          <button className="floating-button menu-fab" onClick={toggleMenu}>
            ☰
          </button>
        </nav>
        <div className={`floating-menu ${isOpen ? 'open' : ''}`} id="floatingMenu">
          <div className="floating-menu-content">
            <a className="menu-item" href="/">🏠 홈</a>
            <a className="menu-item" href="/global">글로벌 레포트</a>
          </div>
        </div>
      </>
    );
  }
  
  export default FloatingMenu;