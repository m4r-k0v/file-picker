'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Database, Plus, RefreshCw } from 'lucide-react';
import { useCreateKnowledgeBase, useSyncKnowledgeBase, useAuthStatus } from '@/hooks/use-stackai-files';
import { stackAIClient } from '@/lib/stackai-client';

type KnowledgeBaseManagerProps = {
  selectedResourceIds: string[];
  onKnowledgeBaseReady: () => void;
}

export function KnowledgeBaseManager({ selectedResourceIds, onKnowledgeBaseReady }: KnowledgeBaseManagerProps) {
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { connectionId, knowledgeBaseId } = useAuthStatus();
  const createKBMutation = useCreateKnowledgeBase();
  const syncKBMutation = useSyncKnowledgeBase();

  const handleCreateKnowledgeBase = async () => {
    if (!connectionId) {
      setError('No connection available');
      return;
    }

    if (selectedResourceIds.length === 0) {
      setError('Please select at least one file or folder to index');
      return;
    }

    setIsCreating(true);
    setError(null);

    try {
      const kb = await createKBMutation.mutateAsync({
        connection_id: connectionId,
        connection_source_ids: selectedResourceIds,
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

      // Set the knowledge base ID in the client
      stackAIClient.setKnowledgeBaseId(kb.knowledge_base_id);

      // Trigger sync
      await syncKBMutation.mutateAsync(kb.knowledge_base_id);

      onKnowledgeBaseReady();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create knowledge base');
    } finally {
      setIsCreating(false);
    }
  };

  const handleSyncKnowledgeBase = async () => {
    if (!knowledgeBaseId) return;

    try {
      await syncKBMutation.mutateAsync(knowledgeBaseId);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to sync knowledge base');
    }
  };

  if (knowledgeBaseId) {
    return (
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="w-5 h-5" />
            Knowledge Base Active
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Badge variant="secondary">ID: {knowledgeBaseId}</Badge>
              <Badge variant="outline">Connected</Badge>
            </div>
            <Button
              onClick={handleSyncKnowledgeBase}
              disabled={syncKBMutation.isPending}
              size="sm"
            >
              {syncKBMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Syncing...
                </>
              ) : (
                <>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Sync
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="w-5 h-5" />
          Create Knowledge Base
        </CardTitle>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="space-y-4">
          <div>
            <p className="text-sm text-muted-foreground mb-2">
              Selected resources to index: {selectedResourceIds.length}
            </p>
            {selectedResourceIds.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {selectedResourceIds.slice(0, 5).map((id, index) => (
                  <Badge key={id} variant="outline" className="text-xs">
                    Resource {index + 1}
                  </Badge>
                ))}
                {selectedResourceIds.length > 5 && (
                  <Badge variant="outline" className="text-xs">
                    +{selectedResourceIds.length - 5} more
                  </Badge>
                )}
              </div>
            )}
          </div>

          <Button
            onClick={handleCreateKnowledgeBase}
            disabled={isCreating || selectedResourceIds.length === 0}
            className="w-full"
          >
            {isCreating ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Creating Knowledge Base...
              </>
            ) : (
              <>
                <Plus className="w-4 h-4 mr-2" />
                Create Knowledge Base
              </>
            )}
          </Button>

          <p className="text-xs text-muted-foreground">
            This will create a knowledge base with the selected files and folders, 
            making them searchable and available for AI interactions.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
