'use client';

import { useState } from 'react';
import { FilePicker } from "@/components/file-picker/file-picker";
import { KnowledgeBaseManager } from "@/components/knowledge-base/kb-manager";
import { ConnectionStatus } from "@/components/debug/connection-status";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { useAuth, useAuthRedirect } from "@/hooks/use-auth";

export default function Dashboard() {
  const [selectedResourceIds, setSelectedResourceIds] = useState<string[]>([]);
  const [showKnowledgeBaseManager, setShowKnowledgeBaseManager] = useState(false);
  const { isAuthenticated, knowledgeBaseId, logout, isLoggingOut } = useAuth();

  useAuthRedirect('login');

  console.count('TEST')
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
    <div className="min-h-screen bg-white">
      <div className="mx-auto py-8 px-4">
      <DashboardHeader
        onLogout={handleLogout}
        isLoggingOut={isLoggingOut}
      />

      {/*<ConnectionStatus />*/}

      {/*{(showKnowledgeBaseManager || !knowledgeBaseId) && (*/}
      {/*  <KnowledgeBaseManager*/}
      {/*    selectedResourceIds={selectedResourceIds}*/}
      {/*    onKnowledgeBaseReady={handleKnowledgeBaseReady}*/}
      {/*  />*/}
      {/*)}*/}

      <FilePicker
        onResourceSelection={handleResourceSelection}
        showKnowledgeBaseButton={!knowledgeBaseId}
        onShowKnowledgeBaseManager={() => setShowKnowledgeBaseManager(true)}
      />
      </div>
    </div>
  );
}