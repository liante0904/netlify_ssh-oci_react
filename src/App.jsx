import React, { Suspense, useEffect } from 'react';
import { BrowserRouter as Router, useLocation } from 'react-router-dom';
import Header from './components/Header';
import SearchOverlay from './components/SearchOverlay';
import AppRoutes from './components/AppRoutes';
import BottomNav from './components/BottomNav';
import { ReportProvider } from './context/ReportContext';
import { useReport } from './context/useReport';
import { useAppLayout } from './hooks/useAppLayout';
import PDFViewerModal from './components/report/PDFViewerModal';
import NetworkStatusBanner from './components/NetworkStatusBanner';
import LoadingSkeleton from './components/LoadingSkeleton';
import './index.css';

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
    const warmUp = async () => {
      const warmupKey = 'ssh-reports:server-warmup:v1';
      if (!navigator.onLine || sessionStorage.getItem(warmupKey)) return;
      sessionStorage.setItem(warmupKey, '1');

      const origin = window.location.origin;
      const targets = [
        `${origin}/.netlify/functions/proxy?warmup=true`,
        `${origin}/.netlify/functions/share?warmup=true`
      ];
      
      // 사용자 몰래 백그라운드에서 신호만 보냄
      targets.forEach(url => {
        fetch(url, { method: 'HEAD', mode: 'no-cors' }).catch(() => {});
      });
      console.log('[App] Global warm-up signal sent to serverless functions');
    };
    
    // 브라우저 로딩이 완전히 끝난 뒤 여유 있을 때 실행
    if (window.requestIdleCallback) {
      window.requestIdleCallback(warmUp, { timeout: 3000 });
    } else {
      setTimeout(warmUp, 2000);
    }
  }, []);

  const handleWriterSearch = (writer) => {
    setPendingSearch({ query: writer, category: 'writer' });
    setIsSearchOpen(true);
  };

  const handleHomeClick = () => {
    const emptySearch = { query: '', category: '', board: null, companyOrder: null };
    setSearchQuery(emptySearch);
    setPendingSearch(emptySearch);
    setIsSearchOpen(false);
    if (!window.matchMedia?.('(min-width: 1280px)').matches) setIsTopMenuOpen(false);
    setIsMenuOpen(false);
    setViewerReport(null);
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
        className={`main-content ${isMenuOpen ? 'menu-open' : ''}`}
        onClick={() => {
          if (window.matchMedia?.('(min-width: 1280px)').matches) return;
          if (isMenuOpen || isTopMenuOpen) {
            if (isMenuOpen) setIsMenuOpen(false);
            if (isTopMenuOpen) setIsTopMenuOpen(false);
          }
        }}
      >
        <Suspense fallback={<RouteLoadingFallback />}>
          <AppRoutes onWriterClick={handleWriterSearch} />
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
