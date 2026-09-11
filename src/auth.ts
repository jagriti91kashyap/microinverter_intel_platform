import type { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { z } from "zod"

// Enhanced session and user types for production
declare module "next-auth" {
  interface Session {
    user: {
      id: string
      email: string
      name?: string | null
      role: string
      image?: string | null
      permissions?: string[]
      lastLogin?: string
    }
  }
  
  interface User {
    role: string
    image?: string | null
    permissions?: string[]
    lastLogin?: string
  }

  interface JWT {
    role: string
    permissions?: string[]
    lastLogin?: string
  }
}

// Input validation schema
const credentialsSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required")
})

// User permissions based on role
const rolePermissions = {
  ADMIN: ['read:all', 'write:all', 'delete:all', 'manage:users', 'manage:system'],
  EDITOR: ['read:all', 'write:products', 'write:manufacturers', 'manage:comparisons'],
  VIEWER: ['read:products', 'read:manufacturers', 'create:comparisons', 'read:analytics']
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        try {
          // Validate input
          const { username, password } = credentialsSchema.parse(credentials)
          
          // Validate credentials
          if (username === "Enphase" && password === "Enphase@123") {
            const user = {
              id: "1",
              email: "enphase@demo.com",
              name: "Enphase Administrator",
              role: "ADMIN" as const,
              permissions: rolePermissions.ADMIN,
              lastLogin: new Date().toISOString()
            }
            return user
          }
          
          return null
        } catch (error) {
          console.error('Authentication error:', error)
          return null
        }
      }
    })
  ],
  session: {
    strategy: "jwt",
    maxAge: 24 * 60 * 60, // 24 hours
    updateAge: 60 * 60, // Update session every hour
  },
  jwt: {
    maxAge: 24 * 60 * 60, // 24 hours
  },
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      // Initial sign in
      if (user) {
        token.role = user.role
        token.permissions = user.permissions
        token.lastLogin = user.lastLogin
      }
      
      // Update session
      if (trigger === 'update' && session) {
        token.lastLogin = new Date().toISOString()
      }
      
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.sub!
        session.user.role = token.role as string
        session.user.permissions = token.permissions as string[]
        session.user.lastLogin = token.lastLogin as string
      }
      return session
    }
  },
  pages: {
    signIn: "/auth/signin",
    error: "/auth/error"
  },
  events: {
    async signIn({ user, account, profile }) {
      // Log sign in events for security
      console.log(`User signed in: [redacted] at ${new Date().toISOString()}`)
    },
    async signOut({ session }) {
      // Log sign out events
      console.log(`User signed out: [redacted] at ${new Date().toISOString()}`)
    }
  },
  debug: process.env.NODE_ENV === 'development'
}
