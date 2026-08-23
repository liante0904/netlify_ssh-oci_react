import { useQuery } from '@tanstack/react-query';
import { CONFIG } from '../constants/config';
import { request } from '../utils/api';

export function useBoards(companyOrder) {
  const query = useQuery({
    queryKey: ['boards', companyOrder ?? null],
    enabled: Boolean(companyOrder),
    queryFn: async ({ signal }) => {
      const data = await request(`${CONFIG.API.BOARDS_URL}?company=${companyOrder}`, { signal });
      return Array.isArray(data) ? data.filter((board) => board.report_count > 0) : [];
    },
  });

  return {
    boards: query.data || [],
    isLoadingBoards: query.isPending,
    boardsError: query.error,
    retryBoards: query.refetch,
  };
}
