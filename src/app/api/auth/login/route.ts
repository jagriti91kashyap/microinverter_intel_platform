import { NextResponse } from 'next/server';

export async function POST() {
  return NextResponse.json({ error: 'Use NextAuth sign-in at /auth/signin' }, { status: 501 });
}
