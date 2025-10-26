import React from 'react';
import CompanySelect from './CompanySelect'; // CompanySelect 임포트
import './HamburgerMenu.css';

function HamburgerMenu({ isOpen, toggleMenu, selectedCompany, handleCompanyChange, handleHeaderClick }) {

  const handleSelectChange = (e) => {
    handleCompanyChange(e); // Header로부터 받은 함수 호출
    toggleMenu(); // 메뉴 닫기
  };

  return (
    <>
      {isOpen && (
        <div className={`menu-overlay ${isOpen ? 'open' : ''}`} onClick={toggleMenu}>
          <div
            className={`menu-panel ${isOpen ? 'open' : ''}`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="menu-title">메뉴</div>
            <a
              className="menu-item"
              onClick={() => {
                handleHeaderClick('recent');
              }}
            >
              <span className="icon">🏠</span> 최근 레포트
            </a>
            <a
              className="menu-item"
              onClick={() => {
                handleHeaderClick('global');
              }}
            >
              <span className="icon">🌍</span> 글로벌 레포트
            </a>
            <a
              className="menu-item"
              onClick={() => {
                handleHeaderClick('industry');
              }}
            >
              <span className="icon">🏭</span> 산업 레포트
            </a>
            <div className="menu-title">증권사별 보기</div>
            <div className="menu-item-select">
              <CompanySelect value={selectedCompany} onChange={handleSelectChange} />
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default HamburgerMenu;