import React from 'react';
import CompanySelect from '../CompanySelect';
import BoardSelect from '../BoardSelect';

export default function HamburgerFilters({ selectedCompany, onCompanyChange, boards, selectedBoard, onBoardChange, closeMenu }) {
  return <section className="menu-section">
    <div className="menu-section-title">증권사 필터</div>
    <div className="menu-item-select"><CompanySelect value={selectedCompany} onChange={(event) => { onCompanyChange(event); closeMenu(); }} className="company-select" /></div>
    {selectedCompany && boards.length > 0 && <div className="menu-item-select"><BoardSelect value={selectedBoard} boards={boards} onChange={(event) => { onBoardChange(event); closeMenu(); }} className="board-select" /></div>}
  </section>;
}
