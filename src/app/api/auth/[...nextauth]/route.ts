import NextAuth from 'next-auth'
import type { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { stackAIClient } from '@/lib/stackai-client'

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Stack AI',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        try {
          // Authenticate with Stack AI
          await stackAIClient.authenticate({
            email: credentials.email,
            password: credentials.password
          })
          
          // Get organization ID (already set during authentication)
          const orgId = stackAIClient.getCurrentOrgId()
          
          // Get connections
          const connections = await stackAIClient.getConnections()
          const connectionId = connections.length > 0 ? connections[0].connection_id : undefined

          // Get auth token to store in session
          const authToken = stackAIClient.getAuthToken()

          return {
            id: credentials.email,
            email: credentials.email,
            name: credentials.email,
            // Store Stack AI specific data
            orgId,
            connectionId,
            authToken,
          }
        } catch (error) {
          // Authentication failed
          return null
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      // Persist Stack AI data in the token
      if (user) {
        token.orgId = user.orgId
        token.connectionId = user.connectionId
        token.authToken = user.authToken
      }
      return token
    },
    async session({ session, token }) {
      // Send properties to the client
      return {
        ...session,
        user: {
          ...session.user,
          orgId: token.orgId,
          connectionId: token.connectionId,
          authToken: token.authToken,
        }
      }
    },
  },
  pages: {
    signIn: '/',
    error: '/',
  },
  session: {
    strategy: 'jwt',
  },
}

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }
