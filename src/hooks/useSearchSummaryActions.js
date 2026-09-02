import { useCallback, useState } from 'react';
import { CONFIG } from '../constants/config';

const SUMMARY_NOTIFICATION_EVENT = 'ssh-summary-notification';

function emitSummaryNotification(detail) {
  window.dispatchEvent(new CustomEvent(SUMMARY_NOTIFICATION_EVENT, {
    detail: { created_at: new Date().toISOString(), ...detail }
  }));
}

export function useSearchSummaryActions(triggerSummary) {
  const [summaryRequestedIds, setSummaryRequestedIds] = useState(() => new Set());
  const [summaryCompletedIds, setSummaryCompletedIds] = useState(() => new Set());

  const reset = useCallback(() => {
    setSummaryRequestedIds(new Set());
    setSummaryCompletedIds(new Set());
  }, []);

  const handleTriggerSummary = useCallback(async (reportId, engine = 'deepseek', force = false, report = null) => {
    const token = localStorage.getItem(CONFIG.STORAGE_KEYS.AUTH_TOKEN);
    if (!token) return;
    const title = report?.title || report?.article_title || `리포트 #${reportId}`;
    const firm = report?.firm || report?.firm_nm || '';
    const modelLabel = engine === 'ag' ? 'Gemini' : 'DeepSeek';

    if (force) {
      setSummaryCompletedIds((prev) => { const next = new Set(prev); next.delete(reportId); return next; });
      setSummaryRequestedIds((prev) => { const next = new Set(prev); next.delete(reportId); return next; });
    } else if (summaryRequestedIds.has(reportId)) {
      return;
    }

    setSummaryRequestedIds((prev) => new Set(prev).add(reportId));
    emitSummaryNotification({ report_id: reportId, article_title: title, firm_nm: firm, summary_model: engine === 'ag' ? 'gemini' : engine, status: 'requested', message: `${modelLabel} 요약 요청을 접수했습니다: ${title}` });
    try {
      const result = await triggerSummary({ reportId, engine, force });
      if (result?.status === 'success' || result?.status === 'skipped') {
        setSummaryCompletedIds((prev) => new Set(prev).add(reportId));
        emitSummaryNotification({ report_id: reportId, article_title: title, firm_nm: firm, summary_model: engine === 'ag' ? 'gemini' : engine, status: result.status === 'skipped' ? 'skipped' : 'completed', message: `${modelLabel} 요약이 ${result.status === 'skipped' ? '이미 완료되어 있습니다' : '완료되었습니다'}: ${title}` });
      }
    } catch (error) {
      console.error('[Admin] ❌ 요약 실패:', error.message);
      setSummaryRequestedIds((prev) => { const next = new Set(prev); next.delete(reportId); return next; });
      emitSummaryNotification({ report_id: reportId, article_title: title, firm_nm: firm, summary_model: engine === 'ag' ? 'gemini' : engine, status: 'failed', message: `${modelLabel} 요약 요청에 실패했습니다: ${title}` });
    }
  }, [summaryRequestedIds, triggerSummary]);

  return { summaryRequestedIds, summaryCompletedIds, handleTriggerSummary, reset };
}
