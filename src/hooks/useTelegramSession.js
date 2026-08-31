import { useCallback, useEffect, useState } from 'react';
import { CONFIG } from '../constants/config';

export function useTelegramSession() {
  const [telegramUser, setTelegramUser] = useState(() => {
    try {
      const saved = localStorage.getItem(CONFIG.STORAGE_KEYS.TELEGRAM_USER);
      return saved ? JSON.parse(saved) : null;
    } catch { return null; }
  });
  const [isVerifying, setIsVerifying] = useState(() => Boolean(localStorage.getItem(CONFIG.STORAGE_KEYS.AUTH_TOKEN) && localStorage.getItem(CONFIG.STORAGE_KEYS.TELEGRAM_USER)));
  const [authExpired, setAuthExpired] = useState(false);
  const authStatus = isVerifying ? 'checking' : authExpired ? 'expired' : !telegramUser?.id ? 'unauthenticated' : telegramUser.status === 'active' ? 'authenticated' : 'pending';

  useEffect(() => { if (telegramUser?.id) setAuthExpired(false); }, [telegramUser?.id]);

  useEffect(() => {
    const token = localStorage.getItem(CONFIG.STORAGE_KEYS.AUTH_TOKEN);
    const savedUser = localStorage.getItem(CONFIG.STORAGE_KEYS.TELEGRAM_USER);
    if (!token || !savedUser) return undefined;
    let cancelled = false;
    setIsVerifying(true);
    fetch(`${CONFIG.API.BASE_URL}/keywords`, { headers: { Authorization: `Bearer ${token}` }, signal: AbortSignal.timeout ? AbortSignal.timeout(8000) : undefined })
      .then((response) => {
        if (cancelled || (response.ok || (response.status !== 401 && response.status !== 403))) return;
        localStorage.removeItem(CONFIG.STORAGE_KEYS.AUTH_TOKEN);
        localStorage.removeItem(CONFIG.STORAGE_KEYS.TELEGRAM_USER);
        localStorage.removeItem(CONFIG.STORAGE_KEYS.REMEMBER_ME);
        setAuthExpired(true);
        setTelegramUser(null);
      })
      .catch(() => {})
      .finally(() => { if (!cancelled) setIsVerifying(false); });
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    const handleStorage = (event) => {
      if (event.key === CONFIG.STORAGE_KEYS.AUTH_TOKEN && !event.newValue) { setAuthExpired(false); setTelegramUser(null); }
      if (event.key !== CONFIG.STORAGE_KEYS.TELEGRAM_USER) return;
      if (!event.newValue) { setAuthExpired(false); setTelegramUser(null); return; }
      try { const user = JSON.parse(event.newValue); if (user?.id) setTelegramUser(user); } catch { /* malformed storage */ }
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  const logout = useCallback(() => {
    [CONFIG.STORAGE_KEYS.AUTH_TOKEN, CONFIG.STORAGE_KEYS.TELEGRAM_USER, CONFIG.STORAGE_KEYS.REMEMBER_ME].forEach((key) => localStorage.removeItem(key));
    [CONFIG.STORAGE_KEYS.AUTH_TOKEN, CONFIG.STORAGE_KEYS.TELEGRAM_USER].forEach((key) => sessionStorage.removeItem(key));
    setAuthExpired(false);
    setTelegramUser(null);
  }, []);

  return { telegramUser, setTelegramUser, isVerifying, authStatus, logout };
}
