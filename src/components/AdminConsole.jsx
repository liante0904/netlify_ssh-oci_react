import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useReport } from '../context/useReport';
import AdminLogContent from './admin/AdminLogContent';
import AdminReprocessPanel from './admin/AdminReprocessPanel';
import { useAdminMetrics } from '../hooks/useAdminMetrics';
import { useAdminLogs } from '../hooks/useAdminLogs';
import './AdminConsole.css';
import LoadingSkeleton from './LoadingSkeleton';
import AdminLlmVisibilitySettings from './admin/AdminLlmVisibilitySettings';
import AdminFirmHealthTable from './admin/AdminFirmHealthTable';

/* ===== Main Component ===== */

function AdminConsole() {
  const navigate = useNavigate();
  const { telegramUser, llmVisibility, updateLlmSetting } = useReport();

  // Redirect if not admin
  useEffect(() => {
    if (!telegramUser?.is_admin) {
      navigate('/', { replace: true });
    }
  }, [telegramUser, navigate]);

  const [processing, setProcessing] = useState({});
  const [logLines, setLogLines] = useState([]);
  const [refreshIntervalMs, setRefreshIntervalMs] = useState(60000);

  const [updatingLlm, setUpdatingLlm] = useState(false);
  const [llmFeedback, setLlmFeedback] = useState('');

  const handleLlmVisibilityChange = async (newVisibility) => {
    setUpdatingLlm(true);
    setLlmFeedback('');
    const result = await updateLlmSetting(newVisibility);
    setUpdatingLlm(false);
    if (result.success) {
      setLlmFeedback('✅ 성공적으로 저장되었습니다.');
      setTimeout(() => setLlmFeedback(''), 3000);
    } else {
      setLlmFeedback(`❌ 실패: ${result.message}`);
    }
  };


  const REFRESH_OPTIONS = [
    { label: '30초', value: 30000 },
    { label: '1분', value: 60000 },
    { label: '3분', value: 180000 },
    { label: '5분', value: 300000 },
  ];

  const {
    firmRecords,
    archiveHistory,
    summary,
    systemStatus,
    statusLoading,
    statusError,
    firmHealth,
    retryMetrics,
  } = useAdminMetrics(Boolean(telegramUser?.is_admin), refreshIntervalMs);
  const {
    logBrowser,
    logViewer,
    fetchLogDir,
    fetchLogFile,
    openLogDir,
    goLogRoot,
  } = useAdminLogs(Boolean(telegramUser?.is_admin));

  const maxCount = Math.max(...firmRecords.map((f) => f.todayCount), 1);

  const addLog = useCallback((msg) => {
    const now = new Date();
    const ts = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;
    setLogLines((prev) => [...prev, `[${ts}] ${msg}`]);
  }, []);

  const handleReprocess = useCallback(
    async (taskId, taskLabel) => {
      if (processing[taskId]) return;
      setProcessing((prev) => ({ ...prev, [taskId]: true }));
      addLog(`▶ ${taskLabel} 시작...`);

      // Simulate async reprocess
      const steps = [
        { delay: 600, msg: '  작업 큐에 등록됨' },
        { delay: 1200, msg: '  데이터 수집 시작...' },
        { delay: 2000, msg: `  ${Math.floor(Math.random() * 30) + 10}건 처리 완료` },
        { delay: 800, msg: '  PDF 변환 중...' },
        { delay: 1000, msg: `  ✅ ${taskLabel} 완료` },
      ];

      for (const step of steps) {
        await new Promise((r) => setTimeout(r, step.delay));
        addLog(step.msg);
      }

      setProcessing((prev) => ({ ...prev, [taskId]: false }));
    },
    [processing, addLog]
  );

  const clearLog = useCallback(() => {
    setLogLines([]);
  }, []);

  const logViewerRef = useRef(null);

  useEffect(() => {
    if (!logViewer.content || !logViewerRef.current) return;
    logViewerRef.current.scrollTop = logViewerRef.current.scrollHeight;
  }, [logViewer.content]);

  if (!telegramUser?.is_admin) {
    return null;
  }

  const statusColor = (val) => {
    if (val === 'online') return 'online';
    if (val === 'offline') return 'offline';
    return 'partial';
  };

  return (
    <div className="admin-console container">
      <h1>🛠️ 관리자 콘솔</h1>
      <p className="subtitle">
        {telegramUser.first_name || telegramUser.username} 님, 환영합니다 ·{' '}
        {new Date().toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'short' })}
      </p>

      {/* ===== Refresh Controls ===== */}
      <div className="refresh-bar">
        <button
          className="refresh-btn"
          onClick={() => retryMetrics()}
          disabled={statusLoading}
          title="수동 갱신"
        >
          ↻ {statusLoading ? '갱신 중...' : '새로고침'}
        </button>
        <span className="refresh-label">자동 갱신:</span>
        <div className="refresh-interval-group">
          {REFRESH_OPTIONS.map(opt => (
            <button
              key={opt.value}
              className={`refresh-interval-btn ${refreshIntervalMs === opt.value ? 'active' : ''}`}
              onClick={() => setRefreshIntervalMs(opt.value)}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* ===== Summary Cards ===== */}
      <div className="summary-row">
        <div className="summary-card">
          <div className="card-icon">📄</div>
          <div className="card-value">{summary.totalArchived.toLocaleString()}</div>
          <div className="card-label">최근 7일 아카이브</div>
        </div>
        <div className="summary-card">
          <div className="card-icon">📥</div>
          <div className="card-value">{summary.todayCount.toLocaleString()}</div>
          <div className="card-label">오늘 Insert</div>
        </div>
        <div className="summary-card">
          <div className="card-icon">🏦</div>
          <div className="card-value">{summary.activeFirms}</div>
          <div className="card-label">활성 증권사 / {summary.totalFirms}</div>
        </div>
        <div className="summary-card">
          <div className="card-icon">⏳</div>
          <div className="card-value">{summary.pendingReprocess}</div>
          <div className="card-label">재처리 대기</div>
        </div>
      </div>

      {/* ===== System Status (맨 위) ===== */}
      <div className="section-card">
        <div className="section-title">
          ⚙️ 시스템 운영 상태
          {statusLoading && <span className="badge">갱신 중...</span>}
          {statusError && <span className="badge status-error-badge">오류</span>}
        </div>
        {systemStatus ? (
          <div className="status-grid">
            <div className="status-item">
              <span className="status-label">DB 연결</span>
              <span className={`status-value ${statusColor(systemStatus.db)}`}>
                <span className={`status-dot ${statusColor(systemStatus.db)}`} /> {systemStatus.db === 'online' ? 'Online' : 'Offline'}
              </span>
            </div>
            <div className="status-item">
              <span className="status-label">API 서버</span>
              <span className={`status-value ${statusColor(systemStatus.api)}`}>
                <span className={`status-dot ${statusColor(systemStatus.api)}`} /> {systemStatus.api === 'online' ? 'Online' : 'Offline'}
              </span>
            </div>
            <div className="status-item">
              <span className="status-label">CPU</span>
              <span className="status-value">{systemStatus.cpu}% {systemStatus.cpuFreq ? `(${systemStatus.cpuFreq}MHz)` : ''}</span>
            </div>
            <div className="status-item">
              <span className="status-label">RAM</span>
              <span className="status-value">{systemStatus.memoryPercent}% ({systemStatus.memoryUsed}GB / {systemStatus.memoryTotal}GB)</span>
            </div>
            <div className="status-item">
              <span className="status-label">디스크</span>
              <span className="status-value">{systemStatus.diskPercent}% ({systemStatus.diskUsed}GB / {systemStatus.diskTotal}GB)</span>
            </div>
            <div className="status-item">
              <span className="status-label">서버 가동시간</span>
              <span className="status-value">{systemStatus.uptimeDays}일</span>
            </div>
            <div className="status-item">
              <span className="status-label">마지막 수집</span>
              <span className="status-value">{systemStatus.lastCrawl}</span>
            </div>
            <div className="status-item">
              <span className="status-label">오늘 Insert</span>
              <span className="status-value">{systemStatus.todayReports}건</span>
            </div>
          </div>
        ) : (
          <LoadingSkeleton rows={2} label="서버 상태 불러오는 중" />
        )}
      </div>

      {/* ===== PDF Archive History (Bar Chart) ===== */}
      <div className="section-card">
        <div className="section-title">
          📊 PDF 아카이브 현황
          <span className="badge">최근 7일</span>
        </div>
        <div className="archive-history">
          {archiveHistory.map((day) => {
            const maxVal = Math.max(...archiveHistory.map((d) => d.count), 1);
            const heightPct = Math.max((day.count / maxVal) * 100, 4);
            return (
              <div className="history-bar" key={day.label}>
                <div className="bar" style={{ height: `${heightPct}%` }} title={`${day.count}건`} />
                <div className="bar-label">{day.label}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ===== Securities Firm Records ===== */}
      <div className="section-card">
        <div className="section-title">
          🏦 증권사별 오늘 Insert 건수
          <span className="badge">{new Date().toLocaleDateString('ko-KR')}</span>
        </div>
        <div className="firm-list">
          {firmRecords.map((firm) => (
            <div className="firm-row" key={firm.name}>
              <span className="firm-name">{firm.name}</span>
              <div className="firm-bar-bg">
                <div
                  className="firm-bar-fill"
                  style={{ width: `${(firm.todayCount / maxCount) * 100}%` }}
                />
              </div>
              <span className="firm-count">{firm.todayCount}</span>
            </div>
          ))}
        </div>
      </div>

      <AdminLlmVisibilitySettings
        llmVisibility={llmVisibility}
        updatingLlm={updatingLlm}
        feedback={llmFeedback}
        onChange={handleLlmVisibilityChange}
      />

      {/* ===== Firm Health ===== */}
      <div className="section-card">
        <div className="section-title">
          🩺 증권사 건강검진 (마지막 레포트)
          {firmHealth && (
            <span className="badge firm-health-badge">
              {firmHealth.stale_count > 0 ? `🛑 ${firmHealth.stale_count} STALE` : ''}
              {firmHealth.warn_count > 0 ? ` ⚠️ ${firmHealth.warn_count} WARN` : ''}
              {firmHealth.stale_count === 0 && firmHealth.warn_count === 0 ? '✅ All OK' : ''}
            </span>
          )}
        </div>
        {firmHealth ? (
          <AdminFirmHealthTable firmHealth={firmHealth} />
        ) : (
          <LoadingSkeleton rows={4} label="증권사 상태 불러오는 중" />
        )}
      </div>

      <AdminReprocessPanel
        processing={processing}
        logLines={logLines}
        onReprocess={handleReprocess}
        onClearLog={clearLog}
      />

      {/* ===== Log Browser (서버 로그 파일 탐색/보기) ===== */}
      <div className="section-card log-browser-section">
        <div className="section-title">
          📂 서버 로그 파일
          {logBrowser.currentPath && (
            <span className="badge log-root-link" onClick={goLogRoot}>
              ← 루트
            </span>
          )}
          <button
            className="refresh-btn"
            onClick={() => fetchLogDir(logBrowser.currentPath)}
            disabled={logBrowser.loading}
            title="새로고침"
          >
            ↻
          </button>
        </div>

        {/* 에러 */}
        {logBrowser.error && (
          <div className="log-browser-error">
            로그 목록 로딩 실패: {logBrowser.error}
          </div>
        )}

        {/* 파일 목록 */}
        {logBrowser.loading ? (
          <LoadingSkeleton rows={4} label="로그 목록 불러오는 중" />
        ) : logBrowser.entries.length === 0 && !logBrowser.error ? (
          <div className="log-browser-empty">로그 디렉토리가 없습니다.</div>
        ) : (
          <div className="log-browser-list">
            {logBrowser.entries.map((entry, i) => (
              <div
                key={i}
                className={`log-entry ${entry.type === 'directory' ? 'log-entry-dir' : ''} ${entry.archived ? 'log-entry-archived' : ''}`}
                onClick={() => {
                  if (entry.type === 'directory') {
                    openLogDir(entry.full_path);
                  } else if (!entry.archived) {
                    fetchLogFile(entry.full_path, { tail: true });
                  }
                }}
              >
                <span className="log-entry-icon">
                  {entry.type === 'directory' ? '📁' : entry.archived ? '📦' : '📄'}
                </span>
                <span className="log-entry-name">{entry.name}</span>
                <span className="log-entry-meta">
                  {entry.description && (
                    <span className="log-entry-desc">{entry.description}</span>
                  )}
                  {entry.size && <span className="log-entry-size">{entry.size}</span>}
                  {entry.modified && <span className="log-entry-modified">{entry.modified}</span>}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ===== Log Viewer (파일 내용 보기) ===== */}
      {logViewer.file && (
        <div className="section-card log-viewer-section">
          <div className="section-title">
            <span className="log-viewer-title log-root-link" onClick={goLogRoot}>
              📄 {logViewer.file.split('/').pop()}
            </span>
            <span className="badge">tail 500</span>
            <button
              className="refresh-btn"
              onClick={() => fetchLogFile(logViewer.file, { tail: true })}
              disabled={logViewer.loading}
              title="새로고침"
            >
              ↻
            </button>
            <button
              className="close-btn"
              onClick={goLogRoot}
              title="닫기"
            >
              ✕
            </button>
          </div>

          {logViewer.error && (
            <div className="log-browser-error">
              로그 읽기 실패: {logViewer.error}
            </div>
          )}

          {logViewer.loading ? (
            <LoadingSkeleton rows={5} label="로그 내용 불러오는 중" />
          ) : (
            <div className="log-viewer-content" ref={logViewerRef}>
              {logViewer.content
                ? <AdminLogContent text={logViewer.content} />
                : '(빈 파일)'}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default AdminConsole;
