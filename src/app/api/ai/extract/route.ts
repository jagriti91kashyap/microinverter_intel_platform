import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/middleware';
import { aiExtractionService } from '@/services/ai/extraction';

/**
 * @typedef {Object} ExtractRequest
 * @property {string} content - Text content to extract specifications from (required, max 50,000 chars)
 * @property {string} [sourceUrl] - URL where content was sourced from
 * @property {number} [pageNumber] - Page number if from multi-page document
 * @property {string} [productName] - Product name for context
 * @property {string} [manufacturer] - Manufacturer name for context
 */
interface ExtractRequest {
  content: string;
  sourceUrl?: string;
  pageNumber?: number;
  productName?: string;
  manufacturer?: string;
}

/**
 * Extract product specifications from text using Claude AI.
 * 
 * @param {NextRequest} req - The HTTP request object
 * @returns {Promise<NextResponse>} JSON response with extracted specifications
 * 
 * @example
 * // Request
 * POST /api/ai/extract
 * Content-Type: application/json
 * Authorization: Bearer <session_token>
 * 
 * {
 *   "content": "IQ8 Microinverter: 345W AC power, 97% efficiency, 25-year warranty",
 *   "productName": "IQ8",
 *   "manufacturer": "Enphase"
 * }
 * 
 * // Response (200 OK)
 * {
 *   "success": true,
 *   "specifications": [
 *     { "name": "AC Power", "value": "345", "unit": "W", "confidence": 0.95 },
 *     { "name": "Efficiency", "value": "97", "unit": "%", "confidence": 0.92 }
 *   ],
 *   "confidence": 0.94,
 *   "sourceUrl": "https://...",
 *   "extractedAt": "2026-10-15T10:30:00Z",
 *   "count": 2
 * }
 * 
 * @throws {400} Bad Request - Missing or invalid content
 * @throws {401} Unauthorized - Missing or invalid session
 * @throws {500} Internal Server Error - AI service error
 */
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
