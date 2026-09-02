import { useCallback } from 'react';

export function useFnGuideListActions({ setSelectedFacet, facetType, datesQuery, summariesQuery, chipsRef }) {
  const onSubmitSearch = (event) => {
    event.preventDefault();
    setSelectedFacet(null);
    datesQuery.refetch();
    summariesQuery.refetch();
  };
  const onScrollDates = (direction) => chipsRef.current?.scrollBy({ left: direction * (chipsRef.current.clientWidth * 0.75), behavior: 'smooth' });
  const onFacetValue = useCallback((value) => setSelectedFacet((current) => current?.type === facetType && current.value === value ? null : { type: facetType, value }), [facetType, setSelectedFacet]);
  return { onSubmitSearch, onScrollDates, onFacetValue };
}
