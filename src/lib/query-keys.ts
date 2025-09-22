import { StackAIListResourcesRequest, ListFilesRequest } from '@/types/api';

// Stack AI Query Keys
export const stackAIKeys = {
  all: ['stackai'] as const,
  connections: () => [...stackAIKeys.all, 'connections'] as const,
  resources: () => [...stackAIKeys.all, 'resources'] as const,
  resourceList: (params: StackAIListResourcesRequest) => [...stackAIKeys.resources(), params] as const,
  knowledgeBases: () => [...stackAIKeys.all, 'knowledge-bases'] as const,
  knowledgeBaseResources: (kbId: string, path: string) => [...stackAIKeys.knowledgeBases(), kbId, 'resources', path] as const,
};

// Legacy Query Keys (for backward compatibility)
export const fileKeys = {
  all: ['files'] as const,
  lists: () => [...fileKeys.all, 'list'] as const,
  list: (params: ListFilesRequest) => [...fileKeys.lists(), params] as const,
  indexedFiles: (knowledgeBaseId?: string) => ['indexed-files', knowledgeBaseId] as const,
  knowledgeBases: () => ['knowledge-bases'] as const,
};
