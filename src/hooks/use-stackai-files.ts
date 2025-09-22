'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { stackAIClient } from '@/lib/stackai-client';
import {
  StackAIListResourcesRequest,
  StackAIKnowledgeBaseCreateRequest,
} from '@/types/api';

// Query keys
export const stackAIKeys = {
  all: ['stackai'] as const,
  connections: () => [...stackAIKeys.all, 'connections'] as const,
  resources: () => [...stackAIKeys.all, 'resources'] as const,
  resourceList: (params: StackAIListResourcesRequest) => [...stackAIKeys.resources(), params] as const,
  knowledgeBases: () => [...stackAIKeys.all, 'knowledge-bases'] as const,
  knowledgeBaseResources: (kbId: string, path: string) => [...stackAIKeys.knowledgeBases(), kbId, 'resources', path] as const,
};

// Authentication status
export function useAuthStatus() {
  return {
    isAuthenticated: stackAIClient.isAuthenticated(),
    connectionId: stackAIClient.getConnectionId(),
    knowledgeBaseId: stackAIClient.getKnowledgeBaseId(),
  };
}

// Connections
export function useConnections() {
  return useQuery({
    queryKey: stackAIKeys.connections(),
    queryFn: () => stackAIClient.getConnections(),
    enabled: stackAIClient.isAuthenticated(),
  });
}

// Resources (for file picker)
export function useStackAIResources(params: StackAIListResourcesRequest = {}) {
  return useQuery({
    queryKey: stackAIKeys.resourceList(params),
    queryFn: () => stackAIClient.listResources(params),
    enabled: stackAIClient.isAuthenticated() && !!stackAIClient.getConnectionId(),
  });
}

// Compatibility hook for existing UI
export function useFiles(params: { folderId?: string; nameFilter?: string } = {}) {
  return useQuery({
    queryKey: ['files-ui', params],
    queryFn: () => stackAIClient.getFilesForUI(params),
    enabled: stackAIClient.isAuthenticated() && !!stackAIClient.getConnectionId(),
  });
}

// Knowledge base operations
export function useCreateKnowledgeBase() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: StackAIKnowledgeBaseCreateRequest) => stackAIClient.createKnowledgeBase(params),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: stackAIKeys.knowledgeBases() });
    },
  });
}

export function useSyncKnowledgeBase() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (knowledgeBaseId?: string) => stackAIClient.syncKnowledgeBase(knowledgeBaseId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: stackAIKeys.knowledgeBases() });
    },
  });
}

export function useKnowledgeBaseResources(knowledgeBaseId: string, resourcePath: string = '/') {
  return useQuery({
    queryKey: stackAIKeys.knowledgeBaseResources(knowledgeBaseId, resourcePath),
    queryFn: () => stackAIClient.listKnowledgeBaseResources(knowledgeBaseId, resourcePath),
    enabled: stackAIClient.isAuthenticated() && !!knowledgeBaseId,
  });
}

export function useDeleteKnowledgeBaseResource() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ knowledgeBaseId, resourcePath }: { knowledgeBaseId: string; resourcePath: string }) =>
      stackAIClient.deleteKnowledgeBaseResource(knowledgeBaseId, resourcePath),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: stackAIKeys.knowledgeBases() });
      queryClient.invalidateQueries({ queryKey: ['files-ui'] });
    },
  });
}

// Legacy hooks for compatibility (these will use mock data if not connected to Stack AI)
export function useIndexedFiles() {
  return useQuery({
    queryKey: ['indexed-files'],
    queryFn: async () => {
      const kbId = stackAIClient.getKnowledgeBaseId();
      if (!kbId) return [];
      
      try {
        const response = await stackAIClient.listKnowledgeBaseResources(kbId);
        return response.data.map(r => r.resource_id);
      } catch {
        return [];
      }
    },
    enabled: stackAIClient.isAuthenticated(),
  });
}

export function useDeleteFile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ fileId }: { fileId: string }) => {
      // For Stack AI, this would be removing from knowledge base
      const kbId = stackAIClient.getKnowledgeBaseId();
      if (!kbId) throw new Error('No knowledge base selected');
      
      // We need to find the resource path from the fileId
      // This is a simplified implementation - in practice you'd need to track the path
      return stackAIClient.deleteKnowledgeBaseResource(kbId, fileId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['files-ui'] });
      queryClient.invalidateQueries({ queryKey: ['indexed-files'] });
    },
    onError: (error) => {
      console.error('Failed to delete file:', error);
    },
  });
}

export function useIndexFile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ fileId }: { fileId: string }) => {
      // For Stack AI, indexing happens when creating/syncing knowledge base
      // This is a placeholder - you'd implement the actual indexing logic
      console.log('Indexing file:', fileId);
      return { success: true, indexedAt: new Date().toISOString() };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['files-ui'] });
      queryClient.invalidateQueries({ queryKey: ['indexed-files'] });
    },
    onError: (error) => {
      console.error('Failed to index file:', error);
    },
  });
}

export function useDeIndexFile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ fileId }: { fileId: string }) => {
      const kbId = stackAIClient.getKnowledgeBaseId();
      if (!kbId) throw new Error('No knowledge base selected');
      
      // Remove from knowledge base
      await stackAIClient.deleteKnowledgeBaseResource(kbId, fileId);
      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['files-ui'] });
      queryClient.invalidateQueries({ queryKey: ['indexed-files'] });
    },
    onError: (error) => {
      console.error('Failed to de-index file:', error);
    },
  });
}
