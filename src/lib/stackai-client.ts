import {
  StackAIConnection,
  StackAIResource,
  StackAIResourcesResponse,
  StackAIKnowledgeBase,
  StackAIAuthRequest,
  StackAIListResourcesRequest,
  StackAIKnowledgeBaseCreateRequest,
  ApiError,
  DriveItem,
  ListFilesResponse,
} from '@/types/api';
import { env } from '@/lib/env';

const SUPABASE_AUTH_URL = 'https:
const ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZic3VhZGZxaGtseG9rbWxodHNkIiwicm9sZSI6ImFub24iLCJpYXQiOjE2NzM0NTg5ODAsImV4cCI6MTk4OTAzNDk4MH0.Xjry9m7oc42_MsLRc1bZhTTzip3srDjJ6fJMkwhXQ9s';
const BACKEND_URL = env.NEXT_PUBLIC_STACK_AI_API_URL;

const STORAGE_KEYS = {
  AUTH_TOKEN: 'stackai_auth_token',
  ORG_ID: 'stackai_org_id',
  CONNECTION_ID: 'stackai_connection_id',
  KNOWLEDGE_BASE_ID: 'stackai_knowledge_base_id',
} as const;

class StackAIClient {
  private authToken?: string;
  private orgId?: string;
  private connectionId?: string;
  private knowledgeBaseId?: string;

  constructor() {
    this.loadPersistedState();
  }

  private loadPersistedState(): void {
    if (typeof window === 'undefined') return;

    this.authToken = localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN) || undefined;
    this.orgId = localStorage.getItem(STORAGE_KEYS.ORG_ID) || undefined;
    this.connectionId = localStorage.getItem(STORAGE_KEYS.CONNECTION_ID) || undefined;
    this.knowledgeBaseId = localStorage.getItem(STORAGE_KEYS.KNOWLEDGE_BASE_ID) || undefined;
  }

  private persistState(): void {
    if (typeof window === 'undefined') return;

    if (this.authToken) {
      localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, this.authToken);
    } else {
      localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
    }

    if (this.orgId) {
      localStorage.setItem(STORAGE_KEYS.ORG_ID, this.orgId);
    } else {
      localStorage.removeItem(STORAGE_KEYS.ORG_ID);
    }

    if (this.connectionId) {
      localStorage.setItem(STORAGE_KEYS.CONNECTION_ID, this.connectionId);
    } else {
      localStorage.removeItem(STORAGE_KEYS.CONNECTION_ID);
    }

    if (this.knowledgeBaseId) {
      localStorage.setItem(STORAGE_KEYS.KNOWLEDGE_BASE_ID, this.knowledgeBaseId);
    } else {
      localStorage.removeItem(STORAGE_KEYS.KNOWLEDGE_BASE_ID);
    }
  }

  async authenticate(credentials: StackAIAuthRequest): Promise<void> {
    const requestUrl = `${SUPABASE_AUTH_URL}/auth/v1/token?grant_type=password`;
    
    try {
      const response = await fetch(requestUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Apikey': ANON_KEY,
        },
        body: JSON.stringify({
          email: credentials.email,
          password: credentials.password,
          gotrue_meta_security: {},
        }),
      });

      if (!response.ok) {
        throw new Error(`Authentication failed: ${response.statusText}`);
      }

      const data = await response.json();
      this.authToken = data.access_token;

      await this.getOrgId();
      
      this.persistState();
    } catch (error) {
      throw this.handleError(error);
    }
  }

  private async getOrgId(): Promise<void> {
    if (!this.authToken) {
      throw new Error('Not authenticated');
    }

    try {
      const response = await fetch(`${BACKEND_URL}/organizations/me/current`, {
        headers: {
          'Authorization': `Bearer ${this.authToken}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to get organization: ${response.statusText}`);
      }

      const data = await response.json();
      this.orgId = data.org_id;
      
      this.persistState();
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getConnections(): Promise<StackAIConnection[]> {
    if (!this.authToken) {
      throw new Error('Not authenticated');
    }

    try {
      const response = await fetch(`${BACKEND_URL}/connections?connection_provider=gdrive&limit=10`, {
        headers: {
          'Authorization': `Bearer ${this.authToken}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to get connections: ${response.statusText}`);
      }

      const connections = await response.json();
      
      if (connections.length > 0) {
        this.connectionId = connections[0].connection_id;
        this.persistState();
      }

      return connections;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async listResources(params: StackAIListResourcesRequest = {}): Promise<StackAIResourcesResponse> {
    if (!this.authToken || !this.connectionId) {
      throw new Error('Not authenticated or no connection selected');
    }

    try {
      let url = `${BACKEND_URL}/connections/${this.connectionId}/resources/children`;
      const queryParams = new URLSearchParams();

      if (params.resource_id) {
        queryParams.append('resource_id', params.resource_id);
      }
      if (params.cursor) {
        queryParams.append('cursor', params.cursor);
      }

      if (queryParams.toString()) {
        url += `?${queryParams.toString()}`;
      }

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${this.authToken}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to list resources: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async createKnowledgeBase(params: StackAIKnowledgeBaseCreateRequest): Promise<StackAIKnowledgeBase> {
    if (!this.authToken) {
      throw new Error('Not authenticated');
    }


    try {
      const response = await fetch(`${BACKEND_URL}/knowledge_bases`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.authToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(params),
      });

      if (!response.ok) {
        throw new Error(`Failed to create knowledge base: ${response.statusText}`);
      }

      const kb = await response.json();
      this.knowledgeBaseId = kb.knowledge_base_id;
      return kb;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async syncKnowledgeBase(knowledgeBaseId?: string): Promise<void> {
    if (!this.authToken || !this.orgId) {
      throw new Error('Not authenticated or no organization');
    }

    const kbId = knowledgeBaseId || this.knowledgeBaseId;
    if (!kbId) {
      throw new Error('No knowledge base ID provided');
    }


    try {
      const response = await fetch(`${BACKEND_URL}/knowledge_bases/sync/trigger/${kbId}/${this.orgId}`, {
        headers: {
          'Authorization': `Bearer ${this.authToken}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to sync knowledge base: ${response.statusText}`);
      }
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async listKnowledgeBaseResources(knowledgeBaseId: string, resourcePath: string = '/'): Promise<StackAIResourcesResponse> {
    if (!this.authToken) {
      throw new Error('Not authenticated');
    }

    try {
      const queryParams = new URLSearchParams();
      queryParams.append('resource_path', resourcePath);

      const response = await fetch(`${BACKEND_URL}/knowledge_bases/${knowledgeBaseId}/resources/children?${queryParams.toString()}`, {
        headers: {
          'Authorization': `Bearer ${this.authToken}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to list knowledge base resources: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async deleteKnowledgeBaseResource(knowledgeBaseId: string, resourcePath: string): Promise<void> {
    if (!this.authToken) {
      throw new Error('Not authenticated');
    }

    try {
      const queryParams = new URLSearchParams();
      queryParams.append('resource_path', resourcePath);

      const response = await fetch(`${BACKEND_URL}/knowledge_bases/${knowledgeBaseId}/resources?${queryParams.toString()}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${this.authToken}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to delete resource: ${response.statusText}`);
      }
    } catch (error) {
      throw this.handleError(error);
    }
  }

  convertStackAIResourceToDriveItem(resource: StackAIResource, indexedResourceIds: string[] = []): DriveItem {
    const pathParts = resource.inode_path.path.split('/');
    const name = pathParts[pathParts.length - 1] || resource.inode_path.path;

    return {
      id: resource.resource_id,
      name,
      type: resource.inode_type === 'directory' ? 'folder' : 'file',
      mimeType: resource.mime_type,
      size: resource.size,
      createdTime: resource.created_at || new Date().toISOString(),
      modifiedTime: resource.updated_at || new Date().toISOString(),
      isIndexed: indexedResourceIds.includes(resource.resource_id),
    };
  }

  async getFilesForUI(params: { folderId?: string; nameFilter?: string } = {}): Promise<ListFilesResponse> {
    try {
      const stackAIResponse = await this.listResources({
        resource_id: params.folderId,
      });

      let resources = stackAIResponse.data;

      if (params.nameFilter) {
        resources = resources.filter(resource => 
          resource.inode_path.path.toLowerCase().includes(params.nameFilter!.toLowerCase())
        );
      }

      let indexedResourceIds: string[] = [];
      if (this.knowledgeBaseId) {
        try {
          const kbResponse = await this.listKnowledgeBaseResources(this.knowledgeBaseId);
          indexedResourceIds = kbResponse.data.map(r => r.resource_id);
        } catch (error) {
        }
      }

      const files = resources.map(resource => 
        this.convertStackAIResourceToDriveItem(resource, indexedResourceIds)
      );

      return {
        files,
        hasMore: !!stackAIResponse.next_cursor,
        nextPageToken: stackAIResponse.next_cursor,
      };
    } catch (error) {
      throw this.handleError(error);
    }
  }

  setConnectionId(connectionId: string): void {
    this.connectionId = connectionId;
    this.persistState();
  }

  setKnowledgeBaseId(knowledgeBaseId: string): void {
    this.knowledgeBaseId = knowledgeBaseId;
    this.persistState();
  }

  setAuthToken(authToken: string): void {
    this.authToken = authToken;
    this.persistState();
  }

  setOrgId(orgId: string): void {
    this.orgId = orgId;
    this.persistState();
  }

  getCurrentOrgId(): string | undefined {
    return this.orgId;
  }

  getConnectionId(): string | undefined {
    return this.connectionId;
  }

  getKnowledgeBaseId(): string | undefined {
    return this.knowledgeBaseId;
  }

  getAuthToken(): string | undefined {
    return this.authToken;
  }

  isAuthenticated(): boolean {
    return !!this.authToken;
  }

  logout(): void {
    this.authToken = undefined;
    this.orgId = undefined;
    this.connectionId = undefined;
    this.knowledgeBaseId = undefined;
    
    this.persistState();
  }

  private handleError(error: unknown): ApiError {
    if (error instanceof Error) {
      return {
        error: 'Stack AI API Error',
        message: error.message,
        statusCode: 0,
      };
    }
    return {
      error: 'Unknown Error',
      message: 'An unknown error occurred',
      statusCode: 0,
    };
  }
}

export const stackAIClient = new StackAIClient();

export { StackAIClient };
