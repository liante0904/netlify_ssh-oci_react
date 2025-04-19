import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './Header.css';

function Header({ toggleSearch, toggleMenu, isTopMenuOpen }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [isSearchActive, setIsSearchActive] = useState(false);

  const isRecent = location.pathname === '/';
  const isGlobal = location.pathname.includes('global');

  const handleButtonClick = (buttonName) => {
    // 검색 버튼이 아닌 경우 검색 비활성화
    if (buttonName !== 'search') {
      setIsSearchActive(false);
    }

    if (buttonName === 'recent') {
      navigate({ pathname: '/' }); // 최근 탭으로 이동
    } else if (buttonName === 'global') {
      navigate({ pathname: '/global' }); // 글로벌 탭으로 이동
    } else if (buttonName === 'search') {
      setIsSearchActive(true); // 검색 버튼 활성화
      navigate({ pathname: '/' }); // 검색은 항상 최근(전체) 탭에서 수행
      toggleSearch(); // 검색 오버레이 열기
    }
  };

  // toggleSearch를 래핑하여 검색 오버레이 닫힐 때 isSearchActive 초기화
  const wrappedToggleSearch = () => {
    toggleSearch();
    setIsSearchActive(false); // 오버레이 닫힐 때 검색 버튼 비활성화
  };

  return (
    <>
      <header>
        <div className="header-top">
          <div
            className="title"
            onClick={() => navigate({ pathname: '/' })}
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
            className={`nav-button ${isRecent && !isSearchActive ? 'active' : ''}`}
            onClick={() => handleButtonClick('recent')}
          >
            최근
          </button>
          <button
            className={`nav-button ${isGlobal && !isSearchActive ? 'active' : ''}`}
            onClick={() => handleButtonClick('global')}
          >
            글로벌
          </button>
          <button
            className={`nav-button ${isSearchActive ? 'active' : ''}`}
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
              onClick={() => navigate({ pathname: '/' })}
            >
              최근 레포트
            </a>
            <a
              className="menu-item"
              onClick={() => navigate({ pathname: '/global' })}
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