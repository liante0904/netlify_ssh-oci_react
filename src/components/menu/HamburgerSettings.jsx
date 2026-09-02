import React from 'react';
import './HamburgerSettings.css';

export default function HamburgerSettings({ theme, themePreference, onToggleTheme }) {
  const modeLabel = themePreference === 'system'
    ? `시스템 설정 (${theme === 'dark' ? '다크' : '라이트'})`
    : `${theme === 'light' ? '라이트' : '다크'} 모드 · 다음: ${theme === 'light' ? '다크' : '시스템'}`;
  return <section className="menu-section">
    <div className="menu-section-title">설정</div>
    <div className="menu-setting-list">
      <button type="button" className="menu-setting-row" onClick={onToggleTheme} aria-label={`화면 모드 변경: ${modeLabel}`}>
        <span className="menu-setting-icon">{themePreference === 'system' ? '🖥️' : theme === 'light' ? '🌙' : '☀️'}</span>
        <span><strong>화면 모드</strong><small>{modeLabel}</small></span>
      </button>
    </div>
  </section>;
}
