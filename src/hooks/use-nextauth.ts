'use client'

import { useSession, signIn, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { stackAIClient } from '@/lib/stackai-client'

export function useAuth() {
  const { data: session, status } = useSession()

  useEffect(() => {
    if (session?.user) {
      if (session.user.authToken) {
        stackAIClient.setAuthToken(session.user.authToken)
      }
      
      if (session.user.connectionId) {
        stackAIClient.setConnectionId(session.user.connectionId)
      }

      if (session.user.orgId) {
        stackAIClient.setOrgId(session.user.orgId);
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
    stackAIClient.logout()
    await signOut({ redirect: false })
  }

  return {
    isAuthenticated: status === 'authenticated',
    isLoading: status === 'loading',
    session,
    user: session?.user,
    
    connectionId: session?.user?.connectionId,
    orgId: session?.user?.orgId,
    
    login,
    logout,
  }
}

export function useAuthRedirect(redirectTo: 'login' | 'dashboard') {
  const { isAuthenticated, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (isLoading) return

    if (redirectTo === 'dashboard' && isAuthenticated) {
      router.push('/dashboard')
    } else if (redirectTo === 'login' && !isAuthenticated) {
      router.push('/')
    }
  }, [isAuthenticated, isLoading, redirectTo, router])
}
