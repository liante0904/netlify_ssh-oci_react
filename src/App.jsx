import React, { lazy, Suspense, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Header from './components/Header';
import SearchOverlay from './components/SearchOverlay';
import HomeDashboard from './components/HomeDashboard';
import BottomNav from './components/BottomNav';
import { ReportProvider } from './context/ReportContext';
import { useReport } from './context/useReport';
import { useAppLayout } from './hooks/useAppLayout';
import PDFViewerModal from './components/report/PDFViewerModal';
import RequireAuth from './components/RequireAuth';
import NetworkStatusBanner from './components/NetworkStatusBanner';
import NotFoundPage from './components/NotFoundPage';
import LoadingSkeleton from './components/LoadingSkeleton';
import { warmupServerlessFunctions } from './utils/warmupServerlessFunctions';

const ReportList = lazy(() => import('./components/ReportList'));
const SearchPageNew = lazy(() => import('./components/SearchPageNew'));
const AdminConsole = lazy(() => import('./components/AdminConsole'));
const FnGuideList = lazy(() => import('./components/FnGuideList'));

function RouteLoadingFallback() {
  return <LoadingSkeleton variant="list" rows={7} label="화면 불러오는 중" />;
}

function AppContent() {
  const location = useLocation();
  const { 
    setIsSearchOpen,
    isMenuOpen, 
    setIsMenuOpen,
    isTopMenuOpen, 
    setIsTopMenuOpen,
    setSearchQuery,
    setPendingSearch,
    viewerReport,
    setViewerReport,
  } = useReport();

  const {
    isNavVisible,
    headerRef,
  } = useAppLayout();

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  }, [location.pathname, location.search]);

  // 글로벌 워밍업: 앱 시작 시 서버(Lambda) 미리 깨우기
  useEffect(() => {
    // 브라우저 로딩이 완전히 끝난 뒤 여유 있을 때 실행
    if (window.requestIdleCallback) {
      window.requestIdleCallback(warmupServerlessFunctions, { timeout: 3000 });
    } else {
      setTimeout(warmupServerlessFunctions, 2000);
    }
  }, []);

  const handleWriterSearch = (writer) => {
    setPendingSearch({ query: writer, category: 'writer' });
    setIsSearchOpen(true);
  };

  const handleHomeClick = () => {
    setSearchQuery({ query: '', category: '', board: null });
    if (isTopMenuOpen) setIsTopMenuOpen(false);
    if (isMenuOpen) setIsMenuOpen(false);
  };

  return (
    <>
      <NetworkStatusBanner />
      <Header
        ref={headerRef}
        isNavVisible={isNavVisible}
      />
      
      <main 
        id="main-content"
        className="main-content" 
        onClick={() => {
          if (isMenuOpen || isTopMenuOpen) {
            if (isMenuOpen) setIsMenuOpen(false);
            if (isTopMenuOpen) setIsTopMenuOpen(false);
          }
        }}
      >
        <Suspense fallback={<RouteLoadingFallback />}>
          <Routes>
          {/* 메인 페이지만 공개, 나머지는 인증 필요 */}
          <Route path="/" element={<HomeDashboard />} />
          <Route path="/recent" element={<RequireAuth><ReportList key="recent" onWriterClick={handleWriterSearch} /></RequireAuth>} />
          <Route path="/global" element={<RequireAuth><ReportList key="global" onWriterClick={handleWriterSearch} /></RequireAuth>} />
          <Route path="/industry" element={<RequireAuth><ReportList key="industry" onWriterClick={handleWriterSearch} /></RequireAuth>} />
          <Route path="/favorites" element={<RequireAuth><ReportList key="favorites" onWriterClick={handleWriterSearch} /></RequireAuth>} />
          <Route path="/outlook" element={<RequireAuth><ReportList key="outlook" onWriterClick={handleWriterSearch} /></RequireAuth>} />
          <Route path="/ai-summary" element={<RequireAuth><ReportList key="ai-summary" onWriterClick={handleWriterSearch} /></RequireAuth>} />
          <Route path="/fnguide" element={<RequireAuth><FnGuideList /></RequireAuth>} />
          <Route path="/admin-console" element={<RequireAuth><AdminConsole /></RequireAuth>} />
          <Route path="/search-new" element={<RequireAuth><SearchPageNew /></RequireAuth>} />
          <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </Suspense>
      </main>
      <SearchOverlay />
      <BottomNav 
        isNavVisible={isNavVisible} 
        onHomeClick={handleHomeClick}
      />
      
      {/* 인앱 뷰어 모달 */}
      {viewerReport && (
        <PDFViewerModal 
          report={viewerReport} 
          onClose={() => setViewerReport(null)} 
        />
      )}
    </>
  );
}

function App() {
  return (
    <ReportProvider>
      <Router>
        <AppContent />
      </Router>
    </ReportProvider>
  );
}

export default App;
