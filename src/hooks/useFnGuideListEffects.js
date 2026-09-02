import { useEffect } from 'react';

export function useFnGuideListEffects({ selectedSummaryId, dates, selectedDate, setSelectedDate, searchQuery, providerFilter, selectedFacet, setSearchParams, chipsRef, scrolledId, summaries, setCollapsedGroups, setExpandedItems }) {
  useEffect(() => {
    setSelectedDate((current) => current && dates.some((item) => item.report_date === current) ? current : dates[0]?.report_date || '');
  }, [dates, setSelectedDate]);

  useEffect(() => {
    const next = new URLSearchParams();
    if (selectedSummaryId) next.set('summary_id', selectedSummaryId);
    [['q', searchQuery], ['provider', providerFilter], ['date', selectedDate]].forEach(([key, value]) => value ? next.set(key, value) : next.delete(key));
    if (selectedFacet) {
      next.set('facet', selectedFacet.type);
      next.set('facet_value', selectedFacet.value);
    }
    setSearchParams(next, { replace: true });
  }, [providerFilter, searchQuery, selectedDate, selectedFacet, selectedSummaryId, setSearchParams]);

  useEffect(() => {
    if (!selectedDate || !chipsRef.current) return;
    chipsRef.current.querySelector(`[data-date-chip="${selectedDate}"]`)?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
  }, [dates, selectedDate, chipsRef]);

  useEffect(() => {
    if (!selectedSummaryId || scrolledId.current === selectedSummaryId) return;
    const item = summaries.find((summary) => String(summary.summary_id) === selectedSummaryId);
    if (!item) return;
    const key = `${item.report_date}-${item.company_code || item.company_name || `summary-${item.summary_id}`}`;
    setCollapsedGroups((current) => ({ ...current, [key]: false }));
    setExpandedItems((current) => ({ ...current, [item.summary_id]: true }));
    scrolledId.current = selectedSummaryId;
    const timeout = window.setTimeout(() => document.getElementById(`fnguide-summary-${selectedSummaryId}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 80);
    return () => window.clearTimeout(timeout);
  }, [selectedSummaryId, summaries, scrolledId, setCollapsedGroups, setExpandedItems]);
}
