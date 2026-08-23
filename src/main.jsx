import React from 'react';
import ReactDOM from 'react-dom/client';
import { QueryClientProvider } from '@tanstack/react-query';
import App from './App';
import AppErrorBoundary from './components/AppErrorBoundary';
import { queryClient } from './queryClient';
import './index.css';

// 브라우저의 자동 스크롤 복원 기능 비활성화
if ('scrollRestoration' in window.history) {
  window.history.scrollRestoration = 'manual';
}

// 카카오 SDK 초기화
const KAKAO_KEY = import.meta.env.VITE_KAKAO_JS_KEY;
if (window.Kakao && KAKAO_KEY && !window.Kakao.isInitialized()) {
  window.Kakao.init(KAKAO_KEY);
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AppErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <App />
      </QueryClientProvider>
    </AppErrorBoundary>
  </React.StrictMode>
);
