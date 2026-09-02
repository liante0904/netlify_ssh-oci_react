import { CloseIcon, HeaderPopoverShell, SettingsIcon } from './HeaderPopoverPrimitives';

export default function AccountPopover({ telegramUser, onClose, onOpenSettings, onLogout, theme, themePreference, onToggleTheme }) {
  if (!telegramUser) return null;
  const modeLabel = themePreference === 'system'
    ? `시스템 설정 (${theme === 'dark' ? '다크' : '라이트'})`
    : `${theme === 'light' ? '라이트' : '다크'} 모드 · 다음: ${theme === 'light' ? '다크' : '시스템'}`;
  const modeIcon = themePreference === 'system' ? '🖥️' : theme === 'light' ? '🌙' : '☀️';
  return <HeaderPopoverShell labelledBy="account-popover-title" onClose={onClose}>
    <div className="account-popover-profile"><span className="account-popover-avatar">{(telegramUser.first_name || '?').slice(0, 1)}</span><span><h2 id="account-popover-title">{telegramUser.first_name}님</h2><small>Telegram ID {telegramUser.id}</small></span><button type="button" className="header-icon-button account-close" onClick={onClose} aria-label="내 정보 닫기"><CloseIcon /></button></div>
    <div className="account-popover-actions"><button type="button" onClick={onOpenSettings}><SettingsIcon /><span><strong>내 설정</strong><small>키워드와 텔레그램 알림 관리</small></span></button><button type="button" onClick={onToggleTheme}><span className="account-action-symbol">{modeIcon}</span><span><strong>화면 모드</strong><small>{modeLabel}</small></span></button><button type="button" className="account-logout-button" onClick={onLogout}><span className="account-action-symbol">↪</span><span><strong>로그아웃</strong><small>현재 계정에서 나가기</small></span></button></div>
  </HeaderPopoverShell>;
}
