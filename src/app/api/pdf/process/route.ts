import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/middleware';
import { pdfProcessingService } from '@/services/pdf/processor';

/**
 * @typedef {Object} PDFProcessRequest
 * @property {string} url - PDF URL to process (required)
 * @property {string} [productId] - Associated product ID
 * @property {string} [manufacturerId] - Associated manufacturer ID
 * @property {boolean} [extractSpecifications=true] - Extract specifications from PDF
 */
interface PDFProcessRequest {
  url: string;
  productId?: string;
  manufacturerId?: string;
  extractSpecifications?: boolean;
}

/**
 * POST /api/pdf/process
 * 
 * Process and extract data from PDF datasheets using OCR and AI.
 * Supports caching of already-processed PDFs.
 * 
 * @param {NextRequest} req - The HTTP request object
 * @returns {Promise<NextResponse>} JSON response with extracted data (200 OK)
 * 
 * @example
 * // Request
 * POST /api/pdf/process
 * Content-Type: application/json
 * Authorization: Bearer <session_token>
 * 
 * {
 *   "url": "https://enphase.com/datasheets/iq8.pdf",
 *   "productId": "1",
 *   "manufacturerId": "1",
 *   "extractSpecifications": true
 * }
 * 
 * // Response (200 OK)
 * {
 *   "success": true,
 *   "filename": "iq8.pdf",
 *   "pages": 8,
 *   "specifications": [
 *     { "name": "AC Power", "value": "345", "unit": "W", "confidence": 0.94 }
 *   ],
 *   "text": "Full extracted text...",
 *   "processedAt": "2026-10-15T10:30:00Z"
 * }
 * 
 * @body {string} url - PDF URL (required, must be valid URL)
 * @body {string} [productId] - Associated product ID
 * @body {string} [manufacturerId] - Associated manufacturer ID
 * @body {boolean} [extractSpecifications=true] - Extract specifications
 * 
 * @throws {400} Bad Request - Missing or invalid URL
 * @throws {401} Unauthorized - Missing or invalid session
 * @throws {500} Internal Server Error - PDF processing error
 */
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
    // Error('PDF processing API error:', error);
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
    // Error('Get PDF info API error:', error);
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
    // Error('Get storage stats API error:', error);
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
    // Error('Cleanup API error:', error);
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
