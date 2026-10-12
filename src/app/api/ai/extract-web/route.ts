import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/middleware';
import { aiExtractionService } from '@/services/ai/extraction';
import { AIExtractionResult } from '@/types';

/**
 * @typedef {Object} WebExtractionRequest
 * @property {string} manufacturer - Manufacturer name (required)
 * @property {string} [productName] - Product name for targeted search
 * @property {boolean} [includeWebSearch=true] - Include web search results
 */
interface WebExtractionRequest {
  manufacturer: string;
  productName?: string;
  includeWebSearch?: boolean;
}

/**
 * POST /api/ai/extract-web
 * 
 * Extract product specifications from web search results using AI.
 * Performs web search and uses Claude to extract structured data.
 * 
 * @param {NextRequest} req - The HTTP request object
 * @returns {Promise<NextResponse>} JSON response with extracted specifications (200 OK)
 * 
 * @example
 * // Request
 * POST /api/ai/extract-web
 * Content-Type: application/json
 * Authorization: Bearer <session_token>
 * 
 * {
 *   "manufacturer": "Enphase Energy",
 *   "productName": "IQ8",
 *   "includeWebSearch": true
 * }
 * 
 * // Response (200 OK)
 * {
 *   "success": true,
 *   "results": [
 *     {
 *       "productName": "IQ8 Microinverter",
 *       "specifications": [
 *         { "name": "AC Power", "value": "345", "unit": "W", "confidence": 0.95 }
 *       ],
 *       "source": "https://enphase.com/products/iq8"
 *     }
 *   ],
 *   "summary": "Product summary...",
 *   "extractedAt": "2026-10-15T10:30:00Z"
 * }
 * 
 * @body {string} manufacturer - Manufacturer name (required)
 * @body {string} [productName] - Product name for targeted search
 * @body {boolean} [includeWebSearch=true] - Include web search
 * 
 * @throws {400} Bad Request - Missing manufacturer name
 * @throws {401} Unauthorized - Missing or invalid session
 * @throws {500} Internal Server Error - AI service error
 */
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
