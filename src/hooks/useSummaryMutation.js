import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CONFIG } from '../constants/config';
import { request } from '../utils/api';

export function useSummaryMutation() {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: ({ reportId, engine, force }) => request(
      `${CONFIG.API.BASE_URL}/admin/reports/${reportId}/summarize?engine=${engine}${force ? '&force=true' : ''}`,
      { method: 'POST', skipAuth: false, timeout: 180000 }
    ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reports'] });
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  return {
    triggerSummary: mutation.mutateAsync,
    isSummarizing: mutation.isPending,
  };
}
