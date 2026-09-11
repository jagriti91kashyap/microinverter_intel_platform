import { getServerSession } from 'next-auth'
import { authOptions } from '@/auth'
import { NextRequest, NextResponse } from 'next/server'

export interface SessionUser {
  id: string
  email: string
  name?: string | null
  role: string
  permissions?: string[]
  lastLogin?: string
}

export interface AuthenticatedRequest extends NextRequest {
  user: SessionUser
}

/**
 * Server-side session validation with role-based access control
 */
export async function validateServerSession(request: NextRequest): Promise<{
  user: SessionUser | null
  error?: string
  status?: number
}> {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return { 
        user: null, 
        error: 'Unauthorized: No session found', 
        status: 401 
      }
    }

    const user: SessionUser = {
      id: session.user.id,
      email: session.user.email,
      name: session.user.name,
      role: session.user.role,
      permissions: session.user.permissions || [],
      lastLogin: session.user.lastLogin
    }

    return { user }
  } catch (error) {
    console.error('Session validation error:', error)
    return { 
      user: null, 
      error: 'Session validation failed', 
      status: 500 
    }
  }
}

/**
 * Check if user has required permissions
 */
export function hasPermission(
  user: SessionUser | null, 
  requiredPermissions: string | string[]
): boolean {
  if (!user || !user.permissions) return false
  
  const permissions = Array.isArray(requiredPermissions) 
    ? requiredPermissions 
    : [requiredPermissions]
  
  return permissions.every(permission => 
    user.permissions!.includes(permission) || user.permissions!.includes('admin:all')
  )
}

/**
 * Check if user has required role
 */
export function hasRole(user: SessionUser | null, requiredRole: string): boolean {
  if (!user) return false
  return user.role === requiredRole || user.role === 'ADMIN'
}

/**
 * Create authenticated response with user context
 */
export function createAuthenticatedResponse(
  user: SessionUser, 
  data: any, 
  status: number = 200
): NextResponse {
  const response = NextResponse.json(data, { status })
  
  // Add user context to response headers for debugging
  response.headers.set('X-User-ID', user.id)
  response.headers.set('X-User-Role', user.role)
  
  return response
}

/**
 * Middleware factory for API routes with permission checking
 */
export function withAuth(
  handler: (req: AuthenticatedRequest, ...args: any[]) => Promise<NextResponse>,
  options: {
    requiredPermissions?: string | string[]
    requiredRole?: string
  } = {}
) {
  return async (req: NextRequest, ...args: any[]) => {
    const { user, error, status } = await validateServerSession(req)
    
    if (!user) {
      return NextResponse.json(
        { error: error || 'Unauthorized' }, 
        { status: status || 401 }
      )
    }

    // Check permissions
    if (options.requiredPermissions) {
      if (!hasPermission(user, options.requiredPermissions)) {
        return NextResponse.json(
          { error: 'Insufficient permissions' }, 
          { status: 403 }
        )
      }
    }

    // Check role
    if (options.requiredRole) {
      if (!hasRole(user, options.requiredRole)) {
        return NextResponse.json(
          { error: 'Insufficient role privileges' }, 
          { status: 403 }
        )
      }
    }

    // Add user to request
    const authenticatedReq = req as AuthenticatedRequest
    authenticatedReq.user = user

    return handler(authenticatedReq, ...args)
  }
}

/**
 * Client-side session utilities
 */
export const clientSessionUtils = {
  /**
   * Check if user is authenticated on client side
   */
  isAuthenticated: (session: any): boolean => {
    return !!(session && session.user)
  },

  /**
   * Get user permissions from session
   */
  getUserPermissions: (session: any): string[] => {
    return session?.user?.permissions || []
  },

  /**
   * Check if user has specific permission on client side
   */
  hasPermission: (session: any, permission: string): boolean => {
    const permissions = clientSessionUtils.getUserPermissions(session)
    return permissions.includes(permission) || permissions.includes('admin:all')
  },

  /**
   * Get user role from session
   */
  getUserRole: (session: any): string => {
    return session?.user?.role || 'VIEWER'
  },

  /**
   * Check if user is admin
   */
  isAdmin: (session: any): boolean => {
    return clientSessionUtils.getUserRole(session) === 'ADMIN'
  },

  /**
   * Check if user can edit
   */
  canEdit: (session: any): boolean => {
    const role = clientSessionUtils.getUserRole(session)
    return role === 'ADMIN' || role === 'EDITOR'
  },

  /**
   * Format last login time
   */
  formatLastLogin: (lastLogin: string): string => {
    const date = new Date(lastLogin)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    
    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins} minutes ago`
    
    const diffHours = Math.floor(diffMins / 60)
    if (diffHours < 24) return `${diffHours} hours ago`
    
    const diffDays = Math.floor(diffHours / 24)
    return `${diffDays} days ago`
  }
}

/**
 * Session security utilities
 */
export const sessionSecurity = {
  /**
   * Check if session is expired
   */
  isSessionExpired: (lastLogin: string, maxAge: number = 24 * 60 * 60 * 1000): boolean => {
    const lastLoginTime = new Date(lastLogin).getTime()
    const now = new Date().getTime()
    return (now - lastLoginTime) > maxAge
  },

  /**
   * Get session security level
   */
  getSecurityLevel: (user: SessionUser): 'low' | 'medium' | 'high' => {
    if (user.role === 'ADMIN') return 'high'
    if (user.role === 'EDITOR') return 'medium'
    return 'low'
  },

  /**
   * Log security event
   */
  logSecurityEvent: (event: string, user: SessionUser, details?: any): void => {
    const logEntry = {
      timestamp: new Date().toISOString(),
      event,
      userId: user.id,
      userEmail: user.email,
      userRole: user.role,
      details
    }
    
    console.log('Security Event:', JSON.stringify(logEntry))
    
    // In production, this would be sent to a logging service
    // or stored in a security audit table
  }
}
