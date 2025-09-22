// Stack AI Resource type
export type StackAIResource = {
  resource_id: string;
  inode_type: 'file' | 'directory';
  inode_path: {
    path: string;
  };
  status?: 'pending' | 'indexed' | 'failed';
  created_at?: string;
  updated_at?: string;
  mime_type?: string;
  size?: number;
}

// Legacy DriveItem type for compatibility
export type DriveItem = {
  id: string;
  name: string;
  type: 'file' | 'folder';
  mimeType?: string;
  size?: number;
  createdTime: string;
  modifiedTime: string;
  parentId?: string;
  webViewLink?: string;
  iconLink?: string;
  isIndexed?: boolean;
}

// Stack AI API Response types
export type StackAIConnection = {
  connection_id: string;
  name: string;
  connection_provider: string;
  created_at: string;
  updated_at: string;
}

export type StackAIResourcesResponse = {
  data: StackAIResource[];
  next_cursor?: string;
  current_cursor?: string;
}

export type StackAIKnowledgeBase = {
  knowledge_base_id: string;
  connection_id: string;
  connection_source_ids: string[];
  indexing_params: {
    ocr: boolean;
    unstructured: boolean;
    embedding_params: {
      embedding_model: string;
      api_key?: string;
    };
    chunker_params: {
      chunk_size: number;
      chunk_overlap: number;
      chunker: string;
    };
  };
  org_level_role?: string;
  cron_job_id?: string;
}

// Legacy API Response types for compatibility
export type ListFilesResponse = {
  files: DriveItem[];
  nextPageToken?: string;
  hasMore?: boolean;
}

export type ApiError = {
  error: string;
  message: string;
  statusCode: number;
}

// Stack AI API Request types
export type StackAIAuthRequest = {
  email: string;
  password: string;
}

export type StackAIListResourcesRequest = {
  resource_id?: string; // For listing children of a specific resource
  resource_path?: string; // Alternative way to specify path
  cursor?: string; // For pagination
}

export type StackAIKnowledgeBaseCreateRequest = {
  connection_id: string;
  connection_source_ids: string[];
  indexing_params: {
    ocr: boolean;
    unstructured: boolean;
    embedding_params: {
      embedding_model: string;
      api_key?: string;
    };
    chunker_params: {
      chunk_size: number;
      chunk_overlap: number;
      chunker: string;
    };
  };
  org_level_role?: string;
  cron_job_id?: string;
}

// Legacy API Request types for compatibility
export type ListFilesRequest = {
  folderId?: string; // If not provided, lists root folder
  pageToken?: string;
  pageSize?: number;
  orderBy?: 'name' | 'createdTime' | 'modifiedTime' | 'size';
  sortDirection?: 'asc' | 'desc';
  nameFilter?: string; // For searching by name
}

export type DeleteFileRequest = {
  fileId: string;
}

export type IndexFileRequest = {
  fileId: string;
  knowledgeBaseId?: string;
}

export type DeIndexFileRequest = {
  fileId: string;
  knowledgeBaseId?: string;
}

// Knowledge Base related types
export type KnowledgeBase = {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export type IndexedFile = {
  fileId: string;
  knowledgeBaseId: string;
  indexedAt: string;
  status: 'indexed' | 'indexing' | 'failed';
}

// Sorting and filtering types
export type SortField = 'name' | 'createdTime' | 'modifiedTime' | 'size';
export type SortDirection = 'asc' | 'desc';

export type SortConfig = {
  field: SortField;
  direction: SortDirection;
}

export type FilterConfig = {
  nameFilter?: string;
  typeFilter?: 'all' | 'files' | 'folders';
  indexedFilter?: 'all' | 'indexed' | 'not-indexed';
}
