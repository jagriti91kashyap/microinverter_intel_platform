import { NextRequest, NextResponse } from 'next/server';
import { getAuthUrl, exchangeCodeForTokens, validateAzureToken, createOrUpdateUser, generateAppToken } from '@/lib/azure-ad';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const state = searchParams.get('state') || undefined;
    
    const authUrl = await getAuthUrl(state);
    
    return NextResponse.json({ authUrl });
  } catch (error) {
    console.error('Error getting auth URL:', error);
    return NextResponse.json(
      { error: 'Failed to generate authentication URL' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { code, state } = await request.json();
    
    if (!code) {
      return NextResponse.json(
        { error: 'Authorization code is required' },
        { status: 400 }
      );
    }

    // Exchange code for tokens
    const tokenResponse = await exchangeCodeForTokens(code, state);
    
    if (!tokenResponse?.idToken) {
      return NextResponse.json(
        { error: 'Failed to obtain ID token' },
        { status: 400 }
      );
    }

    // Validate Azure AD token and extract user info
    const azureUser = await validateAzureToken(tokenResponse.idToken);
    
    // Create or update user in database
    const user = await createOrUpdateUser(azureUser);
    
    // Generate application JWT token
    const appToken = generateAppToken(user);
    
    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
      token: appToken,
      azureToken: tokenResponse.idToken,
    });
  } catch (error) {
    console.error('Azure AD login error:', error);
    return NextResponse.json(
      { error: 'Authentication failed' },
      { status: 500 }
    );
  }
}
