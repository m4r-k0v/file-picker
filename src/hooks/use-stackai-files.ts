'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { stackAIClient } from '@/lib/stackai-client';
import { stackAIKeys } from '@/lib/query-keys';
import {
  StackAIListResourcesRequest,
  StackAIKnowledgeBaseCreateRequest,
} from '@/types/api';

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
      console.log('🔍 useIndexedFiles - Knowledge Base ID:', kbId);
      
      if (!kbId) return { resourceIds: [], indexedFolders: [] };

      try {
        const response = await stackAIClient.listKnowledgeBaseResources(kbId);
        const resources = response.data;
        const resourceIds = resources.map(r => r.resource_id);
        
        // Separate folders from files for better filtering
        const indexedFolders = resources
          .filter(r => r.inode_type === 'directory')
          .map(r => ({
            id: r.resource_id,
            path: r.inode_path.path
          }));
          
        console.log('🔍 useIndexedFiles - Found indexed resources:', resourceIds);
        console.log('🔍 useIndexedFiles - Found indexed folders:', indexedFolders);
        console.log('🔍 useIndexedFiles - Full response:', resources);
        
        return { resourceIds, indexedFolders };
      } catch (error) {
        console.error('🔍 useIndexedFiles - Error:', error);
        return { resourceIds: [], indexedFolders: [] };
      }
    },
    enabled: stackAIClient.isAuthenticated(),
  });
}

export function useDeleteFile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ fileId, resourcePath }: { fileId: string; resourcePath?: string }) => {
      // For Stack AI, this removes the file from the knowledge base
      const kbId = stackAIClient.getKnowledgeBaseId();
      if (!kbId) throw new Error('No knowledge base selected');

      // Use resourcePath if provided, otherwise try to use fileId as path
      // In a real implementation, you'd maintain a mapping of fileId to resourcePath
      const pathToDelete = resourcePath || fileId;
      
      await stackAIClient.deleteKnowledgeBaseResource(kbId, pathToDelete);
      return { success: true, deletedPath: pathToDelete };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['files-ui'] });
      queryClient.invalidateQueries({ queryKey: ['indexed-files'] });
      queryClient.invalidateQueries({ queryKey: stackAIKeys.knowledgeBases() });
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
      const connectionId = stackAIClient.getConnectionId();
      if (!connectionId) {
        throw new Error('No connection available');
      }

      let knowledgeBaseId = stackAIClient.getKnowledgeBaseId();
      console.log('📝 useIndexFile - Starting index for resource:', fileId);
      console.log('📝 useIndexFile - Current KB ID:', knowledgeBaseId);
      
      // If no knowledge base exists, create one
      if (!knowledgeBaseId) {
        console.log('📝 useIndexFile - Creating new KB for first resource');
        const kb = await stackAIClient.createKnowledgeBase({
          connection_id: connectionId,
          connection_source_ids: [fileId],
          indexing_params: {
            ocr: false,
            unstructured: true,
            embedding_params: {
              embedding_model: 'text-embedding-ada-002',
            },
            chunker_params: {
              chunk_size: 1500,
              chunk_overlap: 500,
              chunker: 'sentence',
            },
          },
        });
        
        knowledgeBaseId = kb.knowledge_base_id;
        stackAIClient.setKnowledgeBaseId(knowledgeBaseId);
        console.log('📝 useIndexFile - New KB created:', knowledgeBaseId);
      } else {
        console.log('📝 useIndexFile - Adding to existing KB');
        // Add resource to existing knowledge base by creating a new KB with all current resources + new resource
        // Note: Stack AI API doesn't support adding individual resources to existing KB,
        // so we need to recreate the KB with all resources
        const currentKbResources = await stackAIClient.listKnowledgeBaseResources(knowledgeBaseId);
        const existingFileIds = currentKbResources.data.map(r => r.resource_id);
        console.log('📝 useIndexFile - Existing resources in KB:', existingFileIds);
        const allFileIds = [...existingFileIds, fileId];
        console.log('📝 useIndexFile - All resources for new KB:', allFileIds);
        
        const kb = await stackAIClient.createKnowledgeBase({
          connection_id: connectionId,
          connection_source_ids: allFileIds,
          indexing_params: {
            ocr: false,
            unstructured: true,
            embedding_params: {
              embedding_model: 'text-embedding-ada-002',
            },
            chunker_params: {
              chunk_size: 1500,
              chunk_overlap: 500,
              chunker: 'sentence',
            },
          },
        });
        
        knowledgeBaseId = kb.knowledge_base_id;
        stackAIClient.setKnowledgeBaseId(knowledgeBaseId);
        console.log('📝 useIndexFile - Updated KB created:', knowledgeBaseId);
      }
      
      // Sync the knowledge base to start indexing
      console.log('📝 useIndexFile - Syncing KB:', knowledgeBaseId);
      await stackAIClient.syncKnowledgeBase(knowledgeBaseId);

      return { 
        success: true, 
        indexedAt: new Date().toISOString(),
        knowledgeBaseId,
        fileId 
      };
    },
    onSuccess: () => {
      // Invalidate and refetch all relevant queries
      queryClient.invalidateQueries({ queryKey: ['files-ui'] });
      queryClient.invalidateQueries({ queryKey: ['indexed-files'] });
      queryClient.invalidateQueries({ queryKey: stackAIKeys.knowledgeBases() });
      
      // Force immediate refetch to update UI
      queryClient.refetchQueries({ queryKey: ['files-ui'] });
      queryClient.refetchQueries({ queryKey: ['indexed-files'] });
    },
    onError: (error) => {
      console.error('Failed to index file:', error);
    },
  });
}

export function useDeIndexFile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ fileId, resourcePath }: { fileId: string; resourcePath?: string }) => {
      const kbId = stackAIClient.getKnowledgeBaseId();
      if (!kbId) throw new Error('No knowledge base selected');

      // Use resourcePath if provided, otherwise try to use fileId as path
      // In a real implementation, you'd maintain a mapping of fileId to resourcePath
      const pathToRemove = resourcePath || fileId;

      // Remove from knowledge base
      await stackAIClient.deleteKnowledgeBaseResource(kbId, pathToRemove);
      return { success: true, removedPath: pathToRemove };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['files-ui'] });
      queryClient.invalidateQueries({ queryKey: ['indexed-files'] });
      queryClient.invalidateQueries({ queryKey: stackAIKeys.knowledgeBases() });
    },
    onError: (error) => {
      console.error('Failed to de-index file:', error);
    },
  });
}