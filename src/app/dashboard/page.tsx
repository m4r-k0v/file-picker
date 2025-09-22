'use client';

import { useState } from 'react';
import { FilePicker } from "@/components/file-picker/file-picker";
import { KnowledgeBaseManager } from "@/components/knowledge-base/kb-manager";
import { ConnectionStatus } from "@/components/debug/connection-status";
import { useAuth, useAuthRedirect } from "@/hooks/use-auth";
import { Button } from '@/components/ui/button';
import { LogOut, Loader2 } from 'lucide-react';

export default function Dashboard() {
  const [selectedResourceIds, setSelectedResourceIds] = useState<string[]>([]);
  const [showKnowledgeBaseManager, setShowKnowledgeBaseManager] = useState(false);
  const { isAuthenticated, knowledgeBaseId, logout, isLoggingOut } = useAuth();

  // Auto-redirect to login if not authenticated
  useAuthRedirect('login');

  const handleResourceSelection = (resourceIds: string[]) => {
    setSelectedResourceIds(resourceIds);
  };

  const handleKnowledgeBaseReady = () => {
    setShowKnowledgeBaseManager(false);
  };

  const handleLogout = () => {
    logout();
  };

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-muted-foreground">Redirecting to login...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-6xl">
      {/* Header with logout */}
      <div className="flex justify-between items-center mb-8">
        <div className="text-center flex-1">
          <h1 className="text-3xl font-bold mb-2">Stack AI Google Drive File Picker</h1>
          <p className="text-muted-foreground">
            Browse, manage, and index your Google Drive files for knowledge base creation
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleLogout}
          className="ml-4"
          disabled={isLoggingOut}
        >
          {isLoggingOut ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Logging out...
            </>
          ) : (
            <>
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </>
          )}
        </Button>
      </div>

      {/* Debug Connection Status */}
      <ConnectionStatus />

      {/* Knowledge Base Manager */}
      {(showKnowledgeBaseManager || !knowledgeBaseId) && (
        <KnowledgeBaseManager
          selectedResourceIds={selectedResourceIds}
          onKnowledgeBaseReady={handleKnowledgeBaseReady}
        />
      )}

      {/* Main File Picker */}
      <FilePicker 
        onResourceSelection={handleResourceSelection}
        showKnowledgeBaseButton={!knowledgeBaseId}
        onShowKnowledgeBaseManager={() => setShowKnowledgeBaseManager(true)}
      />
    </div>
  );
}
