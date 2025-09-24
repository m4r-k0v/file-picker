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

  const prevValues = useRef({
    isAuthenticated: false,
    connectionId: undefined as string | undefined,
    knowledgeBaseId: undefined as string | undefined,
  });

  const updateAuthState = useCallback(() => {
    const newIsAuthenticated = stackAIClient.isAuthenticated();
    const newConnectionId = stackAIClient.getConnectionId();
    const newKnowledgeBaseId = stackAIClient.getKnowledgeBaseId();

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

  useEffect(() => {
    updateAuthState();

    const interval = setInterval(updateAuthState, 1000);

    return () => clearInterval(interval);
  }, [updateAuthState]);

  const loginMutation = useMutation({
    mutationFn: async (credentials: StackAIAuthRequest) => {
      await stackAIClient.authenticate(credentials);
      await stackAIClient.getConnections();
    },
    onSuccess: () => {
      updateAuthState();
      queryClient.invalidateQueries();
      router.push('/dashboard');
    },
    onError: (error) => {
    },
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      stackAIClient.logout();
    },
    onSuccess: () => {
      updateAuthState();
      queryClient.clear();
      router.push('/');
    },
  });

  return {
    isAuthenticated,
    connectionId,
    knowledgeBaseId,

    login: loginMutation.mutate,
    logout: logoutMutation.mutate,

    isLoggingIn: loginMutation.isPending,
    isLoggingOut: logoutMutation.isPending,

    loginError: loginMutation.error,
    logoutError: logoutMutation.error,

    updateAuthState,
  };
}

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