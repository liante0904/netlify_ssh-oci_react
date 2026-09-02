import { useCallback, useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { CONFIG } from '../constants/config';
import { request } from '../utils/api';
import { useLlmVisibilityMutation } from './useLlmVisibilityMutation';

export function useLlmVisibilitySettings() {
  const [llmVisibility, setLlmVisibility] = useState('admin');
  const llmSettingQuery = useQuery({ queryKey: ['llm-visibility'], queryFn: () => request(CONFIG.API.LLM_SETTING_URL), staleTime: 60_000 });
  const mutation = useLlmVisibilityMutation();

  useEffect(() => {
    if (llmSettingQuery.data?.visibility) setLlmVisibility(llmSettingQuery.data.visibility);
  }, [llmSettingQuery.data]);

  const updateLlmSetting = useCallback(async (newVisibility) => {
    try {
      const data = await mutation.mutateAsync(newVisibility);
      setLlmVisibility(data.visibility);
      return { success: true, visibility: data.visibility };
    } catch (error) {
      console.error('Failed to update LLM visibility setting:', error);
      return { success: false, message: error.message };
    }
  }, [mutation]);

  return { llmVisibility, updateLlmSetting };
}
