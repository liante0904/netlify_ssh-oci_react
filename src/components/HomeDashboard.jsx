import { useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQueries, useQueryClient } from '@tanstack/react-query';
import { CONFIG } from '../constants/config';
import { HOME_SECTIONS } from '../constants/reportSections';
import { request } from '../utils/api';
import { normalizeReportItem } from '../utils/reportNormalizer';
import { getDirectUrl } from '../utils/reportLinks';
import { useReport } from '../context/useReport';
import LoadingSkeleton from './LoadingSkeleton';
import './HomeDashboard.css';

const PREVIEW_LIMIT = 5;

function formatPreviewDate(rawDate) {
  if (!rawDate) return '';
  const value = String(rawDate);
  if (/^\d{8}$/.test(value)) {
    return `${value.slice(4, 6)}.${value.slice(6, 8)}`;
  }
  const match = value.match(/^(\d{4})-(\d{2})-(\d{2})/);
  return match ? `${match[2]}.${match[3]}` : value;
}

function normalizeFnGuideItem(item) {
  return {
    id: item.summary_id,
    title: item.report_title || '제목 없음',
    meta: [item.company_name, item.provider].filter(Boolean).join(' · '),
    date: formatPreviewDate(item.report_date),
  };
}

function normalizeReportPreview(item) {
  const report = normalizeReportItem(item);
  if (!report) return null;
  return {
    id: report.id,
    title: report.title,
    meta: [report.firm, report.writer].filter(Boolean).join(' · '),
    date: formatPreviewDate(report.date),
    rawReport: report,
  };
}

function HomeDashboard() {
  const navigate = useNavigate();
  const { telegramUser } = useReport();
  const isLoggedIn = !!(telegramUser && telegramUser.id && telegramUser.status === 'active');

  const requireAuth = (fallbackRoute = '/recent') => {
    if (!isLoggedIn) {
      navigate(fallbackRoute); // RequireAuth가 로그인 페이지 표시
      return false;
    }
    return true;
  };
  const queryClient = useQueryClient();
  const lastRefreshRef = useRef(0);

  const homeQueries = useQueries({
    queries: [
      {
        queryKey: ['home', 'fnguide'],
        queryFn: async ({ signal }) => {
          const data = await request(`${CONFIG.API.BASE_URL}/api/fnguide/report-summaries?limit=${PREVIEW_LIMIT}&offset=0`, { signal, logoutOn401: false });
          return Array.isArray(data) ? data.map(normalizeFnGuideItem) : [];
        },
      },
      ...['recent', 'industry', 'global'].map((key) => ({
        queryKey: ['home', key],
        queryFn: async ({ signal }) => {
          const data = await request(`${CONFIG.API.REPORT_API_URL}/${key}?limit=${PREVIEW_LIMIT}&offset=0`, { signal });
          return Array.isArray(data?.items) ? data.items.map(normalizeReportPreview).filter(Boolean) : [];
        },
      })),
    ],
  });

  const sections = useMemo(() => Object.fromEntries(
    HOME_SECTIONS.map((section, index) => {
      const query = homeQueries[index];
      return [section.key, {
        items: query.data || [],
        isLoading: query.isPending,
        error: query.isError ? `${section.title}을(를) 불러오지 못했습니다.` : '',
      }];
    }),
  ), [homeQueries]);

  // 탭 visibility 변경 감지 → 홈으로 돌아올 때 자동 갱신 (30초 throttle)
  useEffect(() => {
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        const now = Date.now();
        if (now - lastRefreshRef.current > 30000) {
          lastRefreshRef.current = now;
          queryClient.invalidateQueries({ queryKey: ['home'] });
        }
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, [queryClient]);

  return (
    <div className="home-dashboard">
      <section className="home-dashboard-header">
        <h1>리포트 홈</h1>
        <p>종목요약, 최근 레포트, 산업레포트, 글로벌 리포트를 먼저 확인하세요.</p>
      </section>

      <section className="home-section-grid" aria-label="주요 리포트 섹션">
        {HOME_SECTIONS.map((section) => (
          <article
            key={section.path}
            className={`home-section-card ${section.wide ? 'wide' : ''}`}
          >
            <div className="home-section-heading">
              <div>
                <h2>{section.title}</h2>
                <p>{section.description}</p>
              </div>
              <button type="button" onClick={() => { if (requireAuth(section.path)) navigate(section.path); }}>
                더보기
              </button>
            </div>

            <div className="home-preview-list">
              {sections[section.key].isLoading ? (
                <LoadingSkeleton rows={3} label={`${section.title} 불러오는 중`} />
              ) : sections[section.key].error ? (
                <div className="home-preview-state">{sections[section.key].error}</div>
              ) : sections[section.key].items.length === 0 ? (
                <div className="home-preview-state">표시할 항목이 없습니다.</div>
              ) : (
                sections[section.key].items.map((item) => {
                  const isFnGuide = section.key === 'fnguide';
                  if (isFnGuide) {
                    return (
                      <button
                        key={item.id}
                        type="button"
                        className="home-preview-row"
                        onClick={() => { if (requireAuth(section.path)) navigate(`${section.path}?summary_id=${item.id}`); }}
                      >
                        <span className="home-preview-main">
                          <span className="home-preview-title">{item.title}</span>
                          {item.meta && <span className="home-preview-meta">{item.meta}</span>}
                        </span>
                        {item.date && <span className="home-preview-date">{item.date}</span>}
                      </button>
                    );
                  }

                  const directUrl = getDirectUrl(item.rawReport);
                  return (
                    <button
                      key={item.id}
                      type="button"
                      className="home-preview-row"
                      onClick={() => {
                        if (requireAuth()) window.open(directUrl, '_blank', 'noopener,noreferrer');
                      }}
                    >
                      <span className="home-preview-main">
                        <span className="home-preview-title">{item.title}</span>
                        {item.meta && <span className="home-preview-meta">{item.meta}</span>}
                      </span>
                      {item.date && <span className="home-preview-date">{item.date}</span>}
                    </button>
                  );
                })
              )}
            </div>
          </article>
        ))}
      </section>

      <div className="home-secondary-actions">
        <button type="button" onClick={() => { if (requireAuth()) navigate('/recent'); }}>
          최신 레포트 전체 보기
        </button>
      </div>
    </div>
  );
}

export default HomeDashboard;
