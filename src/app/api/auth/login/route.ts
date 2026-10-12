import { NextResponse } from 'next/server';

/**
 * POST /api/auth/login
 * 
 * Legacy login endpoint. Use NextAuth.js sign-in instead.
 * Redirects users to the NextAuth sign-in page.
 * 
 * @returns {Promise<NextResponse>} Error response (501 Not Implemented)
 * 
 * @example
 * // Request
 * POST /api/auth/login
 * Content-Type: application/json
 * 
 * {
 *   "username": "Enphase",
 *   "password": "password"
 * }
 * 
 * // Response (501 Not Implemented)
 * {
 *   "error": "Use NextAuth sign-in at /auth/signin"
 * }
 * 
 * @deprecated Use NextAuth.js sign-in at /auth/signin instead
 * @throws {501} Not Implemented - Use NextAuth sign-in endpoint
 */
export async function POST() {
  return NextResponse.json({ error: 'Use NextAuth sign-in at /auth/signin' }, { status: 501 });
}
