'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { stackAIClient } from '@/lib/stackai-client';
import { StackAIAuthRequest } from '@/types/api';

export function useAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [connectionId, setConnectionId] = useState<string | undefined>();
  const [knowledgeBaseId, setKnowledgeBaseId] = useState<string | undefined>();
  const router = useRouter();
  const queryClient = useQueryClient();

  // Use refs to track previous values to prevent unnecessary updates
  const prevValues = useRef({
    isAuthenticated: false,
    connectionId: undefined as string | undefined,
    knowledgeBaseId: undefined as string | undefined,
  });

  // Update state from client - only update if values actually changed
  const updateAuthState = useCallback(() => {
    const newIsAuthenticated = stackAIClient.isAuthenticated();
    const newConnectionId = stackAIClient.getConnectionId();
    const newKnowledgeBaseId = stackAIClient.getKnowledgeBaseId();

    // Only update state if values have actually changed
    if (newIsAuthenticated !== prevValues.current.isAuthenticated) {
      setIsAuthenticated(newIsAuthenticated);
      prevValues.current.isAuthenticated = newIsAuthenticated;
    }
    if (newConnectionId !== prevValues.current.connectionId) {
      setConnectionId(newConnectionId);
      prevValues.current.connectionId = newConnectionId;
    }
    if (newKnowledgeBaseId !== prevValues.current.knowledgeBaseId) {
      setKnowledgeBaseId(newKnowledgeBaseId);
      prevValues.current.knowledgeBaseId = newKnowledgeBaseId;
    }
  }, []);

  // Initialize and listen for auth state changes
  useEffect(() => {
    updateAuthState();

    // Set up a periodic check for auth state changes
    // This handles localStorage changes from other tabs
    const interval = setInterval(updateAuthState, 1000);

    return () => clearInterval(interval);
  }, [updateAuthState]); // Include updateAuthState as dependency

  // Login mutation
  const loginMutation = useMutation({
    mutationFn: async (credentials: StackAIAuthRequest) => {
      await stackAIClient.authenticate(credentials);
      await stackAIClient.getConnections();
    },
    onSuccess: () => {
      updateAuthState();
      // Invalidate all queries to refetch with new auth
      queryClient.invalidateQueries();
      router.push('/dashboard');
    },
    onError: (error) => {
      // Login error is handled by mutation error state
    },
  });

  // Logout mutation
  const logoutMutation = useMutation({
    mutationFn: async () => {
      stackAIClient.logout();
    },
    onSuccess: () => {
      updateAuthState();
      // Clear all cached queries
      queryClient.clear();
      router.push('/');
    },
  });

  return {
    // State
    isAuthenticated,
    connectionId,
    knowledgeBaseId,

    // Actions
    login: loginMutation.mutate,
    logout: logoutMutation.mutate,

    // Loading states
    isLoggingIn: loginMutation.isPending,
    isLoggingOut: logoutMutation.isPending,

    // Errors
    loginError: loginMutation.error,
    logoutError: logoutMutation.error,

    // Utilities
    updateAuthState, // For manual state refresh if needed
  };
}

// Separate hook for auth redirect logic
export function useAuthRedirect(redirectTo: 'dashboard' | 'login' = 'login') {
  const { isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (redirectTo === 'dashboard' && isAuthenticated) {
      router.push('/dashboard');
    } else if (redirectTo === 'login' && !isAuthenticated) {
      router.push('/');
    }
  }, [redirectTo, isAuthenticated, router]);
}