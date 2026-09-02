import React from 'react';
import { useSearchParams } from 'react-router-dom';
import FnGuideListContent from './fnguide/FnGuideListContent';
import { useFnGuideListState } from '../hooks/useFnGuideListState';
import './FnGuideList.css';

function FnGuideList() {
  const [searchParams, setSearchParams] = useSearchParams();
  const state = useFnGuideListState(searchParams, setSearchParams);
  const { selectedDate, searchQuery, providerFilter, dates, datesQuery, selectedSummaryId, chipsRef, facets, facetType, selectedFacet, filteredSummaries, groups, visibleSummaries, expandedItems, collapsedGroups, summariesQuery, isLoading, setSelectedDate, setSearchQuery, setProviderFilter, setFacetType, setSelectedFacet, setExpandedItems, setCollapsedGroups, onSubmitSearch, onScrollDates, onFacetValue } = state;
  return <FnGuideListContent selectedDate={selectedDate} searchQuery={searchQuery} providerFilter={providerFilter} dates={dates} datesLoading={datesQuery.isPending} datesError={datesQuery.isError} onRetryDates={datesQuery.refetch} onDateSelect={(date) => { setSelectedDate(date); setSelectedFacet(null); }} onScrollDates={onScrollDates} chipsRef={chipsRef} facets={facets} facetType={facetType} selectedFacet={selectedFacet} onFacetType={(type) => { setFacetType(type); setSelectedFacet(null); }} onFacetValue={onFacetValue} onFacetReset={() => setSelectedFacet(null)} filteredSummaries={filteredSummaries} groups={groups} visibleSummaries={visibleSummaries} selectedSummaryId={selectedSummaryId} expandedItems={expandedItems} collapsedGroups={collapsedGroups} onNavigate={(id) => { const next = new URLSearchParams(searchParams); next.set('summary_id', String(id)); setSearchParams(next); }} onToggleExpand={(id) => setExpandedItems((current) => ({ ...current, [id]: !current[id] }))} onToggleGroup={(key) => setCollapsedGroups((current) => ({ ...current, [key]: !current[key] }))} summariesError={summariesQuery.isError} isLoading={isLoading} hasMore={Boolean(summariesQuery.hasNextPage)} onLoadMore={() => summariesQuery.fetchNextPage()} onSubmitSearch={onSubmitSearch} onSearchChange={(event) => setSearchQuery(event.target.value)} onProviderChange={(event) => { setProviderFilter(event.target.value); setSelectedFacet(null); }} />;
}

export default FnGuideList;
