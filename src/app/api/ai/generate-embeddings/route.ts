import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/middleware';
import { embeddingService } from '@/services/ai/embeddings';

/**
 * @typedef {Object} GenerateEmbeddingsRequest
 * @property {string[]} productIds - Array of product IDs (required, max 50)
 * @property {string} type - Embedding type: 'product' or 'batch' (required)
 */
interface GenerateEmbeddingsRequest {
  productIds: string[];
  type: 'product' | 'batch';
}

/**
 * POST /api/ai/generate-embeddings
 * 
 * Generate vector embeddings for products using OpenAI text-embedding-3-small.
 * Embeddings are used for semantic search and similarity matching.
 * 
 * @param {NextRequest} req - The HTTP request object
 * @returns {Promise<NextResponse>} JSON response with embedding status (200 OK)
 * 
 * @example
 * // Request
 * POST /api/ai/generate-embeddings
 * Content-Type: application/json
 * Authorization: Bearer <session_token>
 * 
 * {
 *   "productIds": ["1", "2", "3"],
 *   "type": "batch"
 * }
 * 
 * // Response (200 OK)
 * {
 *   "success": true,
 *   "type": "batch",
 *   "processedCount": 3,
 *   "skippedCount": 0,
 *   "message": "Embeddings generated for 3 products",
 *   "generatedAt": "2026-10-15T10:30:00Z"
 * }
 * 
 * @body {string[]} productIds - Product IDs (required, max 50 per request)
 * @body {string} type - Type: 'product' (single) or 'batch' (multiple)
 * 
 * @throws {400} Bad Request - Missing or invalid product IDs
 * @throws {401} Unauthorized - Missing or invalid session
 * @throws {500} Internal Server Error - Embedding service error
 */
async function generateEmbeddings(req: NextRequest) {
  try {
    const body: GenerateEmbeddingsRequest = await req.json();

    // Validate required fields
    if (!body.productIds || !Array.isArray(body.productIds) || body.productIds.length === 0) {
      return NextResponse.json(
        { error: 'Product IDs array is required' },
        { status: 400 }
      );
    }

    if (!body.type || !['product', 'batch'].includes(body.type)) {
      return NextResponse.json(
        { error: 'Type must be either "product" or "batch"' },
        { status: 400 }
      );
    }

    // Limit number of products per request
    if (body.productIds.length > 50) {
      return NextResponse.json(
        { error: 'Too many product IDs (max 50 per request)' },
        { status: 400 }
      );
    }

    // Generate embeddings
    if (body.type === 'batch') {
      await embeddingService.batchGenerateEmbeddings(body.productIds);
    } else {
      for (const productId of body.productIds) {
        await embeddingService.generateProductEmbedding(productId);
      }
    }

    return NextResponse.json({
      success: true,
      message: `Embeddings generated for ${body.productIds.length} products`,
      productIds: body.productIds,
      type: body.type,
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to generate embeddings' },
      { status: 500 }
    );
  }
}

export const POST = withAuth(generateEmbeddings);
