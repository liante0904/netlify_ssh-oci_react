export function groupFnGuideSummaries(summaries) {
  const dateMap = new Map();
  summaries.forEach((item) => { const date = item.report_date || '날짜 미상'; if (!dateMap.has(date)) dateMap.set(date, new Map()); const companyKey = item.company_code || item.company_name || `summary-${item.summary_id}`; const companyMap = dateMap.get(date); if (!companyMap.has(companyKey)) companyMap.set(companyKey, { key: companyKey, companyName: item.company_name || '종목 미상', companyCode: item.company_code || '', items: [] }); companyMap.get(companyKey).items.push(item); });
  return Array.from(dateMap, ([date, companyMap]) => { const companyGroups = Array.from(companyMap.values()); return { date, reportCount: companyGroups.reduce((sum, group) => sum + group.items.length, 0), repeated: companyGroups.filter((group) => group.items.length > 1).sort((a, b) => b.items.length - a.items.length), singles: companyGroups.filter((group) => group.items.length === 1) }; });
}
