import { useMemo, useRef, useState } from 'react';
import { buildFnGuideFacets, groupFnGuideSummaries, matchesFnGuideFacet } from '../utils/fnguide';
import { useFnGuideQueries } from './useFnGuideQueries';
import { useFnGuideListEffects } from './useFnGuideListEffects';
import { useFnGuideListActions } from './useFnGuideListActions';

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
  const { datesQuery, dates, summariesQuery, summaries } = useFnGuideQueries({ searchQuery, providerFilter, selectedDate });
  const filteredSummaries = useMemo(() => summaries.filter((item) => matchesFnGuideFacet(item, selectedFacet)), [summaries, selectedFacet]);
  const facets = useMemo(() => buildFnGuideFacets(summaries), [summaries]);
  const groups = useMemo(() => groupFnGuideSummaries(filteredSummaries), [filteredSummaries]);
  const visibleSummaries = useMemo(() => groups.flatMap((group) => [...group.repeated.flatMap((company) => company.items), ...group.singles.flatMap((company) => company.items)]), [groups]);
  const isLoading = summariesQuery.isPending || summariesQuery.isFetchingNextPage;
  useFnGuideListEffects({ selectedSummaryId, dates, selectedDate, setSelectedDate, searchQuery, providerFilter, selectedFacet, setSearchParams, chipsRef, scrolledId, summaries, setCollapsedGroups, setExpandedItems });
  const { onSubmitSearch, onScrollDates, onFacetValue } = useFnGuideListActions({ setSelectedFacet, facetType, datesQuery, summariesQuery, chipsRef });
  return { selectedDate, searchQuery, providerFilter, dates, datesQuery, selectedSummaryId, chipsRef, facets, facetType, selectedFacet, filteredSummaries, groups, visibleSummaries, expandedItems, collapsedGroups, summariesQuery, isLoading, setSelectedDate, setSearchQuery, setProviderFilter, setFacetType, setSelectedFacet, setExpandedItems, setCollapsedGroups, onSubmitSearch, onScrollDates, onFacetValue };
}
