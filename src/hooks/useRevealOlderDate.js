import { useEffect, useState } from 'react';

export function useRevealOlderDate({ dates, hasMore, isLoading, fetchMore, enabled = true }) {
  const [pendingDate, setPendingDate] = useState(null);

  useEffect(() => {
    if (!enabled || !pendingDate || isLoading) return undefined;

    const currentIndex = dates.indexOf(pendingDate);
    const olderDate = currentIndex >= 0 ? dates[currentIndex + 1] : null;
    if (!olderDate) {
      if (hasMore) {
        fetchMore();
        return undefined;
      }
      setPendingDate(null);
      return undefined;
    }

    const timer = window.setTimeout(() => {
      const olderGroup = Array.from(document.querySelectorAll('[data-report-date]'))
        .find((element) => element.dataset.reportDate === olderDate);
      olderGroup?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setPendingDate(null);
    }, 450);

    return () => window.clearTimeout(timer);
  }, [dates, enabled, fetchMore, hasMore, isLoading, pendingDate]);

  return { requestReveal: enabled ? setPendingDate : () => {} };
}
