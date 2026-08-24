import { useQuery } from '@tanstack/react-query';
import { CONFIG } from '../constants/config';
import { request } from '../utils/api';

export function useCompanies() {
  const query = useQuery({
    queryKey: ['companies'],
    queryFn: ({ signal }) => request(CONFIG.API.COMPANIES_URL, { skipAuth: true, signal }),
    staleTime: 5 * 60_000,
  });

  return {
    companies: Array.isArray(query.data) ? query.data : [],
    isLoadingCompanies: query.isPending,
    companiesError: query.error,
    retryCompanies: query.refetch,
  };
}
