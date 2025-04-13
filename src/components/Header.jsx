import React from 'react';
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import './Header.css';

function Header({ toggleSearch, toggleMenu, isTopMenuOpen }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  const isRecent = location.pathname === '/';
  const isGlobal = location.pathname.includes('global');

  const handleButtonClick = (buttonName) => {
    if (buttonName === 'recent') {
      navigate({ pathname: '/', search: searchParams.toString() });
    } else if (buttonName === 'global') {
      navigate({ pathname: '/global', search: searchParams.toString() });
    } else if (buttonName === 'search') {
      console.log('Header: Search button clicked, calling toggleSearch'); // 디버깅
      toggleSearch();
    }
  };

  return (
    <>
      <header>
        <div className="header-top">
          <div
            className="title"
            onClick={() =>
              navigate({ pathname: '/', search: searchParams.toString() })
            }
          >
            🏠증권사 레포트 리스트
          </div>
          <div className="hamburger-menu" onClick={toggleMenu}>
            <div></div>
            <div></div>
            <div></div>
          </div>
        </div>

        <div className="header-nav">
          <button
            className={`nav-button ${isRecent ? 'active' : ''}`}
            onClick={() => handleButtonClick('recent')}
          >
            최근
          </button>
          <button
            className={`nav-button ${isGlobal ? 'active' : ''}`}
            onClick={() => handleButtonClick('global')}
          >
            글로벌
          </button>
          <button
            className="nav-button"
            onClick={() => handleButtonClick('search')}
          >
            검색
          </button>
        </div>
      </header>

      {isTopMenuOpen && (
        <div className="menu-overlay" onClick={toggleMenu}>
          <div
            className="menu-panel open"
            onClick={(e) => e.stopPropagation()}
            style={{ zIndex: 10 }}
          >
            <div className="menu-title">메뉴</div>
            <a
              className="menu-item"
              onClick={() =>
                navigate({ pathname: '/', search: searchParams.toString() })
              }
            >
              최근 레포트
            </a>
            <a
              className="menu-item"
              onClick={() =>
                navigate({ pathname: '/global', search: searchParams.toString() })
              }
            >
              글로벌 레포트
            </a>
          </div>
        </div>
      )}
    </>
  );
}

export default Header;