export function hasReportSummary(report) {
  const summary = report?.gemini_summary;
  return typeof summary === 'string' && summary.trim() !== '';
}

export function flattenReportGroup(items) {
  if (Array.isArray(items)) return items;
  return Object.values(items || {}).flatMap((group) => Array.isArray(group) ? group : []);
}

export function countReportGroups(reports) {
  return Object.values(reports || {}).reduce((total, items) => total + flattenReportGroup(items).length, 0);
}

export function datesWithReports(reports, predicate = () => true) {
  return Object.keys(reports || {})
    .sort((a, b) => b.localeCompare(a))
    .filter((date) => flattenReportGroup(reports[date]).some(predicate));
}
