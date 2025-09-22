'use client';

import { useAuth } from '@/hooks/use-auth';
import { useConnections } from '@/hooks/use-stackai-files';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

export function ConnectionStatus() {
  const { isAuthenticated, connectionId, knowledgeBaseId } = useAuth();
  const { data: connections, isLoading, error } = useConnections();

  return (
    <Card className="mb-4">
      <CardHeader>
        <CardTitle className="text-sm font-medium">Connection Status</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="flex items-center gap-2">
          <span className="text-sm">Authentication:</span>
          {isAuthenticated ? (
            <Badge variant="default" className="bg-green-500">
              <CheckCircle className="w-3 h-3 mr-1" />
              Authenticated
            </Badge>
          ) : (
            <Badge variant="destructive">
              <XCircle className="w-3 h-3 mr-1" />
              Not Authenticated
            </Badge>
          )}
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm">Connection ID:</span>
          {connectionId ? (
            <Badge variant="default" className="bg-blue-500">
              <CheckCircle className="w-3 h-3 mr-1" />
              {connectionId.slice(0, 8)}...
            </Badge>
          ) : (
            <Badge variant="secondary">
              <AlertCircle className="w-3 h-3 mr-1" />
              No Connection
            </Badge>
          )}
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm">Knowledge Base:</span>
          {knowledgeBaseId ? (
            <Badge variant="default" className="bg-purple-500">
              <CheckCircle className="w-3 h-3 mr-1" />
              {knowledgeBaseId.slice(0, 8)}...
            </Badge>
          ) : (
            <Badge variant="secondary">
              <AlertCircle className="w-3 h-3 mr-1" />
              No KB
            </Badge>
          )}
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm">Connections:</span>
          {isLoading ? (
            <Badge variant="secondary">
              <Loader2 className="w-3 h-3 mr-1 animate-spin" />
              Loading...
            </Badge>
          ) : error ? (
            <Badge variant="destructive">
              <XCircle className="w-3 h-3 mr-1" />
              Error
            </Badge>
          ) : connections ? (
            <Badge variant="default" className="bg-green-500">
              <CheckCircle className="w-3 h-3 mr-1" />
              {connections.length} found
            </Badge>
          ) : (
            <Badge variant="secondary">
              <AlertCircle className="w-3 h-3 mr-1" />
              None
            </Badge>
          )}
        </div>

        {error && (
          <div className="text-xs text-red-500 mt-2">
            Error: {error instanceof Error ? error.message : 'Unknown error'}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
