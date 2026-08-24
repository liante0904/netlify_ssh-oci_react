import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CONFIG } from '../constants/config';
import { request } from '../utils/api';

export function useLlmVisibilityMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ['llm-visibility', 'update'],
    mutationFn: async (visibility) => {
      const data = await request(CONFIG.API.ADMIN_LLM_SETTING_URL, {
        method: 'POST',
        body: JSON.stringify({ visibility }),
      });
      if (!data || data.status !== 'success') {
        throw new Error('Invalid response');
      }
      return { visibility };
    },
    onSuccess: ({ visibility }) => {
      queryClient.setQueryData(['llm-visibility'], { visibility });
    },
  });
}
