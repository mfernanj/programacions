import { DefaultSession, DefaultUser } from 'next-auth'

declare module 'next-auth' {
  interface User extends DefaultUser {
    rol?: string
  }

  interface Session {
    user: {
      id: string
      rol: string
    } & DefaultSession['user']
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    rol?: string
    id?: string
  }
}