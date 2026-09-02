import { useEffect } from 'react';
import { CONFIG } from '../constants/config';

export function useReportFavoritePersistence({ telegramUser, favorites, setFavorites, favoriteItems, syncFavoriteIds }) {
  useEffect(() => {
    if (!telegramUser || localStorage.getItem('report_favorites_synced')) return;
    const token = localStorage.getItem(CONFIG.STORAGE_KEYS.AUTH_TOKEN);
    if (!token) return;
    const ids = Object.keys(favorites).filter((id) => favorites[id]).map(Number);
    if (ids.length) syncFavoriteIds(ids);
    localStorage.setItem('report_favorites_synced', '1');
  }, [favorites, syncFavoriteIds, telegramUser]);

  useEffect(() => {
    if (!favoriteItems.length) return;
    setFavorites((current) => {
      const next = { ...current };
      favoriteItems.forEach((item) => { next[item.report_id] = true; });
      localStorage.setItem('report_favorites', JSON.stringify(next));
      return next;
    });
  }, [favoriteItems, setFavorites]);
}
