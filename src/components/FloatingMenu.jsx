import './FloatingMenu.css';

function FloatingMenu({ isOpen, toggleMenu, toggleSearch, theme, toggleTheme, isFloatingNavVisible }) {
  // 메뉴가 열렸을 때 외부 클릭으로 닫기
  const handleOverlayClick = () => {
    if (isOpen) {
      toggleMenu();
    }
  };

  return (
    <>
      {isFloatingNavVisible && (
        <nav className="floating-nav" style={{ zIndex: 10 }}>
          <button className="floating-button theme-fab" onClick={toggleTheme}>
            {theme === 'light' ? '🌙' : '☀️'}
          </button>
          <button className="floating-button search-fab" onClick={toggleSearch}>
            🔍
          </button>
          <button className="floating-button menu-fab" onClick={toggleMenu}>
            ☰
          </button>
        </nav>
      )}

      {/* 메뉴가 열려 있을 때만 외부 레이어 보이게 */}
      {isOpen && (
        <div
          className="floating-menu-overlay"
          onClick={handleOverlayClick}
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
            className={`floating-menu ${isOpen ? 'open' : ''}`}
            id="floatingMenu"
            onClick={(e) => e.stopPropagation()} // 내부 클릭 시 닫힘 방지
            style={{ zIndex: 10 }} // 메뉴가 오버레이 위에 보이도록
          >
            <div className="floating-menu-content">
              <a className="menu-item" href="/">
                <span className="icon">🏠</span> 홈
              </a>
              <a className="menu-item" href="/global">
                <span className="icon">🌍</span> 글로벌 레포트
              </a>
              <a className="menu-item" onClick={() => window.location.reload()} style={{ cursor: 'pointer' }}>
                <span className="icon">🔄</span> 새로고침
              </a>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default FloatingMenu;