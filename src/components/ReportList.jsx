import { useEffect, useState, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import InfiniteScroll from 'react-infinite-scroll-component';
import ShareMenu from './ShareMenu';
import './ReportList.css'; // Assuming you have a CSS file for styles

function ReportList({ searchQuery }) {
  const location = useLocation();
  const [reports, setReports] = useState({});
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [dateToggles, setDateToggles] = useState({});
  const [firmToggles, setFirmToggles] = useState({});
  
  // 공유 메뉴 상태
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 });

  const BASE_URL = import.meta.env.VITE_ORACLE_REST_API;
  const TABLE_NAME = import.meta.env.VITE_TABLE_NAME;

  const buildApiUrl = useCallback(() => {
    const params = new URLSearchParams();
    let apiUrl = `${BASE_URL}/${TABLE_NAME}`;

    // pathname에 따라 URL 구조 다르게
    if (location.pathname.includes('global')) {
      apiUrl += '/search/';
      params.append('mkt_tp', 'global');
    } else if (location.pathname.includes('industry')) {
      apiUrl += '/industry';
      // industry는 search 제거
    } else {
      apiUrl += '/search/';
    }

    // 공통 파라미터
    params.append('offset', offset);

    if (searchQuery.query && searchQuery.category) {
      params.append(searchQuery.category, searchQuery.query);
    }

    return `${apiUrl}?${params.toString()}`;
  }, [offset, searchQuery, location.pathname, BASE_URL, TABLE_NAME]);

  const mergeReports = useCallback((prev, newItems) => {
    // 1. 전체 상태 깊은 복사 (날짜별 객체까지)
    const updated = { ...prev };

    for (const item of newItems) {
      const date = item.save_time.split('T')[0];
      const firm = item.firm_nm;
      const report = {
        id: item.report_id,
        title: item.article_title,
        writer: item.writer,
        link: item.telegram_url || item.download_url || item.attach_url,
      };

      // 2. 해당 날짜 객체 복사
      if (!updated[date]) {
        updated[date] = {};
      } else {
        updated[date] = { ...updated[date] };
      }

      // 3. 해당 증권사 배열 복사
      if (!updated[date][firm]) {
        updated[date][firm] = [];
      } else {
        updated[date][firm] = [...updated[date][firm]];
      }

      const exists = updated[date][firm].some((r) => r.id === report.id);
      if (!exists) {
        updated[date][firm].push(report);
      }
    }

    return updated;
  }, []);

  const fetchReports = useCallback(async (reset = false) => {
    if (!hasMore && !reset) return;

    setIsLoading(true);

    try {
      const res = await fetch(buildApiUrl());
      if (!res.ok) throw new Error('API 요청 실패');

      const { items, hasMore: apiHasMore } = await res.json();

      setReports((prev) => mergeReports(prev, items));
      setOffset((prev) => prev + items.length);
      setHasMore(apiHasMore);
    } catch (err) {
      console.error('❌ Error fetching reports:', err);
    } finally {
      setIsLoading(false);
    }
  }, [hasMore, buildApiUrl, mergeReports]);

  useEffect(() => {
    window.scrollTo(0, 0);
    setReports({});
    setOffset(0);
    setHasMore(true);
    setDateToggles({});
    setFirmToggles({});
  }, [searchQuery, location.pathname]);

  useEffect(() => {
    if (offset === 0 && !isLoading) {
      fetchReports();
    }
  }, [offset, isLoading, fetchReports]);

  useEffect(() => {
    const reportDates = Object.keys(reports);
    if (reportDates.length === 0) return;

    const allCollapsed = reportDates.every(date => dateToggles[date] === true);

    if (allCollapsed) {
      if (hasMore && !isLoading) {
        fetchReports();
      }
    }
  }, [dateToggles, reports, hasMore, isLoading, fetchReports]);

  const toggleDate = (date) => {
    setDateToggles(prev => ({ ...prev, [date]: !prev[date] }));
  };

  const toggleFirm = (date, firm) => {
    setFirmToggles(prev => ({
      ...prev,
      [date]: {
        ...prev[date],
        [firm]: !prev[date]?.[firm]
      }
    }));
  };

  const sortedDates = Object.keys(reports).sort((a, b) => new Date(b) - new Date(a));

  const isSearchActive = !!(searchQuery.query || searchQuery.category === 'company');

  return (
    <div className="report-list-wrapper">
      <div className="container" id="report-container">
        {offset === 0 && isLoading ? (
          <div className={`loading-overlay ${isSearchActive ? 'search-loading' : ''}`}>로딩 중...</div>
        ) : sortedDates.length === 0 ? null : (
          <InfiniteScroll
            dataLength={offset}
            next={fetchReports}
            hasMore={hasMore}
            scrollThreshold={0.6}
          >
            {sortedDates.map((date) => (
              <div className="date-group" key={date}>
                <div className={`date-title ${!dateToggles[date] ? 'expanded' : ''}`} onClick={() => toggleDate(date)}>
                  {date}
                </div>
                <div className={`company-group-wrapper ${dateToggles[date] ? 'collapsed' : ''}`}>
                  {Object.entries(reports[date]).map(([firm, firmReports]) => (
                    <div className="company-group" key={firm}>
                      <div className={`company-title ${!firmToggles[date]?.[firm] ? 'expanded' : ''}`} onClick={() => toggleFirm(date, firm)}>
                        {firm}
                      </div>
                      <div className={`report-wrapper ${firmToggles[date]?.[firm] ? 'collapsed' : ''}`}>
                        {firmReports.map(({ id, title, writer, link }) => {
                          // DS투자증권 등 레퍼러 체크 도메인 처리
                          const isDsSec = link && link.includes('ds-sec.co.kr');
                          const fileName = `[${firm}] ${title}.pdf`;
                          const finalLink = isDsSec 
                            ? `${window.location.origin}/share-proxy/report.pdf?url=${encodeURIComponent(link)}&filename=${encodeURIComponent(fileName)}`
                            : link;
                          
                          return (
                            <div className="report" key={id}>
                              <div className="report-content">
                                <a href={finalLink} target="_blank" rel="noopener noreferrer">
                                  {title}
                                </a>
                                <p>작성자: {writer}</p>
                              </div>
                              <button 
                                className="share-button" 
                                onClick={(e) => {
                                  const rect = e.currentTarget.getBoundingClientRect();
                                  const shareUrl = `${window.location.origin}/share?id=${id}`;
                                  
                                  setMenuPosition({ 
                                    top: rect.bottom, 
                                    left: rect.left + rect.width / 2 
                                  });
                                  setSelectedReport({ title, firm, shareUrl, writer });
                                  setIsShareOpen(true);
                                }}
                                title="공유하기"
                              >
                                <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                                  <path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92 1.61 0 2.92-1.31 2.92-2.92s-1.31-2.92-2.92-2.92z"/>
                                </svg>
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </InfiniteScroll>
        )}
        {isLoading && hasMore && <div className={`loading-overlay ${isSearchActive ? 'search-loading' : ''}`}>로딩 중...</div>}
      </div>

      <ShareMenu 
        isOpen={isShareOpen} 
        onClose={() => setIsShareOpen(false)} 
        reportData={selectedReport}
        position={menuPosition}
      />
    </div>
  );
}

export default ReportList;
