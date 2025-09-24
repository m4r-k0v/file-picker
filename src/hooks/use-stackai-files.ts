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
  const isAuthenticated = stackAIClient.isAuthenticated();
  const connectionId = stackAIClient.getConnectionId();
  const queryEnabled = isAuthenticated && !!connectionId;
  
  console.log('🔍 useFiles - Debug Info:', {
    isAuthenticated,
    connectionId,
    authToken: stackAIClient.getAuthToken() ? 'present' : 'missing',
    queryEnabled,
    params
  });

  return useQuery({
    queryKey: ['files-ui', params],
    queryFn: () => {
      console.log('📝 useFiles - queryFn called, about to call getFilesForUI');
      return stackAIClient.getFilesForUI(params);
    },
    enabled: queryEnabled,
    onSuccess: (data) => {
      console.log('✅ useFiles - Query succeeded with', data?.files?.length || 0, 'files');
    },
    onError: (error) => {
      console.error('❌ useFiles - Query failed:', error);
    },
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
          
        
        return { resourceIds, indexedFolders };
      } catch (error) {
        // Silently handle error when no knowledge base exists yet
        // This is expected behavior when user hasn't created a knowledge base
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
      // Error is handled by mutation error state
    },
  });
}

export function useIndexFile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ fileId }: { fileId: string }) => {
      console.log('📝 useIndexFile - Starting indexing for fileId:', fileId);
      
      const connectionId = stackAIClient.getConnectionId();
      if (!connectionId) {
        console.error('❌ No connection available');
        throw new Error('No connection available');
      }

      console.log('📝 useIndexFile - Using connectionId:', connectionId);
      let knowledgeBaseId = stackAIClient.getKnowledgeBaseId();
      console.log('📝 useIndexFile - Current knowledgeBaseId:', knowledgeBaseId);
      
      // If no knowledge base exists, create one
      if (!knowledgeBaseId) {
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
      } else {
        // Add resource to existing knowledge base by creating a new KB with all current resources + new resource
        // Note: Stack AI API doesn't support adding individual resources to existing KB,
        // so we need to recreate the KB with all resources
        const currentKbResources = await stackAIClient.listKnowledgeBaseResources(knowledgeBaseId);
        const existingFileIds = currentKbResources.data.map(r => r.resource_id);
        const allFileIds = [...existingFileIds, fileId];
        
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
      }
      
      // Sync the knowledge base to start indexing
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
      // Error is handled by mutation error state
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
      // Error is handled by mutation error state
    },
  });
}

// Bulk operations
export function useBulkIndexFiles() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ fileIds }: { fileIds: string[] }) => {
      console.log('📝 useBulkIndexFiles - Starting bulk index for resources:', fileIds);
      
      const connectionId = stackAIClient.getConnectionId();
      if (!connectionId) {
        console.error('❌ No connection available for bulk indexing');
        throw new Error('No connection available');
      }

      console.log('📝 useBulkIndexFiles - Using connectionId:', connectionId);
      let knowledgeBaseId = stackAIClient.getKnowledgeBaseId();
      
      // Get existing resources if KB exists
      let existingFileIds: string[] = [];
      if (knowledgeBaseId) {
        try {
          const currentKbResources = await stackAIClient.listKnowledgeBaseResources(knowledgeBaseId);
          existingFileIds = currentKbResources.data.map(r => r.resource_id);
        } catch (error) {
          // If failed to get existing resources, create new KB
          knowledgeBaseId = undefined;
        }
      }

      // Combine existing + new files (remove duplicates)
      const allFileIds = [...new Set([...existingFileIds, ...fileIds])];
      
      // Create new knowledge base with all resources
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
      
      // Sync the knowledge base to start indexing
      await stackAIClient.syncKnowledgeBase(knowledgeBaseId);

      return { 
        success: true, 
        indexedAt: new Date().toISOString(),
        knowledgeBaseId,
        fileIds: fileIds
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
      // Error is handled by mutation error state
    },
  });
}

export function useBulkDeIndexFiles() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ fileIds }: { fileIds: string[] }) => {
      const kbId = stackAIClient.getKnowledgeBaseId();
      if (!kbId) throw new Error('No knowledge base selected');


      // Get current resources
      const currentKbResources = await stackAIClient.listKnowledgeBaseResources(kbId);
      const existingFileIds = currentKbResources.data.map(r => r.resource_id);
      
      // Remove the specified files from the list
      const remainingFileIds = existingFileIds.filter(id => !fileIds.includes(id));

      if (remainingFileIds.length === 0) {
        // If no files left, we could delete the KB or leave it empty
        // No resources left, keeping empty KB
        return { success: true, removedFileIds: fileIds };
      }

      // Create new KB with remaining files
      const connectionId = stackAIClient.getConnectionId();
      if (!connectionId) {
        throw new Error('No connection available');
      }

      const kb = await stackAIClient.createKnowledgeBase({
        connection_id: connectionId,
        connection_source_ids: remainingFileIds,
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
      
      const newKbId = kb.knowledge_base_id;
      stackAIClient.setKnowledgeBaseId(newKbId);
      
      // Sync the updated knowledge base
      await stackAIClient.syncKnowledgeBase(newKbId);

      return { success: true, removedFileIds: fileIds };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['files-ui'] });
      queryClient.invalidateQueries({ queryKey: ['indexed-files'] });
      queryClient.invalidateQueries({ queryKey: stackAIKeys.knowledgeBases() });
      
      // Force immediate refetch to update UI
      queryClient.refetchQueries({ queryKey: ['files-ui'] });
      queryClient.refetchQueries({ queryKey: ['indexed-files'] });
    },
    onError: (error) => {
      // Error is handled by mutation error state
    },
  });
}