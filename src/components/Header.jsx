function Header({ toggleSearch, toggleMenu, isTopMenuOpen }) {
  return (
    <>
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
      </header>

      {/* 오버레이 (메뉴 열렸을 때만 보임) */}
      {isTopMenuOpen && (
        <div
          className="menu-overlay"
          onClick={toggleMenu}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            zIndex: 9,
          }}
        >
          <div
            className={`menu-panel ${isTopMenuOpen ? 'open' : ''}`}
            onClick={(e) => e.stopPropagation()}
            style={{ zIndex: 10 }}
          >
            <div className="menu-title">메뉴</div>
            <a className="menu-item" href="/">최근 레포트</a>
            <a className="menu-item" href="/global">글로벌 레포트</a>
          </div>
        </div>
      )}
    </>
  );
}

export default Header;
