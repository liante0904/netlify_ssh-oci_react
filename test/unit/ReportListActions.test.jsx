import React from 'react';
import { renderHook, act } from '@testing-library/react';
import { MemoryRouter, useLocation, useNavigate } from 'react-router-dom';
import { useReportListActions } from '../../src/hooks/useReportListActions';

function LocationProbe({ onChange, onReady }) {
  const location = useLocation();
  const navigate = useNavigate();
  React.useEffect(() => onReady({ back: () => navigate(-1) }), [navigate, onReady]);
  React.useEffect(() => onChange(`${location.pathname}${location.search}`), [location, onChange]);
  return null;
}

describe('useReportListActions tag navigation', () => {
  test('pushes one tagged recent URL so back returns to plain recent', () => {
    const handleSearch = jest.fn();
    const setShare = jest.fn();
    const locations = [];
    const history = { current: null };
    const onLocation = (value) => { locations.push(value); };
    const onReady = (value) => { history.current = value; };
    const wrapper = ({ children }) => <MemoryRouter initialEntries={['/recent']}><LocationProbe onChange={onLocation} onReady={onReady} />{children}</MemoryRouter>;
    const { result } = renderHook(() => useReportListActions({ setShare, handleSearch }), { wrapper });

    act(() => result.current.handleTagClick('반도체', true));

    expect(handleSearch).toHaveBeenCalledWith(expect.objectContaining({ query: '반도체', category: 'sector' }));
    expect(locations.at(-1)).toBe('/recent?q=%EB%B0%98%EB%8F%84%EC%B2%B4&category=sector');
    act(() => history.current.back());
    expect(locations.at(-1)).toBe('/recent');
  });
});
