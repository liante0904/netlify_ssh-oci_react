import { useCallback, useState } from 'react';
import { createEmptySearchSelection, normalizeSearchSelection } from '../utils/searchSelection';

export function useReportSearchState() {
  const [activeSearch, setActiveSearch] = useState(createEmptySearchSelection());
  const [stagedSearch, setStagedSearch] = useState(createEmptySearchSelection());
  const handleSearch = useCallback(({ query, category, board = null, companyOrder = null }) => {
    const nextSearch = normalizeSearchSelection({ query, category, board, companyOrder });
    setActiveSearch((previous) => previous.query === nextSearch.query && previous.category === nextSearch.category && previous.board === nextSearch.board && previous.companyOrder === nextSearch.companyOrder ? previous : nextSearch);
  }, []);
  return { activeSearch, setActiveSearch, stagedSearch, setStagedSearch, handleSearch };
}
