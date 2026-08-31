import { useCallback, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

export function useSearchFilters() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState(() => searchParams.get('q') || '');
  const [debouncedQuery, setDebouncedQuery] = useState(() => searchParams.get('q') || '');
  const [category, setCategory] = useState(() => searchParams.get('category') || 'title');
  const [selectedCompany, setSelectedCompany] = useState(() => searchParams.get('company') || '');
  const [selectedBoard, setSelectedBoard] = useState(() => searchParams.get('board') || '');
  const [selectedRoute, setSelectedRoute] = useState(() => searchParams.get('route') || 'recent');
  const [selectedSort, setSelectedSort] = useState(() => searchParams.get('sort') || 'time');

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedQuery(searchTerm), 300);
    return () => window.clearTimeout(timer);
  }, [searchTerm]);

  useEffect(() => {
    const params = new URLSearchParams();
    const query = debouncedQuery.trim();
    if (query) params.set('q', query);
    if (category !== 'title') params.set('category', category);
    if (selectedCompany) params.set('company', selectedCompany);
    if (selectedBoard) params.set('board', selectedBoard);
    if (selectedRoute !== 'recent') params.set('route', selectedRoute);
    if (selectedSort !== 'time') params.set('sort', selectedSort);
    setSearchParams(params, { replace: true });
  }, [category, debouncedQuery, selectedBoard, selectedCompany, selectedRoute, selectedSort, setSearchParams]);

  useEffect(() => {
    if (!selectedCompany) setSelectedBoard('');
  }, [selectedCompany]);

  const searchQuery = useMemo(() => {
    const query = debouncedQuery.trim();
    const companyOnly = !query && selectedCompany;
    return { query: companyOnly ? selectedCompany : query, category: companyOnly ? 'company' : (query ? category : ''), companyOrder: selectedCompany || null, board: selectedBoard ? Number(selectedBoard) : null };
  }, [category, debouncedQuery, selectedBoard, selectedCompany]);

  const handleCompanyChange = useCallback((event) => {
    setSelectedCompany(event.target.value);
    setSelectedBoard('');
  }, []);

  const resetFilters = useCallback(() => {
    setSearchTerm('');
    setCategory('title');
    setSelectedCompany('');
    setSelectedBoard('');
    setSelectedRoute('recent');
    setSelectedSort('time');
  }, []);

  return { searchTerm, setSearchTerm, category, setCategory, selectedCompany, selectedBoard, setSelectedBoard, selectedRoute, setSelectedRoute, selectedSort, setSelectedSort, searchQuery, handleCompanyChange, resetFilters };
}
