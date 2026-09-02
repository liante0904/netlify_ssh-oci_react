import { useEffect, useState } from 'react';
import { normalizeReportItem } from '../utils/reportNormalizer';

export function useReportFavorites({ favoriteItems, isFavoritesPage }) {
  const [favoriteReports, setFavoriteReports] = useState(null);

  useEffect(() => {
    if (!isFavoritesPage || !favoriteItems.length) {
      if (isFavoritesPage) setFavoriteReports({});
      return;
    }
    const grouped = {};
    favoriteItems.map(normalizeReportItem).filter(Boolean).forEach((item) => {
      grouped[item.date] ||= [];
      if (!grouped[item.date].some((row) => row.id === item.id)) grouped[item.date].push(item);
    });
    setFavoriteReports(grouped);
  }, [favoriteItems, isFavoritesPage]);

  return favoriteReports;
}
