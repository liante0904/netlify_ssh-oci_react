import { getFirmOrderByName } from '../constants/firms';

export function getReportsArray(items) {
  return Array.isArray(items) ? items : Object.values(items || {}).flat();
}

export function getCompanyGroups(items) {
  const grouped = new Map();
  getReportsArray(items).forEach((report) => {
    const firm = report.firm || 'Unknown';
    if (!grouped.has(firm)) grouped.set(firm, []);
    grouped.get(firm).push(report);
  });
  return Array.from(grouped.entries()).sort(([firmA], [firmB]) => {
    const orderA = getFirmOrderByName(firmA);
    const orderB = getFirmOrderByName(firmB);
    return (orderA === null ? Number.MAX_SAFE_INTEGER : orderA) - (orderB === null ? Number.MAX_SAFE_INTEGER : orderB) || firmA.localeCompare(firmB, 'ko');
  });
}
