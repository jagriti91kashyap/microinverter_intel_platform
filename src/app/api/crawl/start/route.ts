import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/middleware';
import { addCrawlJob } from '@/jobs/crawl-job';
import { CrawlType } from '@prisma/client';

/**
 * @typedef {Object} StartCrawlRequest
 * @property {string} [manufacturerId] - Target manufacturer ID
 * @property {string} url - URL to crawl (required)
 * @property {CrawlType} crawlType - Type of crawl (required)
 * @property {number} [priority=5] - Job priority (1-10, higher = more urgent)
 * @property {Object} [metadata] - Additional metadata
 */
interface StartCrawlRequest {
  manufacturerId?: string;
  url: string;
  crawlType: CrawlType;
  priority?: number;
  metadata?: Record<string, any>;
}

/**
 * POST /api/crawl/start
 * 
 * Start a new web crawl job with Playwright and AI extraction.
 * Job is queued in Redis/BullMQ for async processing.
 * 
 * @param {NextRequest} req - The HTTP request object
 * @returns {Promise<NextResponse>} JSON response with job ID (200 OK)
 * 
 * @example
 * // Request
 * POST /api/crawl/start
 * Content-Type: application/json
 * Authorization: Bearer <session_token>
 * 
 * {
 *   "url": "https://enphase.com/products/iq8",
 *   "crawlType": "PRODUCT_PAGE",
 *   "manufacturerId": "1",
 *   "priority": 8,
 *   "metadata": { "region": "US" }
 * }
 * 
 * // Response (200 OK)
 * {
 *   "success": true,
 *   "jobId": "job-123",
 *   "url": "https://enphase.com/products/iq8",
 *   "crawlType": "PRODUCT_PAGE",
 *   "status": "queued"
 * }
 * 
 * @body {string} url - URL to crawl (required, must be valid URL)
 * @body {string} crawlType - Crawl type (required)
 * @body {string} [manufacturerId] - Target manufacturer ID
 * @body {number} [priority=5] - Job priority (1-10)
 * @body {Object} [metadata] - Custom metadata
 * 
 * @throws {400} Bad Request - Missing URL or invalid format
 * @throws {401} Unauthorized - Missing or invalid session
 * @throws {500} Internal Server Error - Job queue error
 */
async function startCrawl(req: NextRequest) {
  try {
    const body: StartCrawlRequest = await req.json();

    // Validate required fields
    if (!body.url) {
      return NextResponse.json(
        { error: 'URL is required' },
        { status: 400 }
      );
    }

    if (!body.crawlType) {
      return NextResponse.json(
        { error: 'Crawl type is required' },
        { status: 400 }
      );
    }

    // Validate URL format
    try {
      new URL(body.url);
    } catch (error) {
      return NextResponse.json(
        { error: 'Invalid URL format' },
        { status: 400 }
      );
    }

    // Add crawl job to queue
    const job = await addCrawlJob({
      manufacturerId: body.manufacturerId,
      url: body.url,
      crawlType: body.crawlType as any,
      priority: body.priority || 5,
      metadata: body.metadata || {},
    });

    console.log(`Crawl job added: ${job.id} for ${body.url}`);

    return NextResponse.json({
      success: true,
      jobId: job.id,
      url: body.url,
      crawlType: body.crawlType,
      status: 'queued',
    });
  } catch (error) {
    console.error('Start crawl error:', error);
    return NextResponse.json(
      { error: 'Failed to start crawl' },
      { status: 500 }
    );
  }
}

export const POST = withAuth(startCrawl);
