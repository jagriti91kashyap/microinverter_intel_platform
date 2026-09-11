import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/middleware';
import { aiExtractionService } from '@/services/ai/extraction';

interface ExtractRequest {
  content: string;
  sourceUrl?: string;
  pageNumber?: number;
  productName?: string;
  manufacturer?: string;
}

async function extractSpecifications(req: NextRequest) {
  try {
    const body: ExtractRequest = await req.json();

    // Validate required fields
    if (!body.content || body.content.trim().length === 0) {
      return NextResponse.json(
        { error: 'Content is required' },
        { status: 400 }
      );
    }

    // Limit content length to prevent abuse
    if (body.content.length > 50000) {
      return NextResponse.json(
        { error: 'Content too long (max 50,000 characters)' },
        { status: 400 }
      );
    }

    // Extract specifications using AI
    const result = await aiExtractionService.extractSpecifications({
      content: body.content,
      sourceUrl: body.sourceUrl,
      pageNumber: body.pageNumber,
      productName: body.productName,
      manufacturer: body.manufacturer,
    });

    return NextResponse.json({
      success: true,
      specifications: result.specifications,
      confidence: result.confidence,
      sourceUrl: result.sourceUrl,
      extractedAt: result.extractedAt,
      count: result.specifications.length,
    });
  } catch (error) {
    console.error('AI extraction error:', error);
    return NextResponse.json(
      { error: 'Failed to extract specifications' },
      { status: 500 }
    );
  }
}

export const POST = withAuth(extractSpecifications);
