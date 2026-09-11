import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/middleware';
import { pdfProcessingService } from '@/services/pdf/processor';

interface PDFProcessRequest {
  url: string;
  productId?: string;
  manufacturerId?: string;
  extractSpecifications?: boolean;
}

async function processPDF(req: NextRequest) {
  try {
    const { url, productId, manufacturerId, extractSpecifications = true }: PDFProcessRequest = await req.json();

    if (!url) {
      return NextResponse.json(
        { error: 'PDF URL is required' },
        { status: 400 }
      );
    }

    // Validate URL format
    try {
      new URL(url);
    } catch {
      return NextResponse.json(
        { error: 'Invalid URL format' },
        { status: 400 }
      );
    }

    // Check if PDF already exists
    const existingFilename = await pdfProcessingService.pdfExists(url);
    if (existingFilename) {
      return NextResponse.json({
        success: true,
        message: 'PDF already processed',
        filename: existingFilename,
        cached: true
      });
    }

    // Process the PDF
    const result = await pdfProcessingService.processPDF({
      url,
      productId,
      manufacturerId
    });

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'PDF processing failed' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      filename: result.filename,
      fileSize: result.fileSize,
      pageCount: result.pageCount,
      specifications: extractSpecifications ? result.specifications : undefined,
      message: 'PDF processed successfully'
    });

  } catch (error) {
    console.error('PDF processing API error:', error);
    return NextResponse.json(
      { error: 'Failed to process PDF' },
      { status: 500 }
    );
  }
}

async function getPDFInfo(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const filename = searchParams.get('filename');

    if (!filename) {
      return NextResponse.json(
        { error: 'Filename is required' },
        { status: 400 }
      );
    }

    const info = await pdfProcessingService.getPDFInfo(filename);
    
    if (!info) {
      return NextResponse.json(
        { error: 'PDF not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(info);

  } catch (error) {
    console.error('Get PDF info API error:', error);
    return NextResponse.json(
      { error: 'Failed to get PDF info' },
      { status: 500 }
    );
  }
}

async function getStorageStats(req: NextRequest) {
  try {
    const stats = await pdfProcessingService.getStorageStats();
    return NextResponse.json(stats);
  } catch (error) {
    console.error('Get storage stats API error:', error);
    return NextResponse.json(
      { error: 'Failed to get storage stats' },
      { status: 500 }
    );
  }
}

async function cleanupOldFiles(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const olderThanDays = parseInt(searchParams.get('days') || '30');

    await pdfProcessingService.cleanupOldFiles(olderThanDays);
    
    return NextResponse.json({
      success: true,
      message: `Cleaned up files older than ${olderThanDays} days`
    });

  } catch (error) {
    console.error('Cleanup API error:', error);
    return NextResponse.json(
      { error: 'Failed to cleanup files' },
      { status: 500 }
    );
  }
}

export const POST = withAuth(processPDF);
export const GET = withAuth(async (req: NextRequest) => {
  const { searchParams } = new URL(req.url);
  const action = searchParams.get('action');
  
  switch (action) {
    case 'info':
      return getPDFInfo(req);
    case 'stats':
      return getStorageStats(req);
    case 'cleanup':
      return cleanupOldFiles(req);
    default:
      return NextResponse.json(
        { error: 'Invalid action. Use: info, stats, or cleanup' },
        { status: 400 }
      );
  }
});
