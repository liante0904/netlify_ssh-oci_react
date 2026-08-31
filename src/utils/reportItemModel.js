export function hasSummaryText(value) {
  return typeof value === 'string' && value.trim() !== '';
}

export function getReportPresentation(report, { isAdmin, telegramUser, llmVisibility }) {
  const hasSummary = hasSummaryText(report?.gemini_summary)
    && (llmVisibility === 'telegram' ? Boolean(telegramUser) : Boolean(isAdmin));
  const hasFnguideSummary = hasSummaryText(report?.fnguide_summary?.summary_text);
  const hasCompanyContext = report?.report_type === 'COMPANY'
    || Boolean(report?.stock_tickers?.length) || Boolean(report?.stock_names?.length);
  const hasUnverifiedValuation = !report?.fnguide_summary && hasCompanyContext
    && Boolean(report?.target_price || report?.rating || report?.revision_type);
  return {
    hasSummary,
    hasFnguideSummary,
    hasAnySummary: hasSummary || hasFnguideSummary,
    hasUnverifiedValuation,
    hasDirectSignal: Boolean(hasUnverifiedValuation || report?.report_type || report?.stock_tickers?.length),
    formattedTargetPrice: Number.isFinite(Number(report?.target_price)) && Number(report.target_price) > 0
      ? Number(report.target_price).toLocaleString('ko-KR') : null,
  };
}
