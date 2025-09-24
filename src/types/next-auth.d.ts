import { DefaultSession, DefaultUser } from 'next-auth'
import { JWT, DefaultJWT } from 'next-auth/jwt'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      orgId?: string
      connectionId?: string
      authToken?: string
    } & DefaultSession['user']
  }

  interface User extends DefaultUser {
    orgId?: string
    connectionId?: string
    authToken?: string
  }
}

declare module 'next-auth/jwt' {
  interface JWT extends DefaultJWT {
    orgId?: string
    connectionId?: string
    authToken?: string
  }
}