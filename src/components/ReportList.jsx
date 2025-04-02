import { useEffect, useState, useRef } from 'react';

function ReportList({ searchQuery }) {
  const [reports, setReports] = useState({});
  const [loading, setLoading] = useState(false);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [isFetching, setIsFetching] = useState(false);
  const abortControllerRef = useRef(null); // useRef로 변경

  const BASE_URL = import.meta.env.VITE_ORACLE_REST_API;
  const TABLE_NAME = import.meta.env.VITE_TABLE_NAME;

  const getApiUrl = () => {
    const endpoint = `${TABLE_NAME}/search/`;
    const params = new URLSearchParams();
    if (window.location.pathname.includes('global')) {
      params.append('mkt_tp', 'global');
    }
    params.append('offset', offset);
    if (searchQuery) {
      params.append(searchQuery.category, searchQuery.query); // 카테고리와 쿼리 추가
    }
    return `${BASE_URL}/${endpoint}?${params.toString()}`;
  };

  const fetchReports = async () => {
    if (!hasMore || isFetching) return;

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    const controller = new AbortController();
    abortControllerRef.current = controller;

    setIsFetching(true);
    setLoading(true);

    try {
      const response = await fetch(getApiUrl(), { signal: controller.signal });
      if (!response.ok) throw new Error('API 요청 실패');

      const { items, hasMore: apiHasMore } = await response.json();

      const groupedData = items.reduce((acc, item) => {
        const date = item.save_time.split('T')[0];
        if (!acc[date]) acc[date] = {};
        if (!acc[date][item.firm_nm]) acc[date][item.firm_nm] = [];
        acc[date][item.firm_nm].push({
          id: item.report_id,
          title: item.article_title,
          writer: item.writer,
          link: item.telegram_url || item.download_url || item.attach_url,
        });
        return acc;
      }, {});

      setReports((prev) => (searchQuery && offset === 0 ? groupedData : { ...prev, ...groupedData }));
      setHasMore(apiHasMore);
      setOffset((prev) => prev + items.length);
    } catch (error) {
      if (error.name === 'AbortError') {
        console.log('🔄 이전 요청 취소됨');
      } else {
        console.error('❌ Error fetching reports:', error);
      }
    } finally {
      setIsFetching(false);
      setLoading(false);
    }
  };

  useEffect(() => {
    setReports({}); // 검색 쿼리 변경 시 기존 데이터 초기화
    setOffset(0); // 오프셋 초기화
    setHasMore(true); // 더 불러올 데이터 초기화
    fetchReports();
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [searchQuery]);

  useEffect(() => {
    const handleScroll = () => {
      if (
        window.innerHeight + window.scrollY >= document.body.offsetHeight - 500 &&
        !isFetching &&
        hasMore
      ) {
        fetchReports();
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isFetching, hasMore]);

  return (
    <>
      {loading && <div className="loading">로딩 중...</div>}
      <div className="container" id="report-container">
        {Object.entries(reports)
          .sort(([a], [b]) => new Date(b) - new Date(a))
          .map(([date, firms]) => (
            <div className="date-group" key={date}>
              <div className="date-title">{date}</div>
              {Object.entries(firms).map(([firm, firmReports]) => (
                <div className="company-group" key={firm}>
                  <div className="company-title">{firm}</div>
                  {firmReports.map((report) => (
                    <div className="report" key={report.id}>
                      <a href={report.link} target="_blank" rel="noopener noreferrer">
                        {report.title}
                      </a>
                      <p>작성자: {report.writer}</p>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          ))}
      </div>
    </>
  );
}

export default ReportList;