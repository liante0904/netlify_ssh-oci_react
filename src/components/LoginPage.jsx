import React, { useEffect } from 'react';
import { useTelegramAuth } from '../hooks/useTelegramAuth';
import { CONFIG } from '../constants/config';
import './LoginPage.css';

/**
 * 로그인 페이지 — Header의 '로그인' 버튼과 동일한 loginWithTelegram 사용.
 * RequireAuth에서 미인증 시 자동 노출.
 */
export default function LoginPage({ reason, user }) {
  const { loginWithTelegram, isAuthenticating } = useTelegramAuth();

  // 승인 대기 중 주기적 확인
  useEffect(() => {
    if (reason !== 'pending_approval' || !user?.id) return;
    const interval = setInterval(() => {
      const stored = localStorage.getItem(CONFIG.STORAGE_KEYS.TELEGRAM_USER);
      if (stored) {
        try { if (JSON.parse(stored).status === 'active') window.location.reload(); } catch { /* ignore malformed storage */ }
      }
    }, 120000);
    return () => clearInterval(interval);
  }, [reason, user]);

  if (reason === 'pending_approval') {
    return (
      <div className="login-page">
        <div className="login-card">
          <div className="login-icon">⏳</div>
          <h2 className="login-title">승인 대기 중</h2>
          <p className="login-subtitle">{(user || {}).first_name || 'User'}님, 관리자 승인 후 이용 가능합니다.</p>
          <button className="login-button" onClick={() => window.location.reload()}>새로고침</button>
          <a href="/" className="login-link">메인으로 돌아가기</a>
        </div>
      </div>
    );
  }

  const isSessionExpired = reason === 'session_expired';

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-icon">📊</div>
        <h2 className="login-title">리포트 허브</h2>
        <p className="login-subtitle">
          {isSessionExpired ? '세션이 만료되었습니다. 다시 로그인해 주세요.' : '증권사 리서치 리포트 통합 뷰어'}
        </p>

        <button
          className="login-button login-button-telegram"
          onClick={loginWithTelegram}
          disabled={isAuthenticating}
        >
          {isAuthenticating ? '인증 중...' : '로그인'}
        </button>

        <p className="login-hint">
          Header의 로그인 버튼과 동일하게 동작합니다.
        </p>
        <a href="/" className="login-link">메인으로 돌아가기</a>
      </div>
    </div>
  );
}
