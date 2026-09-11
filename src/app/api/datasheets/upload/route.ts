import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/middleware';
import { pdfProcessingService } from '@/services/pdf/processor';
import { addDatasheetJob } from '@/jobs/crawl-job';

async function uploadDatasheet(req: NextRequest) {
  try {
    const formData = await req.formData();
    
    // Get form fields
    const file = formData.get('file') as File;
    const productId = formData.get('productId') as string;
    const manufacturerId = formData.get('manufacturerId') as string;
    const url = formData.get('url') as string;

    // Validate file
    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Validate file type
    if (!file.type.includes('pdf') && !file.name.toLowerCase().endsWith('.pdf')) {
      return NextResponse.json(
        { error: 'Only PDF files are allowed' },
        { status: 400 }
      );
    }

    // Validate file size (10MB max)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'File too large (max 10MB)' },
        { status: 400 }
      );
    }

    // Save file temporarily
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    
    // Create a temporary file path
    const tempPath = `/tmp/${Date.now()}-${file.name}`;
    require('fs').writeFileSync(tempPath, buffer);

    try {
      // Process the PDF
      const result = await pdfProcessingService.processPDF({
        url: url || `upload://${file.name}`,
        productId,
        manufacturerId,
        downloadPath: tempPath,
      });

      if (!result.success) {
        return NextResponse.json(
          { error: result.error || 'Failed to process PDF' },
          { status: 500 }
        );
      }

      // If specifications were found and productId is provided, store them
      if (result.specifications && result.specifications.length > 0 && productId) {
        // Queue a job to store the specifications
        await addDatasheetJob({
          datasheetUrl: url || `upload://${file.name}`,
          productId,
          manufacturerId,
        });
      }

      // Clean up temporary file
      require('fs').unlinkSync(tempPath);

      return NextResponse.json({
        success: true,
        filename: result.filename,
        fileSize: result.fileSize,
        pageCount: result.pageCount,
        specificationsFound: result.specifications?.length || 0,
        text: result.text.substring(0, 1000) + (result.text.length > 1000 ? '...' : ''), // Preview
      });
    } catch (error) {
      // Clean up temporary file on error
      try {
        require('fs').unlinkSync(tempPath);
      } catch (cleanupError) {
        // Ignore cleanup errors
      }
      throw error;
    }
  } catch (error) {
    console.error('Datasheet upload error:', error);
    return NextResponse.json(
      { error: 'Failed to upload datasheet' },
      { status: 500 }
    );
  }
}

export const POST = withAuth(uploadDatasheet);
