import { getReportPresentation } from './reportItemModel';

export function getReportItemViewModel(report, auth) {
  const presentation = getReportPresentation(report, auth);
  const stockNames = Array.isArray(report?.stock_names) ? report.stock_names : [];
  const tags = Array.isArray(report?.tags) ? report.tags : [];
  const stockTickers = Array.isArray(report?.stock_tickers) ? report.stock_tickers : [];
  const visibleTags = [
    ...(report?.sector ? [{ value: report.sector, type: 'sector' }] : []),
    ...stockNames.slice(0, 3).map((value) => ({ value, type: 'stock' })),
    ...tags
      .filter((value) => value !== report?.sector && !stockNames.includes(value))
      .slice(0, 5)
      .map((value) => ({ value, type: 'keyword' })),
  ];

  return {
    id: report?.id,
    title: report?.title || '',
    writer: report?.writer || '',
    firm: report?.firm || '',
    geminiSummary: report?.gemini_summary,
    fnguideSummary: report?.fnguide_summary,
    rating: report?.rating,
    revisionType: report?.revision_type,
    reportType: report?.report_type,
    stockTickers: stockTickers.slice(0, 3),
    visibleTags,
    canDownloadArchive: report?.pdf_archive?.archive_status === 'ARCHIVED' && Boolean(report?.pdf_archive?.storage_key),
    ...presentation,
  };
}
