import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/middleware';
import { addCrawlJob } from '@/jobs/crawl-job';
import { CrawlType } from '@prisma/client';

interface StartCrawlRequest {
  manufacturerId?: string;
  url: string;
  crawlType: CrawlType;
  priority?: number;
  metadata?: Record<string, any>;
}

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
