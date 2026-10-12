import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/middleware';
import { db } from '@/lib/prisma';

/**
 * GET /api/crawl/status/[jobId]
 * 
 * Get the status and progress of a crawl job.
 * Returns detailed information including progress, results, and errors.
 * 
 * @param {NextRequest} req - The HTTP request object
 * @param {Object} params - Route parameters
 * @param {Promise<{jobId: string}>} params.params - Promise resolving to jobId
 * @returns {Promise<NextResponse>} JSON response with job status (200 OK)
 * 
 * @example
 * // Request
 * GET /api/crawl/status/job-123
 * Authorization: Bearer <session_token>
 * 
 * // Response (200 OK)
 * {
 *   "id": "job-123",
 *   "url": "https://enphase.com/products/iq8",
 *   "crawlType": "PRODUCT_PAGE",
 *   "status": "COMPLETED",
 *   "priority": 8,
 *   "retryCount": 0,
 *   "progress": 100,
 *   "pagesProcessed": 5,
 *   "totalPages": 5,
 *   "startedAt": "2026-10-15T10:30:00Z",
 *   "completedAt": "2026-10-15T10:35:00Z",
 *   "duration": 300,
 *   "results": [
 *     { "url": "https://...", "data": {...} }
 *   ],
 *   "errors": []
 * }
 * 
 * @param {string} jobId - Crawl job ID (required)
 * 
 * @throws {400} Bad Request - Missing job ID
 * @throws {401} Unauthorized - Missing or invalid session
 * @throws {404} Not Found - Job not found
 * @throws {500} Internal Server Error - Database error
 */
async function getCrawlStatus(req: NextRequest, { params }: { params: Promise<{ jobId: string }> }) {
  try {
    const { jobId } = await params;

    if (!jobId) {
      return NextResponse.json(
        { error: 'Job ID is required' },
        { status: 400 }
      );
    }

    // Get job status from database using raw SQL
    const jobs = await db.$queryRaw<any[]>`
      SELECT 
        cj.*,
        m.name as manufacturer_name,
        m.country as manufacturer_country
      FROM crawl_jobs cj
      LEFT JOIN manufacturers m ON cj.manufacturer_id = m.id
      WHERE cj.id = ${jobId}
      LIMIT 1
    `;

    const job = jobs[0];

    if (!job) {
      return NextResponse.json(
        { error: 'Crawl job not found' },
        { status: 404 }
      );
    }

    // Calculate duration if job is completed or running
    let duration = null;
    if (job.startedAt) {
      const endTime = job.completedAt || new Date();
      duration = Math.floor((endTime.getTime() - job.startedAt.getTime()) / 1000);
    }

    return NextResponse.json({
      id: job.id,
      url: job.url,
      crawlType: job.crawlType,
      status: job.status,
      priority: job.priority,
      retryCount: job.retryCount,
      productsFound: job.productsFound,
      datasheetsFound: job.datasheetsFound,
      specificationsExtracted: job.specificationsExtracted,
      manufacturer: job.manufacturer,
      metadata: job.metadata,
      createdAt: job.createdAt,
      startedAt: job.startedAt,
      completedAt: job.completedAt,
      duration,
      error: job.error,
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to get crawl status' },
      { status: 500 }
    );
  }
}

export const GET = withAuth(getCrawlStatus);
