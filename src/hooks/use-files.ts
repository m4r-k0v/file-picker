'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { fileKeys } from '@/lib/query-keys';
import {
  ListFilesRequest,
  DeleteFileRequest,
  IndexFileRequest,
  DeIndexFileRequest,
} from '@/types/api';


export function useFiles(params: ListFilesRequest = {}) {
  return useQuery({
    queryKey: fileKeys.list(params),
    queryFn: () => apiClient.listFiles(params),
  });
}

export function useIndexedFiles(knowledgeBaseId?: string) {
  return useQuery({
    queryKey: fileKeys.indexedFiles(knowledgeBaseId),
    queryFn: () => apiClient.getIndexedFiles(knowledgeBaseId),
  });
}

export function useKnowledgeBases() {
  return useQuery({
    queryKey: fileKeys.knowledgeBases(),
    queryFn: () => apiClient.getKnowledgeBases(),
  });
}


export function useDeleteFile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: DeleteFileRequest) => apiClient.deleteFile(params),
    onSuccess: () => {
      
      queryClient.invalidateQueries({ queryKey: fileKeys.lists() });
    },
  });
}

export function useIndexFile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: IndexFileRequest) => apiClient.indexFile(params),
    onSuccess: () => {
      
      queryClient.invalidateQueries({ queryKey: fileKeys.indexedFiles() });
      queryClient.invalidateQueries({ queryKey: fileKeys.lists() });
    },
  });
}

export function useDeIndexFile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: DeIndexFileRequest) => apiClient.deIndexFile(params),
    onSuccess: () => {
      
      queryClient.invalidateQueries({ queryKey: fileKeys.indexedFiles() });
      queryClient.invalidateQueries({ queryKey: fileKeys.lists() });
    },
  });
}
