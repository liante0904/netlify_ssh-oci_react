function Header({ toggleSearch, toggleMenu, isTopMenuOpen }) {
    return (
      <header>
        <div className="title" onClick={() => (window.location.href = '/')}>
          🏠증권사 레포트 리스트
        </div>
        <div className="search-button" onClick={toggleSearch}>
          🔍
        </div>
        <div className="hamburger-menu" onClick={toggleMenu}>
          <div></div>
          <div></div>
          <div></div>
        </div>
        <div className={`menu-panel ${isTopMenuOpen ? 'open' : ''}`}>
          <div className="menu-title">메뉴</div>
          <a className="menu-item" href="/">최근 레포트</a>
          <a className="menu-item" href="/report/global">글로벌 레포트</a>
        </div>
      </header>
    );
  }
  
  export default Header;