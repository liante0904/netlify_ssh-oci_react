import { useState, useCallback, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useReport } from '../context/useReport';
import { resolveSearchOverlayState } from '../utils/searchOverlay';
import { buildSearchParams, createTextSearch, createCompanySearch, createClearedSearch, getSelectedCompanyOrder } from '../utils/searchSelection';
import { useFocusTrap } from './useFocusTrap';

export function useSearchOverlayController() {
  const { isSearchOpen, toggleSearch, handleSearch: onSearch, pendingSearch, setPendingSearch, boards, activeSearch } = useReport();
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('title');
  const [toast, setToast] = useState({ visible: false, message: '' });
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const inputRef = useRef(null);
  const overlayRef = useFocusTrap(isSearchOpen);
  const selectedCompanyOrder = category === 'company' ? getSelectedCompanyOrder(activeSearch, query) : '';
  const selectedBoard = activeSearch.category === 'company' ? activeSearch.board : null;

  useEffect(() => {
    if (!isSearchOpen) return;
    const state = resolveSearchOverlayState({ pendingSearch, searchParams });
    setQuery(state.query);
    setCategory(state.category);
    if (state.shouldSearch) {
      const next = state.category === 'company' ? createCompanySearch(state.companyOrder ?? state.query) : createTextSearch(state.query, state.category);
      onSearch(next);
      setSearchParams(buildSearchParams(next));
    }
    if (state.shouldClearPending) setPendingSearch({ query: '', category: '' });
  }, [isSearchOpen, onSearch, pendingSearch, searchParams, setPendingSearch, setSearchParams]);
  useEffect(() => { if (isSearchOpen && category !== 'company') inputRef.current?.focus(); }, [category, isSearchOpen]);

  const showToast = useCallback((message) => { setToast({ visible: true, message }); window.setTimeout(() => setToast({ visible: false, message: '' }), 2000); }, []);
  const handleSearchClick = useCallback(() => { const value = query.trim(); if (!value && category !== 'company') return showToast('검색어를 입력해주세요.'); const next = buildSearchParams({ query: value, category }); setSearchParams(next); onSearch(category === 'company' ? createCompanySearch(value) : createTextSearch(value, category)); navigate({ pathname: '/recent', search: `?${next}` }); }, [category, navigate, onSearch, query, setSearchParams, showToast]);
  const handleCategory = useCallback((event) => { const next = event.target.value; setCategory(next); setQuery(''); setSearchParams({}, { replace: true }); if (next === 'company') onSearch(createClearedSearch()); }, [onSearch, setSearchParams]);
  const handleCompany = useCallback((event) => { const value = event.target.value; setQuery(value); if (!value) { setSearchParams({}, { replace: true }); onSearch(createClearedSearch()); return; } const next = createCompanySearch(value); const params = buildSearchParams(next); setSearchParams(params, { replace: true }); onSearch(next); navigate({ pathname: '/recent', search: `?${params}` }); }, [navigate, onSearch, setSearchParams]);
  const handleBoard = useCallback((event) => { if (!selectedCompanyOrder) return; const next = { query: selectedCompanyOrder, category: 'company', companyOrder: selectedCompanyOrder, board: event.target.value ? Number(event.target.value) : null }; const params = buildSearchParams(next); setSearchParams(params, { replace: true }); onSearch(next); navigate({ pathname: '/recent', search: `?${params}` }); }, [navigate, onSearch, selectedCompanyOrder, setSearchParams]);
  return { isSearchOpen, toggleSearch, query, category, toast, boards, selectedCompanyOrder, selectedBoard, overlayRef, inputRef, setQuery, handleCategory, handleSearchClick, handleCompany, handleBoard };
}
