import React from 'react';

export default class AppErrorBoundary extends React.Component {
  state = { hasError: false, error: null };

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('[AppErrorBoundary]', error, errorInfo);
  }

  handleReload = () => window.location.reload();

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <main className="app-error-fallback" role="alert">
        <div className="app-error-card">
          <p className="app-error-eyebrow">일시적인 오류</p>
          <h1>화면을 불러오지 못했습니다.</h1>
          <p>잠시 후 다시 시도해 주세요. 문제가 계속되면 페이지를 새로고침하세요.</p>
          {this.state.error?.message && <p className="app-error-detail">오류: {this.state.error.message}</p>}
          <button type="button" onClick={this.handleReload}>페이지 새로고침</button>
        </div>
      </main>
    );
  }
}
