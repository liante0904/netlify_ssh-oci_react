import React from 'react';
import { useReport } from '../context/useReport';
import LoginPage from './LoginPage';
import LoadingSkeleton from './LoadingSkeleton';

/**
 * Protected route wrapper — 로그인 + 승인된 회원만 접근.
 * 모든 페이지에 점진적 적용 가능하도록 설계.
 *
 * 사용법:
 *   <Route path="/" element={<RequireAuth><HomeDashboard /></RequireAuth>} />
 */
export default function RequireAuth({ children }) {
  const { telegramUser, authStatus } = useReport();

  if (authStatus === 'checking') {
    return <LoadingSkeleton rows={5} label="로그인 상태 확인 중" />;
  }

  // 미로그인 or 승인 대기
  if (authStatus === 'expired') {
    return <LoginPage reason="session_expired" />;
  }

  if (authStatus === 'unauthenticated') {
    return <LoginPage reason="not_logged_in" />;
  }

  if (authStatus === 'pending') {
    return <LoginPage reason="pending_approval" user={telegramUser} />;
  }

  return children;
}
