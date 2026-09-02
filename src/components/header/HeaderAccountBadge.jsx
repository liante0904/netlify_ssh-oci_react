import React from 'react';

export default function HeaderAccountBadge({ user, isAuthenticating, onLogin, onOpen, expanded }) {
  if (!user) return <button type="button" className="tg-badge tg-badge-off" title="텔레그램 브라우저 로그인" onClick={onLogin} disabled={isAuthenticating}><span className="tg-badge-icon">✈️</span><span className="tg-badge-name">{isAuthenticating ? '인증 중' : '로그인'}</span></button>;
  return <button type="button" className="tg-badge tg-badge-on account-trigger" title={`내 계정 설정: ${user.first_name} (ID:${user.id})`} onClick={onOpen} aria-label={`${user.first_name}님 내 계정 설정 열기`} aria-expanded={expanded}><span className="tg-badge-icon">👤</span><span className="tg-badge-name">{user.first_name}님</span><span className="tg-badge-settings">⚙️</span><span className="tg-badge-chevron">⌄</span></button>;
}
