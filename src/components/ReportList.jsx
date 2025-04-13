import { useEffect, useState, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import InfiniteScroll from 'react-infinite-scroll-component';

function ReportList({ searchQuery }) {
  const location = useLocation();
  const [reports, setReports] = useState({});
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  const BASE_URL = import.meta.env.VITE_ORACLE_REST_API;
  const TABLE_NAME = import.meta.env.VITE_TABLE_NAME;

  const buildApiUrl = useCallback(() => {
    const params = new URLSearchParams();
    if (location.pathname.includes('global')) {
      params.append('mkt_tp', 'global');
    }
    params.append('offset', offset);
    if (searchQuery) {
      params.append(searchQuery.category, searchQuery.query);
    }
    return `${BASE_URL}/${TABLE_NAME}/search/?${params.toString()}`;
  }, [offset, searchQuery, location.pathname]);

  const mergeReports = useCallback((prev, newItems) => {
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

      if (!updated[date]) updated[date] = {};
      if (!updated[date][firm]) updated[date][firm] = [];

      const exists = updated[date][firm].some((r) => r.id === report.id);
      if (!exists) updated[date][firm].push(report);
    }

    return updated;
  }, []);

  const fetchReports = useCallback(async () => {
    if (!hasMore) return;
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

  // ✅ URL 변경(탭 전환)시 데이터 초기화
  useEffect(() => {
    setReports({});
    setOffset(0);
    setHasMore(true);
  }, [searchQuery, location.pathname]);  // ⬅ 여기서 pathname 감지 추가

  // 최초 로딩 또는 초기화 후 offset이 0일 때 API 호출
  useEffect(() => {
    if (offset === 0) {
      fetchReports();
    }
  }, [offset]);

  const sortedDates = Object.keys(reports).sort((a, b) => new Date(b) - new Date(a));

  return (
    <div className="report-list-wrapper">
      <div className="container" id="report-container">
        {offset === 0 && isLoading ? (
          <div className="loading-overlay">로딩 중...</div>
        ) : sortedDates.length === 0 ? null : (
          <InfiniteScroll
            dataLength={offset}
            next={fetchReports}
            hasMore={hasMore}
            loader={<div className="loading-overlay">로딩 중...</div>}
            scrollThreshold={0.6}
          >
            {sortedDates.map((date) => (
              <div className="date-group" key={date}>
                <div className="date-title">{date}</div>
                {Object.entries(reports[date]).map(([firm, firmReports]) => (
                  <div className="company-group" key={firm}>
                    <div className="company-title">{firm}</div>
                    {firmReports.map(({ id, title, writer, link }) => (
                      <div className="report" key={id}>
                        <a href={link} target="_blank" rel="noopener noreferrer">
                          {title}
                        </a>
                        <p>작성자: {writer}</p>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            ))}
          </InfiniteScroll>
        )}
      </div>
    </div>
  );
}

export default ReportList;