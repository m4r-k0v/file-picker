import {
  ListFilesResponse,
  ListFilesRequest,
  DeleteFileRequest,
  IndexFileRequest,
  DeIndexFileRequest,
  ApiError,
  KnowledgeBase,
} from '@/types/api';


const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000';

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const error: ApiError = {
          error: 'API Error',
          message: `HTTP ${response.status}: ${response.statusText}`,
          statusCode: response.status,
        };
        throw error;
      }

      return await response.json();
    } catch (error) {
      if (error instanceof Error) {
        throw {
          error: 'Network Error',
          message: error.message,
          statusCode: 0,
        } as ApiError;
      }
      throw error;
    }
  }

  
  async listFiles(params: ListFilesRequest = {}): Promise<ListFilesResponse> {
    const queryParams = new URLSearchParams();
    
    if (params.folderId) queryParams.append('folderId', params.folderId);
    if (params.pageToken) queryParams.append('pageToken', params.pageToken);
    if (params.pageSize) queryParams.append('pageSize', params.pageSize.toString());
    if (params.orderBy) queryParams.append('orderBy', params.orderBy);
    if (params.sortDirection) queryParams.append('sortDirection', params.sortDirection);
    if (params.nameFilter) queryParams.append('nameFilter', params.nameFilter);

    const queryString = queryParams.toString();
    const endpoint = `/api/files${queryString ? `?${queryString}` : ''}`;
    
    return this.makeRequest<ListFilesResponse>(endpoint);
  }

  async deleteFile(params: DeleteFileRequest): Promise<{ success: boolean }> {
    return this.makeRequest<{ success: boolean }>(`/api/files/${params.fileId}`, {
      method: 'DELETE',
    });
  }

  
  async getKnowledgeBases(): Promise<KnowledgeBase[]> {
    return this.makeRequest<KnowledgeBase[]>('/api/knowledge-bases');
  }

  async indexFile(params: IndexFileRequest): Promise<{ success: boolean; indexedAt: string }> {
    return this.makeRequest<{ success: boolean; indexedAt: string }>('/api/index', {
      method: 'POST',
      body: JSON.stringify(params),
    });
  }

  async deIndexFile(params: DeIndexFileRequest): Promise<{ success: boolean }> {
    return this.makeRequest<{ success: boolean }>('/api/deindex', {
      method: 'POST',
      body: JSON.stringify(params),
    });
  }

  async getIndexedFiles(knowledgeBaseId?: string): Promise<string[]> {
    const queryParams = new URLSearchParams();
    if (knowledgeBaseId) queryParams.append('knowledgeBaseId', knowledgeBaseId);
    
    const queryString = queryParams.toString();
    const endpoint = `/api/indexed-files${queryString ? `?${queryString}` : ''}`;
    
    return this.makeRequest<string[]>(endpoint);
  }

  
  async getFileContent(fileId: string): Promise<{ content: string; mimeType: string }> {
    return this.makeRequest<{ content: string; mimeType: string }>(`/api/files/${fileId}/content`);
  }
}


export const apiClient = new ApiClient();


export { ApiClient };
