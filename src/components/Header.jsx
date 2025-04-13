import React, { useState } from 'react';
import './Header.css';

function Header({ toggleSearch, toggleMenu, isTopMenuOpen }) {
    const [activeButton, setActiveButton] = useState('recent'); // 최근 버튼 기본 활성화

    const handleButtonClick = (buttonName) => {
        setActiveButton(buttonName);
        if (buttonName === 'recent') window.location.href = '/';
        if (buttonName === 'global') window.location.href = '/global';
        if (buttonName === 'search') toggleSearch();
    };

    return (
        <>
            <header>
                {/* 첫 번째 줄 */}
                <div className="header-top">
                    <div className="title" onClick={() => (window.location.href = '/')}>
                        🏠증권사 레포트 리스트
                    </div>
                    <div className="hamburger-menu" onClick={toggleMenu}>
                        <div></div>
                        <div></div>
                        <div></div>
                    </div>
                </div>

                {/* 두 번째 줄 - 네비게이션 */}
                <div className="header-nav">
                    <button
                        className={`nav-button ${activeButton === 'recent' ? 'active' : ''}`}
                        onClick={() => handleButtonClick('recent')}
                    >
                        최근
                    </button>
                    <button
                        className={`nav-button ${activeButton === 'global' ? 'active' : ''}`}
                        onClick={() => handleButtonClick('global')}
                    >
                        글로벌
                    </button>
                    <button
                        className={`nav-button ${activeButton === 'search' ? 'active' : ''}`}
                        onClick={() => handleButtonClick('search')}
                    >
                        검색
                    </button>
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
