import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/middleware';
import { db } from '@/lib/prisma';
import { JobStatus } from '@prisma/client';

/**
 * GET /api/crawl/list
 * 
 * List all crawl jobs with optional filtering by status and pagination.
 * 
 * @param {NextRequest} req - The HTTP request object
 * @returns {Promise<NextResponse>} JSON response with paginated job list (200 OK)
 * 
 * @example
 * // Request
 * GET /api/crawl/list?status=COMPLETED&limit=20&offset=0
 * Authorization: Bearer <session_token>
 * 
 * // Response (200 OK)
 * {
 *   "jobs": [
 *     {
 *       "id": "job-123",
 *       "url": "https://enphase.com/products/iq8",
 *       "crawlType": "PRODUCT_PAGE",
 *       "status": "COMPLETED",
 *       "priority": 8,
 *       "pagesProcessed": 5,
 *       "totalPages": 5,
 *       "createdAt": "2026-10-15T10:30:00Z",
 *       "completedAt": "2026-10-15T10:35:00Z"
 *     }
 *   ],
 *   "pagination": {
 *     "total": 45,
 *     "limit": 20,
 *     "offset": 0,
 *     "hasMore": true
 *   }
 * }
 * 
 * @query {string} [status] - Filter by job status (QUEUED, RUNNING, COMPLETED, FAILED)
 * @query {number} [limit=50] - Items per page (max 100)
 * @query {number} [offset=0] - Pagination offset
 * 
 * @throws {400} Bad Request - Invalid query parameters
 * @throws {401} Unauthorized - Missing or invalid session
 * @throws {500} Internal Server Error - Database error
 */
async function listCrawlJobs(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status') as JobStatus | null;
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Build where clause
    const where = status ? { status } : {};

    // Get jobs with pagination using raw SQL
    const jobs = await db.$queryRaw<any[]>`
      SELECT 
        cj.*,
        m.name as manufacturer_name,
        m.country as manufacturer_country
      FROM crawl_jobs cj
      LEFT JOIN manufacturers m ON cj.manufacturer_id = m.id
      ${status ? `WHERE cj.status = ${status}` : ''}
      ORDER BY cj.created_at DESC
      LIMIT ${limit} OFFSET ${offset}
    `;

    // Get total count for pagination
    const total = await db.$queryRaw<{count: number}[]>`
      SELECT COUNT(*) as count 
      FROM crawl_jobs cj
      ${status ? `WHERE cj.status = ${status}` : ''}
    `;

    const totalCount = total[0]?.count || 0;

    return NextResponse.json({
      jobs: jobs || [],
      pagination: {
        total: totalCount,
        limit,
        offset,
        hasMore: (offset + limit) < totalCount,
      },
    });
  } catch (error) {
    console.error('List crawl jobs error:', error);
    return NextResponse.json(
      { error: 'Failed to list crawl jobs' },
      { status: 500 }
    );
  }
}

export const GET = withAuth(listCrawlJobs);
