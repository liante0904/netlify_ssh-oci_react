import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { CONFIG } from '../constants/config';
import { request } from '../utils/api';
import { buildFnGuideFacets, groupFnGuideSummaries, matchesFnGuideFacet } from '../utils/fnguide';

const LIMIT = 100;

export function useFnGuideListState(searchParams, setSearchParams) {
  const selectedSummaryId = searchParams.get('summary_id');
  const chipsRef = useRef(null);
  const scrolledId = useRef(null);
  const [selectedDate, setSelectedDate] = useState(() => searchParams.get('date') || null);
  const [searchQuery, setSearchQuery] = useState(() => searchParams.get('q') || '');
  const [providerFilter, setProviderFilter] = useState(() => searchParams.get('provider') || '');
  const [facetType, setFacetType] = useState(() => searchParams.get('facet') || 'company');
  const [selectedFacet, setSelectedFacet] = useState(() => { const type = searchParams.get('facet'); const value = searchParams.get('facet_value'); return type && value ? { type, value } : null; });
  const [expandedItems, setExpandedItems] = useState({});
  const [collapsedGroups, setCollapsedGroups] = useState({});
  const datesQuery = useQuery({ queryKey: ['fnguide', 'report-dates', { searchQuery, providerFilter }], queryFn: async ({ signal }) => { const params = new URLSearchParams(); if (searchQuery) params.set('q', searchQuery); if (providerFilter) params.set('provider', providerFilter); return (await request(`${CONFIG.API.BASE_URL}/api/fnguide/report-dates?${params}`, { skipAuth: false, signal })) || []; }, staleTime: 60000 });
  const dates = useMemo(() => datesQuery.data || [], [datesQuery.data]);
  const summariesQuery = useInfiniteQuery({ queryKey: ['fnguide', 'report-summaries', { searchQuery, providerFilter, selectedDate }], queryFn: async ({ pageParam = 0, signal }) => { const params = new URLSearchParams({ limit: String(LIMIT), offset: String(pageParam) }); if (searchQuery) params.set('q', searchQuery); if (providerFilter) params.set('provider', providerFilter); if (selectedDate) params.set('report_date', selectedDate); return (await request(`${CONFIG.API.BASE_URL}/api/fnguide/report-summaries?${params}`, { skipAuth: false, signal })) || []; }, initialPageParam: 0, getNextPageParam: (last, all, offset) => last.length === LIMIT ? offset + last.length : undefined, enabled: selectedDate !== null, staleTime: 60000 });
  const summaries = useMemo(() => summariesQuery.data?.pages.flat() || [], [summariesQuery.data]);
  const filteredSummaries = useMemo(() => summaries.filter((item) => matchesFnGuideFacet(item, selectedFacet)), [summaries, selectedFacet]);
  const facets = useMemo(() => buildFnGuideFacets(summaries), [summaries]);
  const groups = useMemo(() => groupFnGuideSummaries(filteredSummaries), [filteredSummaries]);
  const visibleSummaries = useMemo(() => groups.flatMap((group) => [...group.repeated.flatMap((company) => company.items), ...group.singles.flatMap((company) => company.items)]), [groups]);
  const isLoading = summariesQuery.isPending || summariesQuery.isFetchingNextPage;
  useEffect(() => { setSelectedDate((current) => current && dates.some((item) => item.report_date === current) ? current : dates[0]?.report_date || ''); }, [dates]);
  useEffect(() => { const next = new URLSearchParams(); if (selectedSummaryId) next.set('summary_id', selectedSummaryId); [['q', searchQuery], ['provider', providerFilter], ['date', selectedDate]].forEach(([key, value]) => value ? next.set(key, value) : next.delete(key)); if (selectedFacet) { next.set('facet', selectedFacet.type); next.set('facet_value', selectedFacet.value); } setSearchParams(next, { replace: true }); }, [providerFilter, searchQuery, selectedDate, selectedFacet, selectedSummaryId, setSearchParams]);
  useEffect(() => { if (!selectedDate || !chipsRef.current) return; chipsRef.current.querySelector(`[data-date-chip="${selectedDate}"]`)?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' }); }, [dates, selectedDate]);
  useEffect(() => { if (!selectedSummaryId || scrolledId.current === selectedSummaryId) return; const item = summaries.find((summary) => String(summary.summary_id) === selectedSummaryId); if (!item) return; const key = `${item.report_date}-${item.company_code || item.company_name || `summary-${item.summary_id}`}`; setCollapsedGroups((current) => ({ ...current, [key]: false })); setExpandedItems((current) => ({ ...current, [item.summary_id]: true })); scrolledId.current = selectedSummaryId; const timeout = window.setTimeout(() => document.getElementById(`fnguide-summary-${selectedSummaryId}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 80); return () => window.clearTimeout(timeout); }, [selectedSummaryId, summaries]);
  const onSubmitSearch = (event) => { event.preventDefault(); setSelectedFacet(null); datesQuery.refetch(); summariesQuery.refetch(); };
  const onScrollDates = (direction) => chipsRef.current?.scrollBy({ left: direction * (chipsRef.current.clientWidth * 0.75), behavior: 'smooth' });
  const onFacetValue = useCallback((value) => setSelectedFacet((current) => current?.type === facetType && current.value === value ? null : { type: facetType, value }), [facetType]);
  return { selectedDate, searchQuery, providerFilter, dates, datesQuery, selectedSummaryId, chipsRef, facets, facetType, selectedFacet, filteredSummaries, groups, visibleSummaries, expandedItems, collapsedGroups, summariesQuery, isLoading, setSelectedDate, setSearchQuery, setProviderFilter, setFacetType, setSelectedFacet, setExpandedItems, setCollapsedGroups, onSubmitSearch, onScrollDates, onFacetValue };
}
