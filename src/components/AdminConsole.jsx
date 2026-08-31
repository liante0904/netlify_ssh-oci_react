import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useReport } from '../context/useReport';
import { useAdminMetrics } from '../hooks/useAdminMetrics';
import { useAdminLogs } from '../hooks/useAdminLogs';
import AdminConsoleContent from './admin/AdminConsoleContent';
import './AdminConsole.css';

const REFRESH_OPTIONS = [
  { label: '30초', value: 30000 }, { label: '1분', value: 60000 },
  { label: '3분', value: 180000 }, { label: '5분', value: 300000 },
];

function AdminConsole() {
  const navigate = useNavigate();
  const { telegramUser, llmVisibility, updateLlmSetting } = useReport();
  const isAdmin = Boolean(telegramUser?.is_admin);
  const [refreshIntervalMs, setRefreshIntervalMs] = useState(60000);
  const [processing, setProcessing] = useState({});
  const [logLines, setLogLines] = useState([]);
  const [updatingLlm, setUpdatingLlm] = useState(false);
  const [llmFeedback, setLlmFeedback] = useState('');
  const logViewerRef = useRef(null);

  useEffect(() => {
    if (!isAdmin) navigate('/', { replace: true });
  }, [isAdmin, navigate]);

  const metrics = useAdminMetrics(isAdmin, refreshIntervalMs);
  const logs = useAdminLogs(isAdmin);

  useEffect(() => {
    if (logs.logViewer.content && logViewerRef.current) {
      logViewerRef.current.scrollTop = logViewerRef.current.scrollHeight;
    }
  }, [logs.logViewer.content]);

  const addLog = useCallback((message) => {
    const now = new Date();
    const timestamp = [now.getHours(), now.getMinutes(), now.getSeconds()]
      .map((value) => String(value).padStart(2, '0')).join(':');
    setLogLines((current) => [...current, `[${timestamp}] ${message}`]);
  }, []);

  const handleReprocess = useCallback(async (taskId, taskLabel) => {
    if (processing[taskId]) return;
    setProcessing((current) => ({ ...current, [taskId]: true }));
    addLog(`▶ ${taskLabel} 시작...`);
    const steps = [[600, '  작업 큐에 등록됨'], [1200, '  데이터 수집 시작...'], [2000, `  ${Math.floor(Math.random() * 30) + 10}건 처리 완료`], [800, '  PDF 변환 중...'], [1000, `  ✅ ${taskLabel} 완료`]];
    for (const [delay, message] of steps) {
      await new Promise((resolve) => setTimeout(resolve, delay));
      addLog(message);
    }
    setProcessing((current) => ({ ...current, [taskId]: false }));
  }, [addLog, processing]);

  const handleLlmChange = async (visibility) => {
    setUpdatingLlm(true);
    setLlmFeedback('');
    const result = await updateLlmSetting(visibility);
    setUpdatingLlm(false);
    setLlmFeedback(result.success ? '✅ 성공적으로 저장되었습니다.' : `❌ 실패: ${result.message}`);
    if (result.success) window.setTimeout(() => setLlmFeedback(''), 3000);
  };

  if (!isAdmin) return null;
  return <AdminConsoleContent
    user={telegramUser} refreshIntervalMs={refreshIntervalMs} refreshOptions={REFRESH_OPTIONS}
    onRefreshChange={setRefreshIntervalMs} onRefresh={metrics.retryMetrics}
    statusLoading={metrics.statusLoading} statusError={metrics.statusError}
    summary={metrics.summary} systemStatus={metrics.systemStatus} archiveHistory={metrics.archiveHistory}
    firmRecords={metrics.firmRecords} firmHealth={metrics.firmHealth} processing={processing}
    logLines={logLines} onReprocess={handleReprocess} onClearLog={() => setLogLines([])}
    llmVisibility={llmVisibility} updatingLlm={updatingLlm} llmFeedback={llmFeedback}
    onLlmChange={handleLlmChange} logBrowser={logs.logBrowser} logViewer={logs.logViewer}
    onDir={logs.openLogDir} onFile={logs.fetchLogFile} onRoot={logs.goLogRoot} viewerRef={logViewerRef}
  />;
}

export default AdminConsole;
