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

export function useConnections() {
  return useQuery({
    queryKey: stackAIKeys.connections(),
    queryFn: () => stackAIClient.getConnections(),
    enabled: stackAIClient.isAuthenticated(),
  });
}

export function useStackAIResources(params: StackAIListResourcesRequest = {}) {
  return useQuery({
    queryKey: stackAIKeys.resourceList(params),
    queryFn: () => stackAIClient.listResources(params),
    enabled: stackAIClient.isAuthenticated() && !!stackAIClient.getConnectionId(),
  });
}

export function useFiles(params: { folderId?: string; nameFilter?: string } = {}) {
  const isAuthenticated = stackAIClient.isAuthenticated();
  const connectionId = stackAIClient.getConnectionId();
  const queryEnabled = isAuthenticated && !!connectionId;
  

  return useQuery({
    queryKey: ['files-ui', params],
    queryFn: () => {
      return stackAIClient.getFilesForUI(params);
    },
    enabled: queryEnabled,
  });
}

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
        
        const indexedFolders = resources
          .filter(r => r.inode_type === 'directory')
          .map(r => ({
            id: r.resource_id,
            path: r.inode_path.path
          }));
        
        return { resourceIds, indexedFolders };
      } catch (error) {
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
      const kbId = stackAIClient.getKnowledgeBaseId();
      if (!kbId) throw new Error('No knowledge base selected');

      const pathToDelete = resourcePath || fileId;
      
      await stackAIClient.deleteKnowledgeBaseResource(kbId, pathToDelete);
      return { success: true, deletedPath: pathToDelete };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['files-ui'] });
      queryClient.invalidateQueries({ queryKey: ['indexed-files'] });
      queryClient.invalidateQueries({ queryKey: stackAIKeys.knowledgeBases() });
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
      
      await stackAIClient.syncKnowledgeBase(knowledgeBaseId);

      return { 
        success: true, 
        indexedAt: new Date().toISOString(),
        knowledgeBaseId,
        fileId 
      };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['files-ui'] });
      queryClient.invalidateQueries({ queryKey: ['indexed-files'] });
      queryClient.invalidateQueries({ queryKey: stackAIKeys.knowledgeBases() });
      
      queryClient.refetchQueries({ queryKey: ['files-ui'] });
      queryClient.refetchQueries({ queryKey: ['indexed-files'] });
    },
  });
}

export function useDeIndexFile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ fileId, resourcePath }: { fileId: string; resourcePath?: string }) => {
      const kbId = stackAIClient.getKnowledgeBaseId();
      if (!kbId) throw new Error('No knowledge base selected');

      const pathToRemove = resourcePath || fileId;

      await stackAIClient.deleteKnowledgeBaseResource(kbId, pathToRemove);
      return { success: true, removedPath: pathToRemove };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['files-ui'] });
      queryClient.invalidateQueries({ queryKey: ['indexed-files'] });
      queryClient.invalidateQueries({ queryKey: stackAIKeys.knowledgeBases() });
    },
  });
}

export function useBulkIndexFiles() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ fileIds }: { fileIds: string[] }) => {
      const connectionId = stackAIClient.getConnectionId();
      if (!connectionId) {
        throw new Error('No connection available');
      }
      let knowledgeBaseId = stackAIClient.getKnowledgeBaseId();
      
      let existingFileIds: string[] = [];
      if (knowledgeBaseId) {
        try {
          const currentKbResources = await stackAIClient.listKnowledgeBaseResources(knowledgeBaseId);
          existingFileIds = currentKbResources.data.map(r => r.resource_id);
        } catch (error) {
          knowledgeBaseId = undefined;
        }
      }

      const allFileIds = [...new Set([...existingFileIds, ...fileIds])];
      
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
      
      await stackAIClient.syncKnowledgeBase(knowledgeBaseId);

      return { 
        success: true, 
        indexedAt: new Date().toISOString(),
        knowledgeBaseId,
        fileIds: fileIds
      };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['files-ui'] });
      queryClient.invalidateQueries({ queryKey: ['indexed-files'] });
      queryClient.invalidateQueries({ queryKey: stackAIKeys.knowledgeBases() });
      
      queryClient.refetchQueries({ queryKey: ['files-ui'] });
      queryClient.refetchQueries({ queryKey: ['indexed-files'] });
    },
  });
}

export function useBulkDeIndexFiles() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ fileIds }: { fileIds: string[] }) => {
      const kbId = stackAIClient.getKnowledgeBaseId();
      if (!kbId) throw new Error('No knowledge base selected');


      const currentKbResources = await stackAIClient.listKnowledgeBaseResources(kbId);
      const existingFileIds = currentKbResources.data.map(r => r.resource_id);
      
      const remainingFileIds = existingFileIds.filter(id => !fileIds.includes(id));

      if (remainingFileIds.length === 0) {
        return { success: true, removedFileIds: fileIds };
      }

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
      
      await stackAIClient.syncKnowledgeBase(newKbId);

      return { success: true, removedFileIds: fileIds };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['files-ui'] });
      queryClient.invalidateQueries({ queryKey: ['indexed-files'] });
      queryClient.invalidateQueries({ queryKey: stackAIKeys.knowledgeBases() });
      
      queryClient.refetchQueries({ queryKey: ['files-ui'] });
      queryClient.refetchQueries({ queryKey: ['indexed-files'] });
    },
  });
}