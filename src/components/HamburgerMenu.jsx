import React from 'react';
import { useNavigate } from 'react-router-dom';
import './HamburgerMenu.css';

function HamburgerMenu({ isOpen, toggleMenu, selectedCompany, setSelectedCompany }) {
  const navigate = useNavigate();

  // 가정: 증권사 목록
  const companies = ['모두', '삼성증권', '현대차증권', 'KB증권'];

  const handleCompanyChange = (e) => {
    const company = e.target.value;
    setSelectedCompany(company);
    if (company === '모두') {
      navigate({ pathname: '/' });
    } else {
      navigate({ pathname: `/company/${company}` });
    }
    toggleMenu();
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
                setSelectedCompany('');
                navigate({ pathname: '/' });
                toggleMenu();
              }}
            >
              <span className="icon">🏠</span> 최근 레포트
            </a>
            <a
              className="menu-item"
              onClick={() => {
                setSelectedCompany('');
                navigate({ pathname: '/global' });
                toggleMenu();
              }}
            >
              <span className="icon">🌍</span> 글로벌 레포트
            </a>
            <div className="menu-title">증권사별 보기</div>
            <select
              className="company-select"
              value={selectedCompany}
              onChange={handleCompanyChange}
            >
              {companies.map((company) => (
                <option key={company} value={company}>
                  {company}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}
    </>
  );
}

export default HamburgerMenu;