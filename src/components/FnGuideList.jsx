import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import { CONFIG } from '../constants/config';
import { REPORT_SECTIONS } from '../constants/reportSections';
import { request } from '../utils/api';
import {
  buildFnGuideFacets,
  getFnGuideFacetScale,
  groupFnGuideSummaries,
  matchesFnGuideFacet,
} from '../utils/fnguide';
import MenuSummary from './MenuSummary';
import AsyncErrorState from './AsyncErrorState';
import LoadingSkeleton from './LoadingSkeleton';
import './FnGuideList.css';
import FnGuideSummaryCard from './fnguide/FnGuideSummaryCard';

function FnGuideList() {
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedSummaryId = searchParams.get('summary_id');
  const scrolledSummaryIdRef = useRef(null);
  const dateChipsRef = useRef(null);
  const [selectedDate, setSelectedDate] = useState(() => searchParams.get('date') || null);
  const [searchQuery, setSearchQuery] = useState(() => searchParams.get('q') || '');
  const [providerFilter, setProviderFilter] = useState(() => searchParams.get('provider') || '');
  const [facetType, setFacetType] = useState(() => searchParams.get('facet') || 'company');
  const [selectedFacet, setSelectedFacet] = useState(() => {
    const type = searchParams.get('facet');
    const value = searchParams.get('facet_value');
    return type && value ? { type, value } : null;
  });
  
  const [expandedItems, setExpandedItems] = useState({});
  const [collapsedCompanyGroups, setCollapsedCompanyGroups] = useState({});

  const LIMIT = 100;

  // 1. 날짜별 집계 목록 조회 및 캐시
  const datesQuery = useQuery({
    queryKey: ['fnguide', 'report-dates', { searchQuery, providerFilter }],
    queryFn: async ({ signal }) => {
      const params = new URLSearchParams();
      if (searchQuery) params.append('q', searchQuery);
      if (providerFilter) params.append('provider', providerFilter);
      const url = `${CONFIG.API.BASE_URL}/api/fnguide/report-dates?${params.toString()}`;
      const data = await request(url, { skipAuth: false, signal });
      return Array.isArray(data) ? data : [];
    },
    staleTime: 60_000,
  });
  const dates = useMemo(() => datesQuery.data || [], [datesQuery.data]);
  const isLoadingDates = datesQuery.isPending;
  const fetchDates = datesQuery.refetch;

  useEffect(() => {
    setSelectedDate((currentDate) => {
      if (currentDate === '') return currentDate;
      if (currentDate && dates.some((item) => item.report_date === currentDate)) return currentDate;
      return dates[0]?.report_date || '';
    });
  }, [dates]);

  useEffect(() => {
    const nextParams = new URLSearchParams();
    if (selectedSummaryId) nextParams.set('summary_id', selectedSummaryId);
    const values = [
      ['q', searchQuery],
      ['provider', providerFilter],
      ['date', selectedDate],
    ];
    values.forEach(([key, value]) => {
      if (value) nextParams.set(key, value);
      else nextParams.delete(key);
    });

    if (selectedFacet) {
      nextParams.set('facet', selectedFacet.type);
      nextParams.set('facet_value', selectedFacet.value);
    } else {
      nextParams.delete('facet');
      nextParams.delete('facet_value');
    }
    setSearchParams(nextParams, { replace: true });
  }, [selectedSummaryId, searchQuery, providerFilter, selectedDate, selectedFacet, setSearchParams]);

  // 2. 요약본 목록 조회 및 페이지 캐시
  const summariesQuery = useInfiniteQuery({
    queryKey: ['fnguide', 'report-summaries', { searchQuery, providerFilter, selectedDate }],
    queryFn: async ({ pageParam = 0, signal }) => {
      const params = new URLSearchParams();
      if (searchQuery) params.append('q', searchQuery);
      if (providerFilter) params.append('provider', providerFilter);
      if (selectedDate) params.append('report_date', selectedDate);
      params.append('limit', LIMIT.toString());
      params.append('offset', pageParam.toString());

      const url = `${CONFIG.API.BASE_URL}/api/fnguide/report-summaries?${params.toString()}`;
      const data = await request(url, { skipAuth: false, signal });
      return Array.isArray(data) ? data : [];
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages, lastPageParam) => (
      lastPage.length === LIMIT ? lastPageParam + lastPage.length : undefined
    ),
    enabled: selectedDate !== null,
    staleTime: 60_000,
  });
  const { fetchNextPage, refetch: refetchSummaries } = summariesQuery;
  const summaries = useMemo(
    () => summariesQuery.data?.pages.flat() || [],
    [summariesQuery.data?.pages]
  );
  const isLoading = summariesQuery.isPending || summariesQuery.isFetchingNextPage;
  const hasMore = Boolean(summariesQuery.hasNextPage);
  const fetchSummaries = useCallback((isInitial = false) => (
    isInitial ? refetchSummaries() : fetchNextPage()
  ), [fetchNextPage, refetchSummaries]);

  // 검색 수동 실행 (엔터키 또는 검색 버튼 클릭)
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setSelectedFacet(null);
    fetchDates();
    fetchSummaries(true);
  };

  const handleLoadMore = () => {
    if (!isLoading && hasMore) {
      fetchSummaries(false);
    }
  };

  const toggleExpand = (id) => {
    setExpandedItems(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const toggleCompanyGroup = (groupKey) => {
    setCollapsedCompanyGroups((prev) => ({
      ...prev,
      [groupKey]: !prev[groupKey],
    }));
  };

  // 날짜 선택 칩 토글
  const handleDateClick = (dateStr) => {
    setSelectedDate(dateStr);
    setSelectedFacet(null);
  };

  const scrollDateChips = (direction) => {
    const container = dateChipsRef.current;
    if (!container) return;
    container.scrollBy({
      left: direction * container.clientWidth * 0.75,
      behavior: 'smooth',
    });
  };

  useEffect(() => {
    if (selectedDate === null) return;
    const container = dateChipsRef.current;
    const selectedChip = container?.querySelector(`[data-date-chip="${selectedDate || 'all'}"]`);
    if (!container || !selectedChip) return;

    container.scrollTo({
      left: selectedChip.offsetLeft - container.offsetLeft - 72,
      behavior: 'smooth',
    });
  }, [selectedDate, dates]);

  const facets = buildFnGuideFacets(summaries);
  const activeFacets = facets[facetType];
  const maxFacetCount = activeFacets[0]?.count || 0;
  const filteredSummaries = summaries.filter((item) => matchesFnGuideFacet(item, selectedFacet));
  const groupedSummaries = groupFnGuideSummaries(filteredSummaries);
  const visibleSummaries = groupedSummaries.flatMap((dateGroup) => [
    ...dateGroup.repeated.flatMap((companyGroup) => companyGroup.items),
    ...dateGroup.singles.flatMap((companyGroup) => companyGroup.items),
  ]);

  const handleFacetClick = (value) => {
    setSelectedFacet((current) => (
      current?.type === facetType && current.value === value
        ? null
        : { type: facetType, value }
    ));
  };

  const navigateToSummary = (summaryId) => {
    const nextParams = new URLSearchParams(searchParams);
    nextParams.set('summary_id', String(summaryId));
    setSearchParams(nextParams);
  };

  useEffect(() => {
    if (!selectedSummaryId || scrolledSummaryIdRef.current === selectedSummaryId) return;
    const selectedItem = summaries.find((item) => String(item.summary_id) === selectedSummaryId);
    if (!selectedItem) return;
    const groupKey = `${selectedItem.report_date}-${selectedItem.company_code || selectedItem.company_name || `summary-${selectedItem.summary_id}`}`;
    setCollapsedCompanyGroups((prev) => ({ ...prev, [groupKey]: false }));
    setExpandedItems((prev) => ({ ...prev, [selectedItem.summary_id]: true }));
    scrolledSummaryIdRef.current = selectedSummaryId;
    const timeoutId = window.setTimeout(() => {
      document.getElementById(`fnguide-summary-${selectedSummaryId}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 80);
    return () => window.clearTimeout(timeoutId);
  }, [selectedSummaryId, summaries]);

  return (
    <div className="fnguide-container">
      <div className="fnguide-header-panel">
        <MenuSummary
          menuName={REPORT_SECTIONS.fnguide.title}
          description={REPORT_SECTIONS.fnguide.description}
          summaryItems={[
            { label: '조회일', value: selectedDate || '전체', icon: '📅' },
            { label: '레포트', value: filteredSummaries.length, icon: '📄' },
            ...(searchQuery ? [{ label: '검색', value: searchQuery, icon: '🔍' }] : []),
            ...(providerFilter ? [{ label: '증권사', value: providerFilter, icon: '🏢' }] : []),
          ]}
        />
        
        {/* 전체 조회에서만 자유 검색을 노출한다. */}
        {!selectedDate && (
          <form className="fnguide-search-form" onSubmit={handleSearchSubmit}>
            <div className="search-input-wrapper">
              <span className="search-icon">🔍</span>
              <input
                type="text"
                placeholder="회사명, 제목, 요약 내용 검색..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="fnguide-search-input"
              />
              {searchQuery && (
                <button
                  type="button"
                  className="clear-search-btn"
                  onClick={() => { setSearchQuery(''); }}
                >
                  ✕
                </button>
              )}
            </div>

            <input
              type="text"
              placeholder="증권사 필터..."
              value={providerFilter}
              onChange={(e) => {
                setProviderFilter(e.target.value);
                setSelectedFacet(null);
              }}
              className="fnguide-provider-input"
            />

            <button type="submit" className="fnguide-search-submit">
              검색
            </button>
          </form>
        )}

        {/* 날짜 필터 가로 칩 리스트 */}
        <div className="date-chips-control">
          <button
            type="button"
            className="date-scroll-btn previous"
            onClick={() => scrollDateChips(-1)}
            aria-label="이전 날짜 보기"
          >
            ‹
          </button>
          <div className="date-chips-scroll" ref={dateChipsRef}>
            {datesQuery.isError && dates.length === 0 ? (
              <AsyncErrorState
                message="FnGuide 날짜를 불러오지 못했습니다."
                onRetry={() => datesQuery.refetch()}
              />
            ) : isLoadingDates && dates.length === 0 ? (
              <LoadingSkeleton variant="chips" label="FnGuide 날짜 불러오는 중" />
            ) : (
              <>
                <button
                  type="button"
                  data-date-chip="all"
                  onClick={() => handleDateClick('')}
                  className={`date-chip ${!selectedDate ? 'active' : ''}`}
                >
                  전체
                </button>
                {dates.map((d) => (
                  <button
                    key={d.report_date}
                    type="button"
                    data-date-chip={d.report_date}
                    onClick={() => handleDateClick(d.report_date)}
                    className={`date-chip ${selectedDate === d.report_date ? 'active' : ''}`}
                  >
                    📅 {d.report_date} <span className="chip-count">({d.report_count})</span>
                  </button>
                ))}
              </>
            )}
          </div>
          <button
            type="button"
            className="date-scroll-btn next"
            onClick={() => scrollDateChips(1)}
            aria-label="다음 날짜 보기"
          >
            ›
          </button>
        </div>

        {summaries.length > 0 && (
          <section className="fnguide-facet-panel" aria-label="현재 일자 레포트 필터">
            <div className="fnguide-facet-header">
              <div className="fnguide-facet-tabs" role="tablist" aria-label="태그 분류">
                {[
                  ['company', '종목'],
                  ['provider', '증권사'],
                  ['author', '작성자'],
                ].map(([type, label]) => (
                  <button
                    key={type}
                    type="button"
                    role="tab"
                    aria-selected={facetType === type}
                    className={`fnguide-facet-tab ${facetType === type ? 'active' : ''}`}
                    onClick={() => {
                      setFacetType(type);
                      setSelectedFacet(null);
                    }}
                  >
                    {label}
                  </button>
                ))}
              </div>
              {selectedFacet && (
                <button
                  type="button"
                  className="fnguide-facet-reset"
                  onClick={() => setSelectedFacet(null)}
                >
                  필터 해제
                </button>
              )}
            </div>
            <div className="fnguide-facet-cloud">
              {activeFacets.map((facet) => {
                const isActive = selectedFacet?.type === facetType && selectedFacet.value === facet.label;
                return (
                  <button
                    key={facet.label}
                    type="button"
                    className={`fnguide-facet-tag ${isActive ? 'active' : ''}`}
                    style={{ '--facet-scale': getFnGuideFacetScale(facet.count, maxFacetCount) }}
                    onClick={() => handleFacetClick(facet.label)}
                  >
                    <span>{facet.label}</span>
                    <small>{facet.count}</small>
                  </button>
                );
              })}
            </div>
          </section>
        )}
      </div>

      {/* 요약본 목록 */}
      <div className="fnguide-list">
        {summariesQuery.isError && summaries.length === 0 ? (
          <AsyncErrorState
            message="FnGuide 요약 레포트를 불러오지 못했습니다."
            onRetry={() => summariesQuery.refetch()}
          />
        ) : filteredSummaries.length === 0 && !isLoading ? (
          <div className="no-data-msg">
            검색 조건에 부합하는 요약 레포트가 없습니다.
          </div>
        ) : (
          groupedSummaries.map((dateGroup) => (
            <section className="fnguide-date-section" key={dateGroup.date}>
              <div className="fnguide-date-heading">
                <h2>{dateGroup.date}</h2>
                <span>{dateGroup.reportCount}건</span>
              </div>

              {dateGroup.repeated.length > 0 && (
                <div className="fnguide-repeated-area">
                  <div className="fnguide-repeated-title">집중 발간 종목</div>
                  {dateGroup.repeated.map((companyGroup) => {
                    const groupKey = `${dateGroup.date}-${companyGroup.key}`;
                    const isCollapsed = collapsedCompanyGroups[groupKey];
                    const providers = [...new Set(companyGroup.items.map((item) => item.provider).filter(Boolean))];

                    return (
                      <section className="fnguide-company-group" key={groupKey}>
                        <button
                          type="button"
                          className="fnguide-company-group-toggle"
                          onClick={() => toggleCompanyGroup(groupKey)}
                          aria-expanded={!isCollapsed}
                        >
                          <span className="company-group-main">
                            <strong>{companyGroup.companyName}</strong>
                            {companyGroup.companyCode && <small>{companyGroup.companyCode}</small>}
                          </span>
                          <span className="company-group-meta">
                            <span className="company-report-count">{companyGroup.items.length}건</span>
                            <small>{providers.join(' · ')}</small>
                            <span aria-hidden="true">{isCollapsed ? '＋' : '−'}</span>
                          </span>
                        </button>
                        {!isCollapsed && (
                          <div className="fnguide-company-reports">
                            {companyGroup.items.map((item) => (
                              <FnGuideSummaryCard
                                key={item.summary_id}
                                item={item}
                                showCompany={false}
                                isSelected={String(item.summary_id) === selectedSummaryId}
                                isExpanded={expandedItems[item.summary_id]}
                                selectedIndex={visibleSummaries.findIndex((summary) => String(summary.summary_id) === String(item.summary_id))}
                                visibleSummaries={visibleSummaries}
                                onNavigate={navigateToSummary}
                                onToggleExpand={toggleExpand}
                              />
                            ))}
                          </div>
                        )}
                      </section>
                    );
                  })}
                </div>
              )}

              {dateGroup.singles.length > 0 && (
                <div className="fnguide-single-reports">
                  {dateGroup.singles.map((companyGroup) => {
                    const item = companyGroup.items[0];
                    return (
                      <FnGuideSummaryCard
                        key={item.summary_id}
                        item={item}
                        showCompany
                        isSelected={String(item.summary_id) === selectedSummaryId}
                        isExpanded={expandedItems[item.summary_id]}
                        selectedIndex={visibleSummaries.findIndex((summary) => String(summary.summary_id) === String(item.summary_id))}
                        visibleSummaries={visibleSummaries}
                        onNavigate={navigateToSummary}
                        onToggleExpand={toggleExpand}
                      />
                    );
                  })}
                </div>
              )}
            </section>
          ))
        )}
      </div>

      {/* 로딩 표시 */}
      {isLoading && (
        <LoadingSkeleton rows={6} label="FnGuide 요약 불러오는 중" />
      )}

      {/* 더보기 버튼 */}
      {!isLoading && hasMore && summaries.length > 0 && (
        <button className="load-more-btn" onClick={handleLoadMore}>
          더보기
        </button>
      )}
    </div>
  );
}

export default FnGuideList;
