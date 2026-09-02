import React from 'react';

export default function TelegramLoginPanel({ isAuthenticating, loginWithTelegram, loginWithDevBypass, devAuth }) {
  return <div className="telegram-auth-box"><p className="telegram-desc">텔레그램 로그인</p>{devAuth ? <><button className="telegram-dev-login-btn" onClick={loginWithDevBypass} disabled={isAuthenticating}><span className="telegram-icon">🧪</span> 개발용 우회 로그인</button><p className="telegram-dev-desc">개발 환경에서는 텔레그램 봇 위젯 대신 로컬 우회 로그인을 사용합니다.</p></> : <div className="telegram-btn-group"><button className="telegram-custom-login-btn" onClick={loginWithTelegram} disabled={isAuthenticating}><span className="telegram-icon">✈️</span> {isAuthenticating ? '인증 중...' : '브라우저로 로그인'}</button></div>}</div>;
}
