import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/middleware';
import { embeddingService } from '@/services/ai/embeddings';

interface GenerateEmbeddingsRequest {
  productIds: string[];
  type: 'product' | 'batch';
}

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
    console.error('Generate embeddings error:', error);
    return NextResponse.json(
      { error: 'Failed to generate embeddings' },
      { status: 500 }
    );
  }
}

export const POST = withAuth(generateEmbeddings);
