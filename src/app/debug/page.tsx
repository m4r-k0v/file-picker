'use client';

import { useSession } from 'next-auth/react';
import { stackAIClient } from '@/lib/stackai-client';

export default function DebugPage() {
  const { data: session, status } = useSession();

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Debug Information</h1>
      
      <div className="space-y-4">
        <div className="p-4 border rounded">
          <h2 className="font-bold">NextAuth Session Status</h2>
          <p>Status: {status}</p>
          <p>Has Session: {!!session ? 'Yes' : 'No'}</p>
        </div>

        <div className="p-4 border rounded">
          <h2 className="font-bold">Session Data</h2>
          <pre className="text-xs overflow-auto">
            {JSON.stringify(session, null, 2)}
          </pre>
        </div>

        <div className="p-4 border rounded">
          <h2 className="font-bold">Stack AI Client State</h2>
          <p>Is Authenticated: {stackAIClient.isAuthenticated() ? 'Yes' : 'No'}</p>
          <p>Has Auth Token: {stackAIClient.getAuthToken() ? 'Yes' : 'No'}</p>
          <p>Connection ID: {stackAIClient.getConnectionId() || 'None'}</p>
          <p>Org ID: {stackAIClient.getCurrentOrgId() || 'None'}</p>
          <p>Knowledge Base ID: {stackAIClient.getKnowledgeBaseId() || 'None'}</p>
        </div>

        <div className="p-4 border rounded">
          <h2 className="font-bold">Actions</h2>
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-blue-500 text-white rounded mr-2"
          >
            Refresh Page
          </button>
          <button 
            onClick={() => window.location.href = '/dashboard'} 
            className="px-4 py-2 bg-green-500 text-white rounded"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}
