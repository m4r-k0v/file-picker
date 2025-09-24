'use client'

import { useSession, signIn, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { stackAIClient } from '@/lib/stackai-client'

export function useAuth() {
  const { data: session, status } = useSession()

  // Sync Stack AI client with NextAuth session
  useEffect(() => {
    console.log('🔍 NextAuth Session Debug:', {
      status,
      hasSession: !!session,
      user: session?.user ? {
        email: session.user.email,
        hasAuthToken: !!session.user.authToken,
        hasConnectionId: !!session.user.connectionId,
        hasOrgId: !!session.user.orgId
      } : null
    });

    if (session?.user) {
      // Set Stack AI client state from session
      if (session.user.authToken) {
        console.log('✅ Setting auth token from session');
        stackAIClient.setAuthToken(session.user.authToken)
      } else {
        console.log('❌ No auth token in session');
      }
      
      if (session.user.connectionId) {
        console.log('✅ Setting connection ID from session');
        stackAIClient.setConnectionId(session.user.connectionId)
      } else {
        console.log('❌ No connection ID in session');
      }

      // Also set org ID if available
      if (session.user.orgId) {
        console.log('✅ Setting org ID from session:', session.user.orgId);
        stackAIClient.setOrgId(session.user.orgId);
      } else {
        console.log('❌ No org ID in session');
      }
    }
  }, [session, status])

  const login = async (email: string, password: string) => {
    const result = await signIn('credentials', {
      email,
      password,
      redirect: false,
    })
    
    if (result?.error) {
      throw new Error('Authentication failed')
    }
    
    return result
  }

  const logout = async () => {
    // Clear Stack AI client state
    stackAIClient.logout()
    await signOut({ redirect: false })
  }

  return {
    // Session state
    isAuthenticated: status === 'authenticated',
    isLoading: status === 'loading',
    session,
    user: session?.user,
    
    // Stack AI specific data
    connectionId: session?.user?.connectionId,
    orgId: session?.user?.orgId,
    
    // Actions
    login,
    logout,
  }
}

export function useAuthRedirect(redirectTo: 'login' | 'dashboard') {
  const { isAuthenticated, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (isLoading) return // Don't redirect while loading

    if (redirectTo === 'dashboard' && isAuthenticated) {
      router.push('/dashboard')
    } else if (redirectTo === 'login' && !isAuthenticated) {
      router.push('/')
    }
  }, [isAuthenticated, isLoading, redirectTo, router])
}
