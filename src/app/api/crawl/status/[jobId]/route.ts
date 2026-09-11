import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/middleware';
import { db } from '@/lib/prisma';

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
    console.error('Get crawl status error:', error);
    return NextResponse.json(
      { error: 'Failed to get crawl status' },
      { status: 500 }
    );
  }
}

export const GET = withAuth(getCrawlStatus);
