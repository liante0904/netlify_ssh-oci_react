import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { CONFIG } from '../constants/config';
import { request } from '../utils/api';

export function useAdminLogs(enabled) {
  const [directoryPath, setDirectoryPath] = useState(null);
  const [viewerRequest, setViewerRequest] = useState(null);

  const directoryQuery = useQuery({
    queryKey: ['admin', 'logs', directoryPath],
    queryFn: ({ signal }) => {
      const params = directoryPath ? `?path=${encodeURIComponent(directoryPath)}` : '';
      return request(`${CONFIG.API.BASE_URL}/admin/logs${params}`, { skipAuth: false, signal });
    },
    enabled,
    staleTime: 15_000,
  });

  const viewerQuery = useQuery({
    queryKey: ['admin', 'log-view', viewerRequest],
    queryFn: ({ signal }) => {
      const params = new URLSearchParams({
        file: viewerRequest.filePath,
        lines: String(viewerRequest.lines),
        tail: String(viewerRequest.tail),
      });
      return request(`${CONFIG.API.BASE_URL}/admin/logs/view?${params}`, { skipAuth: false, signal });
    },
    enabled: Boolean(enabled && viewerRequest?.filePath),
    staleTime: 5_000,
  });

  const openLogDir = (path) => {
    setViewerRequest(null);
    setDirectoryPath(path || null);
  };

  const fetchLogFile = (filePath, options = {}) => {
    setViewerRequest({
      filePath,
      tail: Boolean(options.tail),
      lines: options.lines || 500,
    });
  };

  return {
    logBrowser: {
      entries: directoryQuery.data?.entries || [],
      currentPath: directoryQuery.data?.current_path || null,
      loading: directoryQuery.isPending || directoryQuery.isFetching,
      error: directoryQuery.error?.message || null,
    },
    logViewer: {
      file: viewerRequest?.filePath || null,
      content: viewerQuery.data?.content || '',
      loading: viewerQuery.isPending || viewerQuery.isFetching,
      error: viewerQuery.error?.message || null,
    },
    fetchLogDir: directoryQuery.refetch,
    fetchLogFile,
    openLogDir,
    goLogRoot: () => openLogDir(null),
  };
}
