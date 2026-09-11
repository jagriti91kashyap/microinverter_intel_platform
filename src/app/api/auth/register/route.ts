import { NextResponse } from 'next/server';

export async function POST() {
  return NextResponse.json({ error: 'Registration not available — use NextAuth sign-in' }, { status: 501 });
}
