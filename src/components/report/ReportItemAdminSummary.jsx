import React from 'react';

export default function ReportItemAdminSummary({ id, report, hasSummary, isSummaryRequested, isSummaryCompleted, onTriggerSummary, showToast }) {
  const [showConfirm, setShowConfirm] = React.useState(null);
  if (!(!isSummaryRequested && !isSummaryCompleted)) return <div className="admin-summary-section"><span className="admin-summary-label">AI 요약 요청:</span>{isSummaryRequested && <span className="summary-requested-badge">요청됨</span>}{isSummaryCompleted && <span className="summary-completed-badge">✓</span>}</div>;
  const request = () => {
    const engine = showConfirm;
    setShowConfirm(null);
    showToast(hasSummary ? '기존 요약이 존재하여 AI 재처리 요약을 요청합니다...' : 'AI 요약 요청을 시작합니다...');
    onTriggerSummary(id, engine, hasSummary, report);
  };
  return <div className="admin-summary-section"><span className="admin-summary-label">AI 요약 요청:</span><span className="admin-summary-confirm"><button className={`admin-summary-btn deepseek-btn ${showConfirm === 'deepseek' ? 'active' : ''}`} onClick={() => setShowConfirm(showConfirm === 'deepseek' ? null : 'deepseek')} title={hasSummary ? 'DeepSeek AI 요약 재처리 요청' : 'DeepSeek AI 요약 생성'}><span className="summary-btn-icon summary-btn-icon-deepseek">!</span><span>DeepSeek</span></button><button className={`admin-summary-btn antigravity-btn ${showConfirm === 'ag' ? 'active' : ''}`} onClick={() => setShowConfirm(showConfirm === 'ag' ? null : 'ag')} title={hasSummary ? 'Gemini AI 요약 재처리 요청' : 'Gemini AI 요약 생성'}><span className="summary-btn-icon summary-btn-icon-gemini">▲</span><span>Gemini</span></button>{showConfirm && <span className="admin-summary-confirm-btns-wrapper">{hasSummary && <span className="re-summarize-tooltip">⚠️ 이미 요약이 존재합니다. 재처리하시겠습니까?</span>}<span className="admin-summary-confirm-btns"><button className="confirm-yes" onClick={request}>✓</button><button className="confirm-no" onClick={() => setShowConfirm(null)}>✗</button></span></span>}</span></div>;
}
