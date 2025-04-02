import { useEffect, useState } from 'react';

function ReportList({ searchQuery }) {
  const [reports, setReports] = useState({});
  const [loading, setLoading] = useState(false);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [isFetching, setIsFetching] = useState(false);

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
      params.append(searchQuery.category, searchQuery.query);
    }
    return `${BASE_URL}/${endpoint}?${params.toString()}`;
  };

  const fetchReports = async () => {
    if (!hasMore || isFetching) return;

    setIsFetching(true);
    setLoading(true);

    try {
      const response = await fetch(getApiUrl());
      if (!response.ok) throw new Error('API 요청 실패');

      const { items, hasMore: apiHasMore } = await response.json();

      // 데이터를 날짜별로 그룹화
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

      // 기존 데이터와 새 데이터를 병합
      setReports((prev) => {
        const merged = JSON.parse(JSON.stringify(prev)); // 깊은 복사
        Object.entries(groupedData).forEach(([date, firms]) => {
          if (!merged[date]) {
            merged[date] = firms;
          } else {
            Object.entries(firms).forEach(([firm, reports]) => {
              merged[date][firm] = [...(merged[date][firm] || []), ...reports];
            });
          }
        });
        return merged;
      });

      setHasMore(apiHasMore);
      setOffset((prev) => prev + items.length);
    } catch (error) {
      console.error('❌ Error fetching reports:', error);
    } finally {
      setIsFetching(false);
      setLoading(false);
    }
  };

  useEffect(() => {
    // 검색 쿼리가 변경되면 초기화
    setReports({});
    setOffset(0);
    setHasMore(true);
    fetchReports();
  }, [searchQuery]);

  useEffect(() => {
    // 스크롤 이벤트 핸들러
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const triggerPoint = document.body.scrollHeight * 0.3;

      if (scrollY >= triggerPoint && !isFetching && hasMore) {
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
