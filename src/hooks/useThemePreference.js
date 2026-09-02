import { useCallback, useEffect, useRef, useState } from 'react';

const getSystemTheme = () => window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';

export function useThemePreference(storageKey, userId) {
  const [themePreference, setThemePreference] = useState(() => localStorage.getItem(storageKey) || 'system');
  const skipPersistRef = useRef(false);
  const [theme, setTheme] = useState(() => {
    const preference = localStorage.getItem(storageKey) || 'system';
    return preference === 'system' ? getSystemTheme() : preference;
  });

  useEffect(() => {
    const savedTheme = userId
      ? localStorage.getItem(`${storageKey}:${userId}`)
      : localStorage.getItem(storageKey);
    if (savedTheme) {
      skipPersistRef.current = true;
      setThemePreference(savedTheme);
    }
  }, [storageKey, userId]);

  useEffect(() => {
    if (skipPersistRef.current) {
      skipPersistRef.current = false;
      return undefined;
    }
    const resolvedTheme = themePreference === 'system' ? getSystemTheme() : themePreference;
    setTheme(resolvedTheme);
    document.documentElement.setAttribute('data-theme', resolvedTheme);
    const currentStorageKey = userId ? `${storageKey}:${userId}` : storageKey;
    localStorage.setItem(currentStorageKey, themePreference);
    if (themePreference !== 'system') return undefined;
    const media = window.matchMedia?.('(prefers-color-scheme: dark)');
    const handleSystemTheme = () => setTheme(media.matches ? 'dark' : 'light');
    media?.addEventListener('change', handleSystemTheme);
    return () => media?.removeEventListener('change', handleSystemTheme);
  }, [storageKey, themePreference, userId]);

  const toggleTheme = useCallback(() => {
    setThemePreference((preference) => preference === 'system' ? 'light' : preference === 'light' ? 'dark' : 'system');
  }, []);

  return { theme, themePreference, setTheme: setThemePreference, toggleTheme };
}
