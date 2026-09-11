import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/middleware';
import { aiExtractionService } from '@/services/ai/extraction';
import { AIExtractionResult } from '@/types';

interface WebExtractionRequest {
  manufacturer: string;
  productName?: string;
  includeWebSearch?: boolean;
}

async function extractFromWeb(req: NextRequest) {
  try {
    const { manufacturer, productName, includeWebSearch = true }: WebExtractionRequest = await req.json();

    if (!manufacturer) {
      return NextResponse.json(
        { error: 'Manufacturer name is required' },
        { status: 400 }
      );
    }

    let results: AIExtractionResult[] = [];

    // Perform web search extraction if enabled
    if (includeWebSearch) {
      try {
        const webResults = await aiExtractionService.extractFromWebSearch(manufacturer, productName);
        results = webResults;
      } catch (webError) {
        console.error('Web extraction failed:', webError);
        // Continue with empty results if web search fails
      }
    }

    // Generate factual summary if we have specifications
    let summary = '';
    if (results.length > 0 && results[0].specifications.length > 0) {
      try {
        summary = await aiExtractionService.generateFactualProductSummary({
          name: productName || `${manufacturer} Microinverter`,
          manufacturer,
          specifications: results[0].specifications
        });
      } catch (summaryError) {
        console.error('Summary generation failed:', summaryError);
      }
    }

    // Normalize all specifications
    const normalizedResults = results.map(result => ({
      ...result,
      specifications: aiExtractionService.normalizeSpecifications(result.specifications)
    }));

    return NextResponse.json({
      manufacturer,
      productName: productName || null,
      results: normalizedResults,
      summary,
      totalResults: results.length,
      sources: results.map(r => r.sourceUrl).filter(Boolean)
    });

  } catch (error) {
    console.error('Web extraction API error:', error);
    return NextResponse.json(
      { error: 'Failed to extract from web' },
      { status: 500 }
    );
  }
}

export const POST = withAuth(extractFromWeb);
