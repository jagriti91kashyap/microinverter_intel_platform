import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/middleware';
import { aiExtractionService } from '@/services/ai/extraction';
import { db } from '@/lib/prisma';
import { ChangeType } from '@prisma/client';

interface DetectChangesRequest {
  productId: string;
  newSpecifications?: Array<{
    category: string;
    name: string;
    value: string;
    unit?: string;
  }>;
  newContent?: string;
  sourceUrl?: string;
}

async function detectChanges(req: NextRequest) {
  try {
    const body: DetectChangesRequest = await req.json();

    if (!body.productId) {
      return NextResponse.json(
        { error: 'Product ID is required' },
        { status: 400 }
      );
    }

    // Get current product and specifications
    const product = await db.product.findUnique({
      where: { id: body.productId },
      include: {
        specifications: true,
        manufacturer: true,
      },
    });

    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    let newSpecifications = body.newSpecifications;

    // If new content is provided, extract specifications from it
    if (body.newContent && !newSpecifications) {
      const extractionResult = await aiExtractionService.extractSpecifications({
        content: body.newContent,
        sourceUrl: body.sourceUrl,
        productName: product.name,
        manufacturer: product.manufacturer.name,
      });
      newSpecifications = extractionResult.specifications;
    }

    if (!newSpecifications || newSpecifications.length === 0) {
      return NextResponse.json(
        { error: 'No new specifications provided' },
        { status: 400 }
      );
    }

    // Detect changes
    const changes = await aiExtractionService.detectChanges(
      product.specifications as any,
      newSpecifications as any
    );

    // Store changes in database
    const changeRecords = [];

    // Handle added specifications
    for (const spec of changes.added) {
      const record = await db.productChangeHistory.create({
        data: {
          productId: body.productId,
          field: `${spec.category}:${spec.name}`,
          newValue: `${spec.value} ${spec.unit || ''}`.trim(),
          changeType: ChangeType.SPECIFICATION_CHANGE,
          sourceUrl: body.sourceUrl,
          confidence: spec.confidence || 1.0,
        },
      });
      changeRecords.push(record);

      // Add the new specification to the product
      await db.productSpecification.create({
        data: {
          productId: body.productId,
          category: spec.category,
          name: spec.name,
          value: spec.value,
          unit: spec.unit,
          confidence: spec.confidence || 1.0,
          sourceId: body.sourceUrl,
        },
      });
    }

    // Handle removed specifications
    for (const spec of changes.removed) {
      const record = await db.productChangeHistory.create({
        data: {
          productId: body.productId,
          field: `${spec.category}:${spec.name}`,
          oldValue: `${spec.value} ${spec.unit || ''}`.trim(),
          changeType: ChangeType.SPECIFICATION_CHANGE,
          sourceUrl: body.sourceUrl,
          confidence: spec.confidence || 1.0,
        },
      });
      changeRecords.push(record);

      // Remove the specification (or mark as inactive)
      await db.productSpecification.deleteMany({
        where: {
          productId: body.productId,
          name: spec.name,
          category: spec.category,
        },
      });
    }

    // Handle modified specifications
    for (const { old: oldSpec, new: newSpec } of changes.modified) {
      const record = await db.productChangeHistory.create({
        data: {
          productId: body.productId,
          field: `${newSpec.category}:${newSpec.name}`,
          oldValue: `${oldSpec.value} ${oldSpec.unit || ''}`.trim(),
          newValue: `${newSpec.value} ${newSpec.unit || ''}`.trim(),
          changeType: ChangeType.SPECIFICATION_CHANGE,
          sourceUrl: body.sourceUrl,
          confidence: newSpec.confidence || 1.0,
        },
      });
      changeRecords.push(record);

      // Update the specification
      await db.productSpecification.updateMany({
        where: {
          productId: body.productId,
          name: newSpec.name,
          category: newSpec.category,
        },
        data: {
          value: newSpec.value,
          unit: newSpec.unit,
          confidence: newSpec.confidence || 1.0,
          sourceId: body.sourceUrl,
        },
      });
    }

    // Update product's last crawled timestamp
    await db.product.update({
      where: { id: body.productId },
      data: {
        updatedAt: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      productId: body.productId,
      changes: {
        added: changes.added.length,
        removed: changes.removed.length,
        modified: changes.modified.length,
      },
      changeRecords: changeRecords.map(record => ({
        id: record.id,
        field: record.field,
        oldValue: record.oldValue,
        newValue: record.newValue,
        changeType: record.changeType,
        detectedAt: record.detectedAt,
        confidence: record.confidence,
      })),
      totalChanges: changeRecords.length,
    });
  } catch (error) {
    console.error('Change detection error:', error);
    return NextResponse.json(
      { error: 'Failed to detect changes' },
      { status: 500 }
    );
  }
}

export const POST = withAuth(detectChanges);
