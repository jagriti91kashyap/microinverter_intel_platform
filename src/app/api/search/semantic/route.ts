import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/middleware';
import { embeddingService } from '@/services/ai/embeddings';

interface SemanticSearchRequest {
  query: string;
  limit?: number;
  threshold?: number;
  filters?: {
    manufacturerId?: string;
    powerRange?: { min: number; max: number };
    status?: string;
  };
}

async function semanticSearch(req: NextRequest) {
  try {
    const body: SemanticSearchRequest = await req.json();

    // Validate required fields
    if (!body.query || body.query.trim().length === 0) {
      return NextResponse.json(
        { error: 'Search query is required' },
        { status: 400 }
      );
    }

    // Validate query length
    if (body.query.length > 1000) {
      return NextResponse.json(
        { error: 'Query too long (max 1000 characters)' },
        { status: 400 }
      );
    }

    // Set defaults
    const limit = Math.min(body.limit || 20, 50); // Max 50 results
    const threshold = Math.max(body.threshold || 0.7, 0.1); // Min 0.1 threshold

    // Perform semantic search
    const results = await embeddingService.semanticSearch({
      query: body.query.trim(),
      limit,
      threshold,
      filters: body.filters,
    });

    return NextResponse.json({
      success: true,
      query: body.query,
      results,
      count: results.length,
      threshold,
      filters: body.filters,
    });
  } catch (error) {
    console.error('Semantic search error:', error);
    return NextResponse.json(
      { error: 'Failed to perform semantic search' },
      { status: 500 }
    );
  }
}

export const POST = withAuth(semanticSearch);
