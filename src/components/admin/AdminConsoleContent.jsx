import LoadingSkeleton from '../LoadingSkeleton';
import AdminLogContent from './AdminLogContent';
import AdminReprocessPanel from './AdminReprocessPanel';
import AdminLlmVisibilitySettings from './AdminLlmVisibilitySettings';
import AdminFirmHealthTable from './AdminFirmHealthTable';

const STATUS_FIELDS = [
  ['db', 'DB 연결'], ['api', 'API 서버'], ['cpu', 'CPU'], ['memoryPercent', 'RAM'],
  ['diskPercent', '디스크'], ['uptimeDays', '서버 가동시간'], ['lastCrawl', '마지막 수집'], ['todayReports', '오늘 Insert'],
];

function statusColor(value) {
  if (value === 'online') return 'online';
  if (value === 'offline') return 'offline';
  return 'partial';
}

function SummaryCards({ summary }) {
  return <div className="summary-row">
    {[
      ['📄', summary.totalArchived.toLocaleString(), '최근 7일 아카이브'],
      ['📥', summary.todayCount.toLocaleString(), '오늘 Insert'],
      ['🏦', summary.activeFirms, `활성 증권사 / ${summary.totalFirms}`],
      ['⏳', summary.pendingReprocess, '재처리 대기'],
    ].map(([icon, value, label]) => <div className="summary-card" key={label}><div className="card-icon">{icon}</div><div className="card-value">{value}</div><div className="card-label">{label}</div></div>)}
  </div>;
}

function SystemStatus({ systemStatus, loading, error }) {
  return <div className="section-card"><div className="section-title">⚙️ 시스템 운영 상태 {loading && <span className="badge">갱신 중...</span>}{error && <span className="badge status-error-badge">오류</span>}</div>
    {systemStatus ? <div className="status-grid">{STATUS_FIELDS.map(([key, label]) => {
      const value = systemStatus[key];
      const isStatus = key === 'db' || key === 'api';
      return <div className="status-item" key={key}><span className="status-label">{label}</span><span className={`status-value ${isStatus ? statusColor(value) : ''}`}>{isStatus && <span className={`status-dot ${statusColor(value)}`} />} {isStatus ? (value === 'online' ? 'Online' : 'Offline') : value}{key === 'cpu' && systemStatus.cpuFreq ? ` (${systemStatus.cpuFreq}MHz)` : ''}{key === 'memoryPercent' ? ` (${systemStatus.memoryUsed}GB / ${systemStatus.memoryTotal}GB)` : ''}{key === 'diskPercent' ? ` (${systemStatus.diskUsed}GB / ${systemStatus.diskTotal}GB)` : ''}{key === 'uptimeDays' ? '일' : ''}{key === 'todayReports' ? '건' : ''}</span></div>;
    })}</div> : <LoadingSkeleton rows={2} label="서버 상태 불러오는 중" />}
  </div>;
}

function ArchiveHistory({ archiveHistory }) {
  const max = Math.max(...archiveHistory.map((day) => day.count), 1);
  return <div className="section-card"><div className="section-title">📊 PDF 아카이브 현황 <span className="badge">최근 7일</span></div><div className="archive-history">{archiveHistory.map((day) => <div className="history-bar" key={day.label}><div className="bar" style={{ height: `${Math.max((day.count / max) * 100, 4)}%` }} title={`${day.count}건`} /><div className="bar-label">{day.label}</div></div>)}</div></div>;
}

function FirmRecords({ records }) {
  const max = Math.max(...records.map((firm) => firm.todayCount), 1);
  return <div className="section-card"><div className="section-title">🏦 증권사별 오늘 Insert 건수</div><div className="firm-list">{records.map((firm) => <div className="firm-row" key={firm.name}><span className="firm-name">{firm.name}</span><div className="firm-bar-bg"><div className="firm-bar-fill" style={{ width: `${(firm.todayCount / max) * 100}%` }} /></div><span className="firm-count">{firm.todayCount}</span></div>)}</div></div>;
}

function LogBrowser({ browser, viewer, onDir, onFile, onRoot, viewerRef }) {
  return <>
    <div className="section-card log-browser-section"><div className="section-title">📂 서버 로그 파일 {browser.currentPath && <span className="badge log-root-link" onClick={onRoot}>← 루트</span>}<button className="refresh-btn" onClick={() => onDir(browser.currentPath)} disabled={browser.loading}>↻</button></div>
      {browser.error && <div className="log-browser-error">로그 목록 로딩 실패: {browser.error}</div>}{browser.loading ? <LoadingSkeleton rows={4} label="로그 목록 불러오는 중" /> : browser.entries.length === 0 && !browser.error ? <div className="log-browser-empty">로그 디렉토리가 없습니다.</div> : <div className="log-browser-list">{browser.entries.map((entry) => <div key={entry.full_path} className={`log-entry ${entry.type === 'directory' ? 'log-entry-dir' : ''} ${entry.archived ? 'log-entry-archived' : ''}`} onClick={() => entry.type === 'directory' ? onDir(entry.full_path) : !entry.archived && onFile(entry.full_path, { tail: true })}><span className="log-entry-icon">{entry.type === 'directory' ? '📁' : entry.archived ? '📦' : '📄'}</span><span className="log-entry-name">{entry.name}</span><span className="log-entry-meta">{entry.description && <span className="log-entry-desc">{entry.description}</span>}{entry.size && <span className="log-entry-size">{entry.size}</span>}{entry.modified && <span className="log-entry-modified">{entry.modified}</span>}</span></div>)}</div>}
    </div>
    {viewer.file && <div className="section-card log-viewer-section"><div className="section-title"><span className="log-viewer-title log-root-link" onClick={onRoot}>📄 {viewer.file.split('/').pop()}</span><span className="badge">tail 500</span><button className="refresh-btn" onClick={() => onFile(viewer.file, { tail: true })} disabled={viewer.loading}>↻</button><button className="close-btn" onClick={onRoot}>✕</button></div>{viewer.error && <div className="log-browser-error">로그 읽기 실패: {viewer.error}</div>}{viewer.loading ? <LoadingSkeleton rows={5} label="로그 내용 불러오는 중" /> : <div className="log-viewer-content" ref={viewerRef}>{viewer.content ? <AdminLogContent text={viewer.content} /> : '(빈 파일)'}</div>}</div>}
  </>;
}

export default function AdminConsoleContent({ user, refreshIntervalMs, refreshOptions, onRefreshChange, onRefresh, statusLoading, statusError, summary, systemStatus, archiveHistory, firmRecords, firmHealth, processing, logLines, onReprocess, onClearLog, llmVisibility, updatingLlm, llmFeedback, onLlmChange, logBrowser, logViewer, onDir, onFile, onRoot, viewerRef }) {
  return <div className="admin-console container"><h1>🛠️ 관리자 콘솔</h1><p className="subtitle">{user.first_name || user.username} 님, 환영합니다 · {new Date().toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'short' })}</p>
    <div className="refresh-bar"><button className="refresh-btn" onClick={onRefresh} disabled={statusLoading}>↻ {statusLoading ? '갱신 중...' : '새로고침'}</button><span className="refresh-label">자동 갱신:</span><div className="refresh-interval-group">{refreshOptions.map((option) => <button key={option.value} className={`refresh-interval-btn ${refreshIntervalMs === option.value ? 'active' : ''}`} onClick={() => onRefreshChange(option.value)}>{option.label}</button>)}</div></div>
    <SummaryCards summary={summary} /><SystemStatus systemStatus={systemStatus} loading={statusLoading} error={statusError} /><ArchiveHistory archiveHistory={archiveHistory} /><FirmRecords records={firmRecords} />
    <AdminLlmVisibilitySettings llmVisibility={llmVisibility} updatingLlm={updatingLlm} feedback={llmFeedback} onChange={onLlmChange} />
    <div className="section-card"><div className="section-title">🩺 증권사 건강검진</div>{firmHealth ? <AdminFirmHealthTable firmHealth={firmHealth} /> : <LoadingSkeleton rows={4} label="증권사 상태 불러오는 중" />}</div>
    <AdminReprocessPanel processing={processing} logLines={logLines} onReprocess={onReprocess} onClearLog={onClearLog} /><LogBrowser browser={logBrowser} viewer={logViewer} onDir={onDir} onFile={onFile} onRoot={onRoot} viewerRef={viewerRef} />
  </div>;
}
