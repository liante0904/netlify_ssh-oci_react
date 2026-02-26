import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

// 브라우저의 자동 스크롤 복원 기능 비활성화 (새로고침 시 항상 최상단 유지)
if ('scrollRestoration' in window.history) {
  window.history.scrollRestoration = 'manual';
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);