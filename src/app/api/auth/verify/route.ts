import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({ error: 'Use NextAuth session verification' }, { status: 501 });
}
