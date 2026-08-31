import AsyncErrorState from '../AsyncErrorState';
import LoadingSkeleton from '../LoadingSkeleton';
import { getFnGuideFacetScale } from '../../utils/fnguide';

export function DateChips({ dates, selectedDate, loading, error, onSelect, onScroll, chipsRef, retry }) {
  return <div className="date-chips-control"><button type="button" className="date-scroll-btn previous" onClick={() => onScroll(-1)} aria-label="이전 날짜 보기">‹</button><div className="date-chips-scroll" ref={chipsRef}>{error && !dates.length ? <AsyncErrorState message="FnGuide 날짜를 불러오지 못했습니다." onRetry={retry} /> : loading && !dates.length ? <LoadingSkeleton variant="chips" label="FnGuide 날짜 불러오는 중" /> : <><button type="button" data-date-chip="all" onClick={() => onSelect('')} className={`date-chip ${!selectedDate ? 'active' : ''}`}>전체</button>{dates.map((date) => <button type="button" key={date.report_date} data-date-chip={date.report_date} onClick={() => onSelect(date.report_date)} className={`date-chip ${selectedDate === date.report_date ? 'active' : ''}`}>📅 {date.report_date} <span className="chip-count">({date.report_count})</span></button>)}</>}</div><button type="button" className="date-scroll-btn next" onClick={() => onScroll(1)} aria-label="다음 날짜 보기">›</button></div>;
}

export function Facets({ facets, facetType, selectedFacet, maxCount, onType, onValue, onReset }) {
  const active = facets[facetType] || [];
  return <section className="fnguide-facet-panel" aria-label="현재 일자 레포트 필터"><div className="fnguide-facet-header"><div className="fnguide-facet-tabs" role="tablist" aria-label="태그 분류">{[['company', '종목'], ['provider', '증권사'], ['author', '작성자']].map(([type, label]) => <button key={type} type="button" role="tab" aria-selected={facetType === type} className={`fnguide-facet-tab ${facetType === type ? 'active' : ''}`} onClick={() => onType(type)}>{label}</button>)}</div>{selectedFacet && <button type="button" className="fnguide-facet-reset" onClick={onReset}>필터 해제</button>}</div><div className="fnguide-facet-cloud">{active.map((facet) => <button key={facet.label} type="button" className={`fnguide-facet-tag ${selectedFacet?.type === facetType && selectedFacet.value === facet.label ? 'active' : ''}`} style={{ '--facet-scale': getFnGuideFacetScale(facet.count, maxCount) }} onClick={() => onValue(facet.label)}><span>{facet.label}</span><small>{facet.count}</small></button>)}</div></section>;
}
