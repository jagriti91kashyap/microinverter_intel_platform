import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/middleware';
import { aiSummarizationService } from '@/services/ai/summarization';
import { db } from '@/lib/prisma';

interface InsightsRequest {
  type: 'market' | 'manufacturer' | 'comparison' | 'changes';
  timeRange?: 'week' | 'month' | 'quarter' | 'year';
  focusArea?: 'efficiency' | 'power' | 'warranty' | 'new_products';
  manufacturerId?: string;
  productIds?: string[];
}

async function getAIInsights(req: NextRequest) {
  try {
    const body: InsightsRequest = await req.json();

    // Validate required fields
    if (!body.type) {
      return NextResponse.json(
        { error: 'Insight type is required' },
        { status: 400 }
      );
    }

    let result;

    switch (body.type) {
      case 'market':
        result = await getMarketInsights(body);
        break;
      
      case 'manufacturer':
        result = await getManufacturerInsights(body);
        break;
      
      case 'comparison':
        result = await getComparisonInsights(body);
        break;
      
      case 'changes':
        result = await getChangeInsights(body);
        break;
      
      default:
        return NextResponse.json(
          { error: 'Invalid insight type' },
          { status: 400 }
        );
    }

    return NextResponse.json({
      success: true,
      type: body.type,
      data: result,
      generatedAt: new Date(),
    });
  } catch (error) {
    console.error('AI insights error:', error);
    return NextResponse.json(
      { error: 'Failed to generate insights' },
      { status: 500 }
    );
  }
}

async function getMarketInsights(request: InsightsRequest) {
  // Get products for market analysis
  const products = await db.product.findMany({
    where: { status: 'ACTIVE' },
    include: {
      manufacturer: true,
      specifications: true,
    },
    take: 100, // Limit for performance
  });

  if (!products || products.length === 0) {
    return { summary: 'No products available for analysis', trends: [], recommendations: [] };
  }

  return await aiSummarizationService.generateMarketInsights({
    products: products as any,
    timeRange: request.timeRange,
    focusArea: request.focusArea,
  });
}

async function getManufacturerInsights(request: InsightsRequest) {
  if (!request.manufacturerId) {
    throw new Error('Manufacturer ID is required for manufacturer insights');
  }

  const manufacturer = await db.manufacturer.findUnique({
    where: { id: request.manufacturerId },
    include: {
      products: {
        where: { status: 'ACTIVE' },
        include: {
          specifications: true,
        },
      },
    },
  });

  if (!manufacturer) {
    throw new Error('Manufacturer not found');
  }

  return await aiSummarizationService.generateManufacturerOverview(
    manufacturer as any,
    manufacturer.products as any
  );
}

async function getComparisonInsights(request: InsightsRequest) {
  if (!request.productIds || request.productIds.length < 2) {
    throw new Error('At least 2 product IDs are required for comparison');
  }

  const products = await db.product.findMany({
    where: {
      id: { in: request.productIds },
      status: 'ACTIVE',
    },
    include: {
      manufacturer: true,
      specifications: true,
    },
  });

  if (!products || products.length < 2) {
    throw new Error('Not enough valid products found for comparison');
  }

  const allSpecifications = products.flatMap(p => p.specifications);

  return await aiSummarizationService.generateComparisonSummary({
    products: products as any,
    specifications: allSpecifications as any,
  });
}

async function getChangeInsights(request: InsightsRequest) {
  // Get recent changes from the database using raw SQL
  const changes = await db.$queryRaw<any[]>`
    SELECT 
      pch.*,
      p.name as product_name,
      p.model as product_model,
      m.name as manufacturer_name
    FROM product_change_history pch
    JOIN products p ON pch.product_id = p.id
    JOIN manufacturers m ON p.manufacturer_id = m.id
    WHERE pch.detected_at >= ${new Date(Date.now() - (30 * 24 * 60 * 60 * 1000))}
    ORDER BY pch.detected_at DESC
    LIMIT 50
  `;

  if (!changes || changes.length === 0) {
    return { summary: 'No recent changes detected', trends: [], recommendations: [] };
  }

  // Generate summary of changes
  const changeSummary = `Detected ${changes.length} recent changes across products. ` +
    `Changes include: ${changes.slice(0, 5).map((c: any) => `${c.changeType} for ${c.product_name}`).join(', ')}`;

  return {
    summary: changeSummary,
    trends: [
      'Specification updates detected',
      'New product announcements',
      'Warranty policy changes',
    ],
    recommendations: [
      'Review updated specifications for accuracy',
      'Update product documentation',
      'Monitor competitor changes',
    ],
  };
}

export const POST = withAuth(getAIInsights);
