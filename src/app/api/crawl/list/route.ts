import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/middleware';
import { db } from '@/lib/prisma';
import { JobStatus } from '@prisma/client';

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
