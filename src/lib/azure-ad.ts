import { ConfidentialClientApplication, AuthorizationCodeRequest } from '@azure/msal-node';
import jwt from 'jsonwebtoken';
import { JwksClient } from 'jwks-rsa';
import { UserRole } from '@/types';
import { db } from './prisma';

// Azure AD Configuration
const azureAdConfig = {
  clientId: process.env.AZURE_AD_CLIENT_ID!,
  clientSecret: process.env.AZURE_AD_CLIENT_SECRET!,
  tenantId: process.env.AZURE_AD_TENANT_ID!,
  authority: `https://login.microsoftonline.com/${process.env.AZURE_AD_TENANT_ID}`,
  redirectUri: process.env.AZURE_AD_REDIRECT_URI!,
  jwksUri: `https://login.microsoftonline.com/${process.env.AZURE_AD_TENANT_ID}/discovery/v2.0/keys`,
};

// MSAL Client Configuration
const msalConfig = {
  auth: {
    clientId: azureAdConfig.clientId,
    clientSecret: azureAdConfig.clientSecret,
    authority: azureAdConfig.authority,
    redirectUri: azureAdConfig.redirectUri,
  },
};

// Initialize MSAL client lazily to avoid build-time errors when env vars are missing
let _msalClient: ConfidentialClientApplication | null = null;
function getMsalClient() {
  if (!_msalClient) {
    _msalClient = new ConfidentialClientApplication(msalConfig);
  }
  return _msalClient;
}

// JWKS Client for token validation
const jwksClient = new JwksClient({
  jwksUri: azureAdConfig.jwksUri,
  cache: true,
  rateLimit: true,
  cacheMaxEntries: 5,
  cacheMaxAge: 600000, // 10 minutes
});

// Get signing key from JWKS
function getSigningKey(header: any, callback: (err: Error | null, signingKey?: string) => void) {
  jwksClient.getSigningKey(header.kid, (err, key) => {
    if (err) {
      return callback(err);
    }
    const signingKey = key?.getPublicKey();
    callback(null, signingKey);
  });
}

// Azure AD User interface
export interface AzureADUser {
  oid: string; // Object ID
  upn: string; // User Principal Name (email)
  name: string;
  given_name?: string;
  family_name?: string;
  job_title?: string;
  department?: string;
  office_location?: string;
  groups?: string[];
  roles?: string[];
}

// Role mapping based on Azure AD groups
const roleMapping: { [key: string]: UserRole } = {
  'Microinverter-Admins': UserRole.ADMIN,
  'Microinverter-Editors': UserRole.EDITOR,
  'Microinverter-Viewers': UserRole.VIEWER,
};

// Map Azure AD groups to application roles
function mapUserToRole(groups: string[] = []): UserRole {
  // Check for admin groups first
  for (const group of groups) {
    if (group.includes('Admin') || group.includes('admin')) {
      return UserRole.ADMIN;
    }
  }
  
  // Check for editor groups
  for (const group of groups) {
    if (group.includes('Editor') || group.includes('editor')) {
      return UserRole.EDITOR;
    }
  }
  
  // Default to viewer
  return UserRole.VIEWER;
}

// Get authorization URL for Azure AD login
export async function getAuthUrl(state?: string): Promise<string> {
  const authCodeUrlParameters = {
    scopes: ['openid', 'profile', 'email', 'User.Read', 'GroupMember.Read.All'],
    redirectUri: azureAdConfig.redirectUri,
    state: state || 'default',
  };

  return await getMsalClient().getAuthCodeUrl(authCodeUrlParameters);
}

// Exchange authorization code for tokens
export async function exchangeCodeForTokens(code: string, state?: string) {
  const tokenRequest = {
    code,
    scopes: ['openid', 'profile', 'email', 'User.Read', 'GroupMember.Read.All'],
    redirectUri: azureAdConfig.redirectUri,
  };

  try {
    const response = await getMsalClient().acquireTokenByCode(tokenRequest);
    return response;
  } catch (error) {
    console.error('Error exchanging code for tokens:', error);
    throw new Error('Failed to exchange authorization code for tokens');
  }
}

// Validate Azure AD ID token
export async function validateAzureToken(token: string): Promise<AzureADUser> {
  return new Promise((resolve, reject) => {
    const decodedHeader = jwt.decode(token, { complete: true }) as any;
    
    if (!decodedHeader || !decodedHeader.header) {
      reject(new Error('Invalid token format'));
      return;
    }

    // Verify token signature
    jwt.verify(
      token,
      getSigningKey,
      {
        algorithms: ['RS256'],
        audience: azureAdConfig.clientId,
        issuer: `https://sts.windows.net/${azureAdConfig.tenantId}/`,
      },
      async (err, decoded) => {
        if (err) {
          reject(new Error('Token verification failed'));
          return;
        }

        try {
          const user = decoded as AzureADUser;
          
          // Fetch user groups from Microsoft Graph API
          const groups = await fetchUserGroups(user.oid, token);
          user.groups = groups;
          
          resolve(user);
        } catch (error) {
          reject(error);
        }
      }
    );
  });
}

// Fetch user groups from Microsoft Graph API
async function fetchUserGroups(userObjectId: string, accessToken: string): Promise<string[]> {
  try {
    const response = await fetch(
      `https://graph.microsoft.com/v1.0/users/${userObjectId}/transitiveMemberOf/microsoft.graph.group?$select=displayName`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      console.warn('Failed to fetch user groups:', response.statusText);
      return [];
    }

    const data = await response.json();
    return data.value?.map((group: any) => group.displayName) || [];
  } catch (error) {
    console.error('Error fetching user groups:', error);
    return [];
  }
}

// Create or update user in database
export async function createOrUpdateUser(azureUser: AzureADUser): Promise<any> {
  const role = mapUserToRole(azureUser.groups);
  
  try {
    // Check if user exists
    const existingUser = await db.user.findUnique({
      where: { email: azureUser.upn },
    });

    if (existingUser) {
      // Update existing user
      const updatedUser = await db.user.update({
        where: { id: existingUser.id },
        data: {
          name: azureUser.name,
          role,
          updatedAt: new Date(),
        },
      });
      return updatedUser;
    } else {
      // Create new user
      const newUser = await db.user.create({
        data: {
          email: azureUser.upn,
          name: azureUser.name,
          password: 'azure-ad-user', // Placeholder password for Azure AD users
          role,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      });
      return newUser;
    }
  } catch (error) {
    console.error('Error creating/updating user:', error);
    throw new Error('Failed to create or update user');
  }
}

// Generate application JWT token for authenticated user
export function generateAppToken(user: any): string {
  const payload = {
    userId: user.id,
    email: user.email,
    role: user.role,
    azureId: user.azureId,
  };

  return jwt.sign(payload, process.env.JWT_SECRET || 'fallback-secret', {
    expiresIn: '7d',
  });
}

// Middleware to protect API routes
export function requireAuth(handler: Function) {
  return async (req: Request, res: any) => {
    try {
      const authHeader = req.headers.get('authorization');
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Missing or invalid authorization header' });
      }

      const token = authHeader.substring(7);
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret') as any;
      
      // Attach user to request
      (req as any).user = decoded;
      
      return handler(req, res);
    } catch (error) {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }
  };
}

// Role-based access control middleware
export function requireRole(requiredRole: UserRole) {
  return (handler: Function) => {
    return async (req: Request, res: any) => {
      const user = (req as any).user;
      
      if (!user) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      const userRole = user.role as UserRole;
      const roleHierarchy = {
        [UserRole.VIEWER]: 1,
        [UserRole.EDITOR]: 2,
        [UserRole.ADMIN]: 3,
      };

      if (roleHierarchy[userRole] < roleHierarchy[requiredRole]) {
        return res.status(403).json({ error: 'Insufficient permissions' });
      }

      return handler(req, res);
    };
  };
}

// Azure AD logout
export function getLogoutUrl(): string {
  return `https://login.microsoftonline.com/${azureAdConfig.tenantId}/oauth2/v2.0/logout?post_logout_redirect_uri=${encodeURIComponent(process.env.NEXTAUTH_URL || 'http://localhost:3000')}`;
}

export default {
  getAuthUrl,
  exchangeCodeForTokens,
  validateAzureToken,
  createOrUpdateUser,
  generateAppToken,
  requireAuth,
  requireRole,
  getLogoutUrl,
};
