import { useCallback, useState } from 'react';
import { useRevealOlderDate } from './useRevealOlderDate';

export function useReportListInteractions({ dates, hasMore, isLoading, fetchMore, revealEnabled = true, initialFavorites = {}, mutateFavorite }) {
  const [dateToggles, setDateToggles] = useState({});
  const [firmToggles, setFirmToggles] = useState({});
  const [summaryToggles, setSummaryToggles] = useState({});
  const [favorites, setFavorites] = useState(initialFavorites);
  const { requestReveal } = useRevealOlderDate({ dates, hasMore, isLoading, fetchMore, enabled: revealEnabled });

  const reset = useCallback(() => {
    setDateToggles({});
    setFirmToggles({});
    setSummaryToggles({});
  }, []);

  const toggleDate = useCallback((date) => {
    setDateToggles((current) => {
      const willCollapse = !current[date];
      if (willCollapse) requestReveal(date);
      return { ...current, [date]: willCollapse };
    });
  }, [requestReveal]);

  const toggleFirm = useCallback((date, firm) => {
    setFirmToggles((current) => ({ ...current, [date]: { ...current[date], [firm]: !current[date]?.[firm] } }));
  }, []);

  const toggleSummary = useCallback((id) => {
    setSummaryToggles((current) => ({ ...current, [id]: !current[id] }));
  }, []);

  const toggleFavorite = useCallback((id) => {
    setFavorites((current) => {
      const next = { ...current, [id]: !current[id] };
      localStorage.setItem('report_favorites', JSON.stringify(next));
      mutateFavorite(id, next[id])?.catch(() => {
        setFavorites(current);
        localStorage.setItem('report_favorites', JSON.stringify(current));
      });
      return next;
    });
  }, [mutateFavorite]);

  return { dateToggles, firmToggles, summaryToggles, favorites, setFavorites, reset, toggleDate, toggleFirm, toggleSummary, toggleFavorite };
}
