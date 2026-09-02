import React from 'react';

const MENU_ITEMS = [
  ['home', '🏠', '홈', '오늘의 흐름'], ['recent', '🕘', '최근', '최신 리포트'],
  ['fnguide', '📄', '종목요약', 'FnGuide 요약'], ['ai_summary', '🤖', 'AI요약', '요약 리포트'],
  ['industry', '🏭', '산업', '섹터 리포트'], ['global', '🌍', '글로벌', '해외 리서치'],
  ['outlook', '🔮', '전망', '전략/전망'], ['favorites', '⭐', '즐겨찾기', '저장한 항목'],
];

export default function HamburgerNavigation({ onNavigate }) {
  return <section className="menu-section">
    <div className="menu-section-title">빠른 이동</div>
    <div className="menu-grid">
      {MENU_ITEMS.map(([key, icon, label, description]) => (
        <button key={key} type="button" className="menu-card" onClick={() => onNavigate(key)}>
          <span className="menu-card-icon">{icon}</span>
          <span className="menu-card-text"><strong>{label}</strong><small>{description}</small></span>
        </button>
      ))}
    </div>
  </section>;
}
