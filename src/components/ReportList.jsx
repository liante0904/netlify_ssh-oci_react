import { useEffect, useState, useRef } from 'react';

function ReportList({ searchQuery }) {
  const [reports, setReports] = useState({});
  const [loading, setLoading] = useState(false);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [isFetching, setIsFetching] = useState(false);
  const scrollPositionRef = useRef(0);

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
  
    scrollPositionRef.current = window.scrollY;
    console.log('스크롤 위치 저장:', scrollPositionRef.current);
  
    setIsFetching(true);
    setLoading(true); // 로딩 시작
    console.log('로딩 시작: loading = true');
  
    try {
      const response = await fetch(getApiUrl());
      if (!response.ok) throw new Error('API 요청 실패');
  
      const { items, hasMore: apiHasMore } = await response.json();
  
      const groupedData = items.reduce((acc, item) => {
        const date = item.save_time.split('T')[0];
        if (!acc[date]) acc[date] = {};
        if (!acc[date][item.firm_nm]) acc[date][item.firm_nm] = [];
  
        const exists = acc[date][item.firm_nm].some(
          (report) => report.id === item.report_id
        );
        if (!exists) {
          acc[date][item.firm_nm].push({
            id: item.report_id,
            title: item.article_title,
            writer: item.writer,
            link: item.telegram_url || item.download_url || item.attach_url,
          });
        }
        return acc;
      }, {});
  
      setReports((prev) => {
        const merged = JSON.parse(JSON.stringify(prev));
        Object.entries(groupedData).forEach(([date, firms]) => {
          if (!merged[date]) {
            merged[date] = firms;
          } else {
            Object.entries(firms).forEach(([firm, newReports]) => {
              if (!merged[date][firm]) {
                merged[date][firm] = newReports;
              } else {
                const existingReports = merged[date][firm];
                newReports.forEach((newReport) => {
                  if (!existingReports.some((r) => r.id === newReport.id)) {
                    existingReports.push(newReport);
                  }
                });
              }
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
      console.log('isFetching 종료');
      setLoading(false); // 로딩 종료
      console.log('로딩 종료: loading = false');
    }
  };
  

  useEffect(() => {
    setReports({});
    setOffset(0);
    setHasMore(true);
    fetchReports();
  }, [searchQuery]);

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const triggerPoint = document.body.scrollHeight * 0.6;

      if (scrollY >= triggerPoint && !isFetching && hasMore) {
        fetchReports();
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isFetching, hasMore]);

  useEffect(() => {
    if (!loading && Object.keys(reports).length > 0) {
      requestAnimationFrame(() => {
        window.scrollTo(0, scrollPositionRef.current);
        console.log('스크롤 위치 복원:', scrollPositionRef.current);
      });
    }
  }, [reports, loading]);

  return (
    <div className="report-list-wrapper">
      <div className="container" id="report-container">
        {Object.entries(reports).length === 0 && !loading ? (
          <div className="no-data">데이터가 없습니다.</div>
        ) : (
          Object.entries(reports)
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
            ))
        )}
      </div>
      {loading && <div className="loading-overlay">로딩 중...</div>}
    </div>
  );
}

export default ReportList;