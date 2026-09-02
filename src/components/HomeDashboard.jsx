import { useNavigate } from 'react-router-dom';
import { HOME_SECTIONS } from '../constants/reportSections';
import { normalizeReportItem } from '../utils/reportNormalizer';
import { useReport } from '../context/useReport';
import { useHomeDashboardData } from '../hooks/useHomeDashboardData';
import AsyncState from './AsyncState';
import HomePreviewRow from './HomePreviewRow';
import './HomeDashboard.css';

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
  const sections = useHomeDashboardData(normalizeFnGuideItem, normalizeReportPreview);

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
              <AsyncState
                isLoading={sections[section.key].isLoading}
                error={sections[section.key].error}
                isEmpty={sections[section.key].items.length === 0}
                empty={<div className="home-preview-state">표시할 항목이 없습니다.</div>}
                loadingLabel={`${section.title} 불러오는 중`}
              >
                {sections[section.key].items.map((item) => <HomePreviewRow key={item.id} item={item} isFnGuide={section.key === 'fnguide'} route={section.path} onRequireAuth={requireAuth} onNavigate={navigate} />)}
              </AsyncState>
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
