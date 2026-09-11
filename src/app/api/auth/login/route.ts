import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { User, UserRole } from '@/types';

// Mock user database for demo
const mockUsers: User[] = [
  {
    id: '1',
    email: 'admin@enphase.com',
    name: 'Admin User',
    role: UserRole.ADMIN,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: '2',
    email: 'user@enphase.com',
    name: 'Regular User',
    role: UserRole.VIEWER,
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

function getJwtSecret(): string {
  const secret = process.env.NEXTAUTH_SECRET;
  if (!secret) throw new Error('NEXTAUTH_SECRET environment variable is not set');
  return secret;
}

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // For demo purposes, accept any email and create user if not exists
    let user = mockUsers.find(u => u.email === email);
    
    if (!user) {
      // Create a new user for demo
      user = {
        id: Date.now().toString(),
        email,
        name: email.split('@')[0],
        role: UserRole.VIEWER,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      mockUsers.push(user);
    }

    // Create JWT token
    const token = jwt.sign(
      { 
        userId: user.id, 
        email: user.email, 
        role: user.role 
      },
      getJwtSecret(),
      { expiresIn: '7d' }
    );

    // Update last login
    user.updatedAt = new Date();

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      },
      token
    });

  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

