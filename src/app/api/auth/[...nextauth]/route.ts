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
          await stackAIClient.authenticate({
            email: credentials.email,
            password: credentials.password
          })
          
          const orgId = stackAIClient.getCurrentOrgId()
          
          const connections = await stackAIClient.getConnections()
          const connectionId = connections.length > 0 ? connections[0].connection_id : undefined

          const authToken = stackAIClient.getAuthToken()

          return {
            id: credentials.email,
            email: credentials.email,
            name: credentials.email,
            orgId,
            connectionId,
            authToken,
          }
        } catch (error) {
          return null
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.orgId = user.orgId
        token.connectionId = user.connectionId
        token.authToken = user.authToken
      }
      return token
    },
    async session({ session, token }) {
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
