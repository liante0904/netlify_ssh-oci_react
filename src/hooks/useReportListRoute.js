import { useLocation } from 'react-router-dom';
import { useReport } from '../context/useReport';
import { getReportSectionByPath } from '../constants/reportSections';

export function useReportListRoute() {
  const { searchQuery, sortBy, setSortBy, telegramUser, handleSearch } = useReport();
  const location = useLocation();
  const { pathname } = location;
  return { searchQuery, sortBy, setSortBy, telegramUser, handleSearch, location, pathname, isAdmin: telegramUser?.is_admin === true, isFavoritesPage: pathname.includes('favorites'), isAiSummary: pathname.includes('ai-summary'), isOutlook: pathname.includes('outlook'), isRecent: pathname === '/recent', meta: getReportSectionByPath(pathname) || {} };
}
