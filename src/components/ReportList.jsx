import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import InfiniteScroll from 'react-infinite-scroll-component';
import ShareMenu from './ShareMenu';
import ReportGroup from './report/ReportGroup';
import { useReportFetch } from '../hooks/useReportFetch';
import { useReport } from '../context/useReport';
import { CONFIG } from '../constants/config';
import { getReportSectionByPath } from '../constants/reportSections';
import { isDsReport, prefetchPdf } from '../utils/reportLinks';
import { normalizeReportItem } from '../utils/reportNormalizer';
import { useFavoriteMutation } from '../hooks/useFavoriteMutation';
import { useFavorites } from '../hooks/useFavorites';
import { useFavoriteSync } from '../hooks/useFavoriteSync';
import { useSummaryMutation } from '../hooks/useSummaryMutation';
import ReportListFilters from './report/ReportListFilters';
import { buildShareMenuData } from '../utils/shareMenuData';
import MenuSummary from './MenuSummary';
import AsyncErrorState from './AsyncErrorState';
import LoadingSkeleton from './LoadingSkeleton';
import './ReportList.css';

const SUMMARY_NOTIFICATION_EVENT = 'ssh-summary-notification';

function emitSummaryNotification(detail) {
  window.dispatchEvent(new CustomEvent(SUMMARY_NOTIFICATION_EVENT, {
    detail: {
      created_at: new Date().toISOString(),
      ...detail,
    },
  }));
}

function ReportList({ onWriterClick }) {
  const { searchQuery, sortBy, setSortBy, telegramUser, handleSearch } = useReport();
  const isAdmin = telegramUser?.is_admin === true;
  const { mutateFavorite } = useFavoriteMutation(telegramUser);
  const { favoriteItems } = useFavorites(telegramUser);
  const { syncFavoriteIds } = useFavoriteSync();
  const { triggerSummary } = useSummaryMutation();
  const location = useLocation();
  const isOutlook = location.pathname.includes('outlook');
  const [outlookYear, setOutlookYear] = useState(null);
  const { 
    reports, 
    isLoading, 
    hasMore, 
    offset, 
    fetchReports,
    error,
    retry,
  } = useReportFetch(searchQuery, location.pathname, outlookYear, sortBy);

  const [collapsedDates, setCollapsedDates] = useState({});
  const [collapsedFirms, setCollapsedFirms] = useState({});
  const [expandedSummaries, setExpandedSummaries] = useState({});
  const [favorites, setFavorites] = useState(() => {
    const saved = localStorage.getItem('report_favorites');
    try {
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  // 즐겨찾기 페이지 전용: 서버에서 tbl_sec_reports와 JOIN된 풀 리포트 데이터
  const [favoriteReports, setFavoriteReports] = useState(null);

  // 로그인 시 로컬 즐겨찾기를 서버로 업로드 후 동기화
  useEffect(() => {
    if (!telegramUser) return;
    const token = localStorage.getItem(CONFIG.STORAGE_KEYS.AUTH_TOKEN);
    if (!token) return;

    const LOCAL_KEY = 'report_favorites';
    const SYNC_FLAG_KEY = 'report_favorites_synced';

    // 이미 동기화한 적 있으면 useFavorites query 결과를 사용한다.
    if (localStorage.getItem(SYNC_FLAG_KEY)) return;

    // 로컬에 저장된 즐겨찾기를 서버로 업로드
    const localSaved = localStorage.getItem(LOCAL_KEY);
    let localFavs = {};
    try {
      localFavs = localSaved ? JSON.parse(localSaved) : {};
    } catch {
      localFavs = {};
    }

    const reportIds = Object.keys(localFavs).filter(id => localFavs[id]).map(Number);
    if (reportIds.length > 0) {
      syncFavoriteIds(reportIds);
    }

    // 동기화 완료 플래그 (재실행 방지)
    localStorage.setItem(SYNC_FLAG_KEY, '1');
  }, [syncFavoriteIds, telegramUser]);

  useEffect(() => {
    if (!favoriteItems.length) return;
    const serverFavs = {};
    favoriteItems.forEach(item => { serverFavs[item.report_id] = true; });
    setFavorites(prev => {
      const merged = { ...prev, ...serverFavs };
      localStorage.setItem('report_favorites', JSON.stringify(merged));
      return merged;
    });
  }, [favoriteItems]);

  // 즐겨찾기 페이지 진입 시 서버에서 tbl_sec_reports와 JOIN된 풀 리포트 데이터 조회
  useEffect(() => {
    if (!location.pathname.includes('favorites')) return;
    if (!telegramUser) return;
    const token = localStorage.getItem(CONFIG.STORAGE_KEYS.AUTH_TOKEN);
    if (!token) return;

    if (favoriteItems.length === 0) {
      setFavoriteReports({});
      return;
    }

        // 서버가 tbl_sec_reports와 JOIN한 풀 리포트 데이터 정규화
        const normalizedItems = favoriteItems
          .map(item => normalizeReportItem(item))
          .filter(Boolean);

        if (normalizedItems.length === 0) {
          setFavoriteReports({});
          return;
        }

        // 날짜별 그룹핑 (useReportFetch의 mergeReports 로직과 동일하게)
        const grouped = {};
        normalizedItems.forEach(report => {
          const { date } = report;
          if (!grouped[date] || !Array.isArray(grouped[date])) grouped[date] = [];
          const exists = grouped[date].some(r => r.id === report.id);
          if (!exists) grouped[date].push(report);
        });
        setFavoriteReports(grouped);
  }, [favoriteItems, location.pathname, telegramUser]);

  const [summaryRequestedIds, setSummaryRequestedIds] = useState(new Set());
  const [summaryCompletedIds, setSummaryCompletedIds] = useState(new Set());
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 });

  useEffect(() => {
    window.scrollTo(0, 0);
    setCollapsedDates({});
    setCollapsedFirms({});
    setExpandedSummaries({});
    setSummaryRequestedIds(new Set());
  }, [location.pathname, searchQuery, sortBy]);

  // 모든 날짜 그룹이 닫혀있고 다음 데이터가 있다면 자동으로 더 불러오기
  useEffect(() => {
    const reportDates = Object.keys(reports || {});
    if (reportDates.length === 0 && !isLoading) return;

    const allCollapsed = reportDates.every(date => collapsedDates[date] === true);
    if (allCollapsed && hasMore && !isLoading) fetchReports();
  }, [collapsedDates, reports, hasMore, isLoading, fetchReports]);

  const toggleDate = (date) => {
    setCollapsedDates(prev => ({ ...prev, [date]: !prev[date] }));
  };

  const toggleFirm = (date, firm) => {
    setCollapsedFirms(prev => ({
      ...prev,
      [date]: { ...prev[date], [firm]: !prev[date]?.[firm] }
    }));
  };

  const toggleSummary = (id) => {
    setExpandedSummaries(prev => ({ ...prev, [id]: !prev[id] }));
  };


  const toggleFavorite = (id) => {
    const isAdding = !favorites[id];
    const previous = favorites;
    const next = { ...favorites, [id]: isAdding };
    setFavorites(next);
    localStorage.setItem('report_favorites', JSON.stringify(next));
    mutateFavorite(id, isAdding)?.catch(() => {
      setFavorites(previous);
      localStorage.setItem('report_favorites', JSON.stringify(previous));
    });
  };

  const handleOpenShareMenu = (e, report) => {
    const rect = e.currentTarget.getBoundingClientRect();
    
    setMenuPosition({ 
      top: rect.bottom, 
      left: rect.left + rect.width / 2 
    });
    setSelectedReport(buildShareMenuData(report));
    setIsShareOpen(true);
  };

  const handleTriggerSummary = async (reportId, engine = 'deepseek', force = false, report = null) => {
    const token = localStorage.getItem(CONFIG.STORAGE_KEYS.AUTH_TOKEN);
    if (!token) return;
    const title = report?.title || report?.article_title || `리포트 #${reportId}`;
    const firm = report?.firm || report?.firm_nm || '';
    const modelLabel = engine === 'ag' ? 'Gemini' : 'DeepSeek';

    /* 기존 주석 유지: 중복 요청 방지 (force=true일 때는 우회를 위해 상태 초기화) */
    if (force) {
      setSummaryCompletedIds(prev => {
        const next = new Set(prev);
        next.delete(reportId);
        return next;
      });
      setSummaryRequestedIds(prev => {
        const next = new Set(prev);
        next.delete(reportId);
        return next;
      });
    } else if (summaryRequestedIds.has(reportId)) {
      return;
    }
    
    setSummaryRequestedIds(prev => new Set(prev).add(reportId));
    emitSummaryNotification({
      report_id: reportId,
      article_title: title,
      firm_nm: firm,
      summary_model: engine === 'ag' ? 'gemini' : engine,
      status: 'requested',
      message: `${modelLabel} 요약 요청을 접수했습니다: ${title}`,
    });

    try {
      const result = await triggerSummary({ reportId, engine, force });
      if (result?.status === 'success') {
        setSummaryCompletedIds(prev => new Set(prev).add(reportId));
        emitSummaryNotification({
          report_id: reportId,
          article_title: title,
          firm_nm: firm,
          summary_model: engine === 'ag' ? 'gemini' : engine,
          status: 'completed',
          message: `${modelLabel} 요약이 완료되었습니다: ${title}`,
        });
      } else if (result?.status === 'skipped') {
        setSummaryCompletedIds(prev => new Set(prev).add(reportId));
        emitSummaryNotification({
          report_id: reportId,
          article_title: title,
          firm_nm: firm,
          summary_model: engine === 'ag' ? 'gemini' : engine,
          status: 'skipped',
          message: `${modelLabel} 요약이 이미 완료되어 있습니다: ${title}`,
        });
      }
    } catch (error) {
      console.error('[Admin] ❌ 요청 실패:', error.message);
      // 실패 시 요청됨 해제 (재시도 가능)
      setSummaryRequestedIds(prev => {
        const next = new Set(prev);
        next.delete(reportId);
        return next;
      });
      emitSummaryNotification({
        report_id: reportId,
        article_title: title,
        firm_nm: firm,
        summary_model: engine === 'ag' ? 'gemini' : engine,
        status: 'failed',
        message: `${modelLabel} 요약 요청에 실패했습니다: ${title}`,
      });
    }
  };

  const isSearchActive = !!(searchQuery.query || searchQuery.category === 'company');
  const isFavoritesPage = location.pathname.includes('favorites');
  const isAiSummary = location.pathname.includes('ai-summary');
  const isRecent = location.pathname === '/recent';

  // 태그 클라우드 필터 상태 (현재 활성화된 태그 필터)
  const [tagFilter, setTagFilter] = useState(null);
  // 이전 검색 상태 저장 (필터 해제 시 복원용)
  const [previousSearch, setPreviousSearch] = useState(null);

  const handleTagClick = (keyword, isSector) => {
    // 현재 검색 상태를 저장해둠 (필터 해제 시 복원)
    setPreviousSearch({
      query: searchQuery.query,
      category: searchQuery.category,
      board: searchQuery.board,
      companyOrder: searchQuery.companyOrder,
    });
    const category = isSector ? 'sector' : 'title';
    setTagFilter({ keyword, category });
    handleSearch({ query: keyword, category });
  };

  const clearTagFilter = () => {
    setTagFilter(null);
    if (previousSearch) {
      handleSearch({
        query: previousSearch.query,
        category: previousSearch.category,
        board: previousSearch.board,
        companyOrder: previousSearch.companyOrder,
      });
      setPreviousSearch(null);
    } else {
      // 저장된 이전 검색이 없으면 전체 해제
      handleSearch({ query: '', category: '', board: null, companyOrder: null });
    }
  };

  const sectionMeta = getReportSectionByPath(location.pathname);
  const menuTitle = sectionMeta?.title || '레포트';

  // 즐겨찾기 페이지: 서버 JOIN 데이터 우선, fallback으로 useReportFetch 데이터 사용
  const displayReports = isFavoritesPage && favoriteReports ? favoriteReports : reports;
  const sortedDates = Object.keys(displayReports || {}).sort((a, b) => b.localeCompare(a));

  const hasSummaryContent = (report) => {
    return report?.gemini_summary && report.gemini_summary.trim() !== "" && report.gemini_summary.trim() !== " ";
  };

  // 필터링된 날짜 리스트
  // 즐겨찾기 페이지(favoriteReports 사용 시): 서버에서 이미 tbl_sec_reports 기준으로 필터링됨
  // AI요약 페이지: summary 존재하는 날짜만
  const filteredSortedDates = isFavoritesPage && favoriteReports
    ? sortedDates  // 서버에서 이미 유효한 데이터만 보내줌
    : isFavoritesPage
    ? sortedDates.filter(date => {
        const items = displayReports?.[date] || [];
        if (Array.isArray(items)) {
          return items.some(report => !!favorites[report?.id]);
        }
        return Object.values(items || {}).some(firmReports => 
          Array.isArray(firmReports) && firmReports.some(report => !!favorites[report?.id])
        );
      })
    : isAiSummary
    ? sortedDates.filter(date => {
        const items = displayReports?.[date] || [];
        if (Array.isArray(items)) {
          return items.some(hasSummaryContent);
        }
        return Object.values(items || {}).some(firmReports =>
          Array.isArray(firmReports) && firmReports.some(hasSummaryContent)
        );
      })
    : sortedDates;

  useEffect(() => {
    if (isLoading || filteredSortedDates.length === 0) return;

    const topReports = filteredSortedDates
      .slice(0, 2)
      .flatMap((date) => {
        if (collapsedDates[date]) return [];
        const items = displayReports?.[date] || [];
        const list = Array.isArray(items) ? items : Object.values(items || {}).flat();
        return list.filter((report) => {
          if (isFavoritesPage && !favoriteReports && !favorites[report.id]) return false;
          if (isAiSummary && !hasSummaryContent(report)) return false;
          return true;
        });
      })
      .filter(isDsReport)
      .slice(0, 3);

    if (topReports.length === 0) return;

    const runPrefetch = () => {
      const origin = window.location.origin;
      topReports.forEach((report, index) => {
        window.setTimeout(() => prefetchPdf(report, origin), index * 700);
      });
    };

    if (window.requestIdleCallback) {
      const idleId = window.requestIdleCallback(runPrefetch, { timeout: 2500 });
      return () => window.cancelIdleCallback?.(idleId);
    }

    const timeoutId = window.setTimeout(runPrefetch, 1200);
    return () => window.clearTimeout(timeoutId);
  }, [collapsedDates, displayReports, favoriteReports, favorites, filteredSortedDates, isAiSummary, isFavoritesPage, isLoading, reports]);

  return (
    <div className="report-list-wrapper">
      <div className="container" id="report-container">
        {/* 메뉴 요약정보 추가 */}
        <MenuSummary
          menuName={menuTitle}
          description={sectionMeta?.description}
          summaryItems={[
            ...(isFavoritesPage ? [{ label: '즐겨찾기', value: Object.keys(favorites).length, icon: '⭐' }] : []),
            ...(isAiSummary ? [{ label: 'AI 요약', value: filteredSortedDates.length, icon: '🤖' }] : []),
            ...(isOutlook ? [{ label: '전망', value: filteredSortedDates.length, icon: '🔮' }] : []),
            ...(sectionMeta && !isFavoritesPage && !isAiSummary && !isOutlook ? [{ label: menuTitle, value: filteredSortedDates.length, icon: '📰' }] : []),
            ...(searchQuery.query ? [{ label: '검색', value: searchQuery.query, icon: '🔍' }] : []),
          ]}
          variant="compact"
        />
        <ReportListFilters
          tagFilter={tagFilter}
          onClearTagFilter={clearTagFilter}
          isOutlook={isOutlook}
          isLoading={isLoading}
          outlookYear={outlookYear}
          onSetOutlookYear={setOutlookYear}
        />
        {error && offset === 0 ? (
          <AsyncErrorState onRetry={retry} />
        ) : isFavoritesPage && !favoriteReports && offset === 0 && isLoading ? (
          null
        ) : isFavoritesPage && favoriteReports && Object.keys(favoriteReports).length === 0 && !isLoading ? (
          <div className="empty-favorites">
            <div className="empty-icon">★</div>
            <p>즐겨찾기한 레포트가 없습니다.<br/>관심 있는 레포트에 별표를 눌러보세요!</p>
          </div>
        ) : !isFavoritesPage && offset === 0 && isLoading ? (
          <LoadingSkeleton rows={6} label="리포트 불러오는 중" />
        ) : isFavoritesPage && !favoriteReports && filteredSortedDates.length === 0 && !isLoading ? (
          <div className="empty-favorites">
            <div className="empty-icon">★</div>
            <p>즐겨찾기한 레포트가 없습니다.<br/>관심 있는 레포트에 별표를 눌러보세요!</p>
          </div>
        ) : isAiSummary && filteredSortedDates.length === 0 && !isLoading ? (
          <div className="empty-favorites">
            <div className="empty-icon">🤖</div>
            <p>AI 요약이 생성된 레포트가 없습니다.<br/>관리자가 요약을 생성하면 여기에 표시됩니다.</p>
          </div>
        ) : isOutlook && filteredSortedDates.length === 0 && !isLoading ? (
          <div className="empty-favorites">
            <div className="empty-icon">🔮</div>
            <p>전망 관련 레포트가 없습니다.<br/>2026년 하반기 전망 등 시장 전망 레포트가 여기에 표시됩니다.</p>
          </div>
        ) : filteredSortedDates.length === 0 && !isLoading ? null : (
          <InfiniteScroll
            dataLength={offset}
            next={fetchReports}
            hasMore={isFavoritesPage ? false : hasMore}
            scrollThreshold={0.6}
          >
            {filteredSortedDates.map((date, index) => (
              <ReportGroup 
                key={date}
                date={date}
                items={displayReports[date]}
                isCollapsed={!!collapsedDates[date]}
                onToggleDate={toggleDate}
                sortBy={sortBy}
                isFavoritesPage={isFavoritesPage}
                favorites={favorites}
                collapsedFirms={collapsedFirms}
                onToggleFirm={toggleFirm}
                expandedSummaries={expandedSummaries}
                onToggleSummary={toggleSummary}
                onToggleFavorite={toggleFavorite}
                onOpenShareMenu={handleOpenShareMenu}
                onWriterClick={onWriterClick}
                showSortOptions={index === 0 && isRecent && !isSearchActive}
                setSortBy={setSortBy}
                isAdmin={isAdmin}
                onTriggerSummary={handleTriggerSummary}
                summaryRequestedIds={summaryRequestedIds}
                summaryCompletedIds={summaryCompletedIds}
                isAiSummary={isAiSummary}
                hasSummaryContent={hasSummaryContent}
                showTagCloud={isRecent && !isSearchActive}
                onTagClick={handleTagClick}
              />
            ))}
          </InfiniteScroll>
        )}
        {isLoading && offset > 0 && <LoadingSkeleton variant="spinner" label="리포트 더 불러오는 중" />}
        {isFavoritesPage && !favoriteReports && !isLoading && <LoadingSkeleton rows={6} label="즐겨찾기 불러오는 중" />}
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
