import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

function getJWTSecret(): string {
  const secret = process.env.NEXTAUTH_SECRET;
  if (!secret) {
    throw new Error('NEXTAUTH_SECRET environment variable is not set');
  }
  return secret;
}

// Simple user credentials (in production, these should be in a database)
const USERS = [
  {
    id: '1',
    email: 'admin@microinverter.com',
    password: bcrypt.hashSync('admin123', 10), // Change this in production
    role: 'ADMIN',
    name: 'Admin User'
  },
  {
    id: '2',
    email: 'user@microinverter.com',
    password: bcrypt.hashSync('user123', 10), // Change this in production
    role: 'USER',
    name: 'Regular User'
  }
];

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthUser {
  id: string;
  email: string;
  role: string;
  name: string;
}

export interface JWTPayload {
  userId: string;
  email: string;
  role: string;
}

export class SimpleAuthService {
  /**
   * Authenticate user with email and password
   */
  async login(credentials: LoginRequest): Promise<{ user: AuthUser; token: string }> {
    const user = USERS.find(u => u.email === credentials.email);
    
    if (!user) {
      throw new Error('Invalid credentials');
    }

    const isValidPassword = await bcrypt.compare(credentials.password, user.password);
    
    if (!isValidPassword) {
      throw new Error('Invalid credentials');
    }

    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      getJWTSecret(),
      { expiresIn: '24h' }
    );

    return {
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        name: user.name
      },
      token
    };
  }

  /**
   * Verify JWT token
   */
  verifyToken(token: string): JWTPayload {
    try {
      return jwt.verify(token, getJWTSecret()) as JWTPayload;
    } catch (error) {
      throw new Error('Invalid token');
    }
  }

  /**
   * Get user by ID
   */
  getUserById(userId: string): AuthUser | null {
    const user = USERS.find(u => u.id === userId);
    if (!user) return null;

    return {
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.name
    };
  }
}

export const authService = new SimpleAuthService();
