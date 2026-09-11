import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';
import { aiExtractionService } from '@/services/ai/extraction';
import { db } from '@/lib/prisma';

export interface PDFProcessingRequest {
  url: string;
  productId?: string;
  manufacturerId?: string;
  downloadPath?: string;
}

export interface PDFProcessingResult {
  success: boolean;
  filename: string;
  fileSize: number;
  pageCount: number;
  text: string;
  specifications?: any[];
  error?: string;
}

export interface PDFMetadata {
  title?: string;
  author?: string;
  subject?: string;
  creator?: string;
  producer?: string;
  creationDate?: Date;
  modificationDate?: Date;
  pageCount: number;
  fileSize: number;
}

export class PDFProcessingService {
  private downloadPath: string;

  constructor() {
    this.downloadPath = path.join(process.cwd(), 'downloads', 'datasheets');
    this.ensureDownloadDirectory();
  }

  /**
   * Ensure download directory exists
   */
  private ensureDownloadDirectory(): void {
    if (!fs.existsSync(this.downloadPath)) {
      fs.mkdirSync(this.downloadPath, { recursive: true });
    }
  }

  /**
   * Download PDF from URL
   */
  async downloadPDF(url: string): Promise<{ filename: string; path: string; fileSize: number }> {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const buffer = await response.arrayBuffer();
      const fileSize = buffer.byteLength;

      // Generate unique filename
      const urlHash = crypto.createHash('md5').update(url).digest('hex');
      const filename = `${urlHash}.pdf`;
      const filePath = path.join(this.downloadPath, filename);

      // Save file
      fs.writeFileSync(filePath, Buffer.from(buffer));

      return { filename, path: filePath, fileSize };
    } catch (error) {
      console.error('PDF download error:', error);
      throw new Error(`Failed to download PDF: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Extract text from PDF file
   */
  async extractTextFromPDF(filePath: string): Promise<{ text: string; pageCount: number }> {
    try {
      const pdfParse = require('pdf-parse');
      const dataBuffer = fs.readFileSync(filePath);
      
      const data = await pdfParse(dataBuffer);
      
      return {
        text: data.text,
        pageCount: data.numpages || 0,
      };
    } catch (error) {
      console.error('PDF text extraction error:', error);
      throw new Error(`Failed to extract text from PDF: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Extract metadata from PDF
   */
  async extractPDFMetadata(filePath: string): Promise<PDFMetadata> {
    try {
      const pdfParse = require('pdf-parse');
      const dataBuffer = fs.readFileSync(filePath);
      
      const data = await pdfParse(dataBuffer);
      const stats = fs.statSync(filePath);
      
      return {
        title: data.info?.Title,
        author: data.info?.Author,
        subject: data.info?.Subject,
        creator: data.info?.Creator,
        producer: data.info?.Producer,
        creationDate: data.info?.CreationDate ? new Date(data.info.CreationDate) : undefined,
        modificationDate: data.info?.ModDate ? new Date(data.info.ModDate) : undefined,
        pageCount: data.numpages || 0,
        fileSize: stats.size,
      };
    } catch (error) {
      console.error('PDF metadata extraction error:', error);
      throw new Error(`Failed to extract PDF metadata: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Process PDF for specification extraction
   */
  async processPDF(request: PDFProcessingRequest): Promise<PDFProcessingResult> {
    try {
      console.log(`Processing PDF: ${request.url}`);

      // Download PDF
      const { filename, path: filePath, fileSize } = await this.downloadPDF(request.url);

      // Extract text and metadata
      const { text, pageCount } = await this.extractTextFromPDF(filePath);
      const metadata = await this.extractPDFMetadata(filePath);

      // Clean and normalize PDF text before any processing
      const cleanedText = this.cleanPDFText(text);

      // Extract specifications using multiple methods
      let specifications: any[] = [];
      
      try {
        // Method 1: Extract from tables first (most reliable)
        const tableSpecs = await this.extractSpecificationsFromTables(filePath);
        specifications = specifications.concat(tableSpecs);
        
        // Method 2: AI extraction — chunk large documents by page breaks
        const chunks = this.chunkTextForExtraction(cleanedText, pageCount);
        
        for (let i = 0; i < chunks.length; i++) {
          const extractionResult = await aiExtractionService.extractSpecifications({
            content: chunks[i],
            sourceUrl: request.url,
            productName: metadata.title,
            manufacturer: request.manufacturerId,
            pageNumber: chunks.length > 1 ? i + 1 : undefined,
          });
          
          // Merge AI results with existing results, avoiding duplicates (prefer higher confidence)
          for (const aiSpec of extractionResult.specifications) {
            const existing = specifications.find(s =>
              s.name.toLowerCase() === aiSpec.name.toLowerCase()
            );
            if (!existing) {
              specifications.push(aiSpec);
            } else if (aiSpec.confidence > (existing.confidence || 0)) {
              // Replace with higher-confidence version
              const idx = specifications.indexOf(existing);
              specifications[idx] = aiSpec;
            }
          }
        }
        
        // Normalize specifications
        specifications = aiExtractionService.normalizeSpecifications(specifications);
        
        // Validate extracted values
        specifications = aiExtractionService.validateExtractedSpecs(specifications);
        
        // Second-pass: re-prompt for any required fields that were missed
        specifications = await aiExtractionService.extractMissingFields(
          specifications,
          cleanedText,
          {
            content: cleanedText,
            sourceUrl: request.url,
            productName: metadata.title,
            manufacturer: request.manufacturerId,
          }
        );
        
      } catch (error) {
        console.error('Specification extraction failed:', error);
        // Continue with empty specifications
      }

      // Store in database if productId provided
      if (request.productId) {
        await this.storeDatasheetRecord({
          productId: request.productId,
          url: request.url,
          filename,
          fileSize,
          pageCount,
          metadata,
        });
      }

      console.log(`PDF processing completed: ${filename} — ${specifications.length} specs extracted`);
      
      return {
        success: true,
        filename,
        fileSize,
        pageCount,
        text: cleanedText,
        specifications,
      };
    } catch (error) {
      console.error('PDF processing error:', error);
      return {
        success: false,
        filename: '',
        fileSize: 0,
        pageCount: 0,
        text: '',
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Split text into chunks for extraction (page-based for large PDFs)
   */
  private chunkTextForExtraction(text: string, pageCount: number): string[] {
    // For small documents (≤3 pages or <6000 chars), send as single chunk
    if (pageCount <= 3 || text.length < 6000) {
      return [text];
    }

    // Split on page break markers inserted by cleanPDFText
    const pageChunks = text.split('---PAGE BREAK---').filter(c => c.trim().length > 50);
    
    if (pageChunks.length <= 1) {
      // No page breaks found — split by character count (~4000 chars per chunk with 500 char overlap)
      const chunks: string[] = [];
      const chunkSize = 4000;
      const overlap = 500;
      for (let i = 0; i < text.length; i += chunkSize - overlap) {
        chunks.push(text.slice(i, i + chunkSize));
      }
      return chunks;
    }

    // Group pages into chunks of 2-3 pages each to stay within optimal context size
    const grouped: string[] = [];
    for (let i = 0; i < pageChunks.length; i += 2) {
      const chunk = pageChunks.slice(i, i + 2).join('\n\n');
      grouped.push(chunk);
    }
    return grouped;
  }

  /**
   * Store datasheet record in database
   */
  private async storeDatasheetRecord(data: {
    productId: string;
    url: string;
    filename: string;
    fileSize: number;
    pageCount: number;
    metadata: PDFMetadata;
  }): Promise<void> {
    try {
      await db.$queryRaw`
        INSERT INTO datasheets (
          product_id, url, filename, file_size, page_count, checksum, extracted_at, created_at, updated_at
        ) VALUES (
          ${data.productId}, 
          ${data.url}, 
          ${data.filename}, 
          ${data.fileSize}, 
          ${data.pageCount}, 
          ${crypto.createHash('md5').update(data.url).digest('hex')}, 
          NOW(), 
          NOW(), 
          NOW()
        )
      `;
    } catch (error) {
      console.error('Failed to store datasheet record:', error);
      // Don't throw - the PDF processing was successful
    }
  }

  /**
   * Process PDF by pages for better extraction (now handled by processPDF via chunking)
   */
  async processPDFByPages(request: PDFProcessingRequest): Promise<PDFProcessingResult> {
    // processPDF now automatically chunks large PDFs by page breaks
    return this.processPDF(request);
  }

  /**
   * Extract tables from PDF
   */
  async extractTablesFromPDF(filePath: string): Promise<any[]> {
    try {
      // For now, implement basic table detection from text
      const { text } = await this.extractTextFromPDF(filePath);
      const tables = this.extractTablesFromText(text);
      
      return tables;
    } catch (error) {
      console.error('PDF table extraction error:', error);
      return [];
    }
  }

  /**
   * Clean and normalize raw PDF text before sending to AI
   */
  cleanPDFText(text: string): string {
    let cleaned = text;

    // Fix common PDF ligatures and encoding artifacts
    cleaned = cleaned.replace(/ﬁ/g, 'fi').replace(/ﬂ/g, 'fl').replace(/ﬀ/g, 'ff');
    cleaned = cleaned.replace(/\u00AD/g, '-'); // soft hyphen
    cleaned = cleaned.replace(/\u2013/g, '-').replace(/\u2014/g, '-'); // en-dash, em-dash → hyphen
    cleaned = cleaned.replace(/\u2018|\u2019/g, "'").replace(/\u201C|\u201D/g, '"'); // smart quotes
    cleaned = cleaned.replace(/\u00B0/g, '°'); // degree symbol normalization
    cleaned = cleaned.replace(/\u2264/g, '<=').replace(/\u2265/g, '>='); // math symbols
    cleaned = cleaned.replace(/\u00D7/g, '×'); // multiplication sign

    // Collapse repeated blank lines (>2 → 2)
    cleaned = cleaned.replace(/\n{3,}/g, '\n\n');

    // Remove form-feed / page-break characters
    cleaned = cleaned.replace(/\f/g, '\n---PAGE BREAK---\n');

    // Fix lines that got split mid-value (e.g. "Max Input\nVoltage  60 VDC" → "Max Input Voltage  60 VDC")
    // Heuristic: if a line ends with a word and the next line starts with a word (no number), join them
    const lines = cleaned.split('\n');
    const joined: string[] = [];
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trimEnd();
      const next = i < lines.length - 1 ? lines[i + 1].trimStart() : '';
      // Join if current line ends with a letter and next starts with a lowercase letter or known continuation
      if (line.length > 0 && next.length > 0 &&
          /[a-zA-Z]$/.test(line) && /^[a-z]/.test(next) &&
          !next.match(/^\d/) && line.length < 60) {
        joined.push(line + ' ' + next);
        i++; // skip next
      } else {
        joined.push(line);
      }
    }
    cleaned = joined.join('\n');

    return cleaned;
  }

  /**
   * Extract tables from text using improved spec-line detection
   */
  private extractTablesFromText(text: string): any[] {
    const tables: any[] = [];
    const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);

    // Strategy 1: Detect "Label  Value" spec lines (most common in datasheets)
    const specLines: string[][] = [];
    for (const line of lines) {
      // Match lines like "Max Input Voltage   60 VDC" or "Weight\t1.08 kg"
      const match = line.match(/^(.{3,50}?)\s{2,}(.+)$/);
      if (match) {
        specLines.push([match[1].trim(), match[2].trim()]);
      }
    }
    if (specLines.length >= 3) {
      tables.push(this.formatTable([['Specification', 'Value'], ...specLines]));
    }

    // Strategy 2: Detect multi-column tables (3+ consistent columns)
    let currentTable: string[][] = [];
    for (const line of lines) {
      const columns = line.split(/\s{2,}|\t/).map(col => col.trim()).filter(col => col.length > 0);
      if (columns.length >= 3) {
        if (currentTable.length === 0 || Math.abs(columns.length - currentTable[0].length) <= 1) {
          currentTable.push(columns);
        } else if (currentTable.length >= 2) {
          tables.push(this.formatTable(currentTable));
          currentTable = [columns];
        }
      } else if (currentTable.length >= 2) {
        tables.push(this.formatTable(currentTable));
        currentTable = [];
      }
    }
    if (currentTable.length >= 2) {
      tables.push(this.formatTable(currentTable));
    }

    // Strategy 3: Look for "key: value" or "key = value" patterns
    const kvPairs: string[][] = [];
    for (const line of lines) {
      const kvMatch = line.match(/^(.{3,50}?)\s*[:=]\s*(.+)$/);
      if (kvMatch && !kvMatch[1].match(/^https?:/) && !kvMatch[2].match(/^\/\//)) {
        kvPairs.push([kvMatch[1].trim(), kvMatch[2].trim()]);
      }
    }
    if (kvPairs.length >= 3) {
      tables.push(this.formatTable([['Specification', 'Value'], ...kvPairs]));
    }

    return tables;
  }

  /**
   * Parse a single table row
   */
  private parseTableRow(line: string): string[] {
    const columns = line.split(/\s{2,}|\t/).map(col => col.trim()).filter(col => col.length > 0);
    return columns;
  }

  /**
   * Format table data
   */
  private formatTable(rows: string[][]): any {
    if (rows.length < 2) return null;
    
    const headers = rows[0];
    const data = rows.slice(1);
    
    return {
      headers,
      rows: data.map(row => {
        const obj: any = {};
        headers.forEach((header, index) => {
          obj[header] = row[index] || '';
        });
        return obj;
      })
    };
  }

  /**
   * Extract specifications from tables
   */
  async extractSpecificationsFromTables(filePath: string): Promise<any[]> {
    try {
      const tables = await this.extractTablesFromPDF(filePath);
      const specifications: any[] = [];
      
      for (const table of tables) {
        if (!table) continue;
        
        // Look for specification tables (typically have 2 columns)
        if (table.headers.length >= 2) {
          for (const row of table.rows) {
            const specName = Object.values(row)[0] as string;
            const specValue = Object.values(row)[1] as string;
            
            if (specName && specValue && this.isLikelySpecification(specName)) {
              specifications.push({
                name: specName.trim(),
                value: specValue.trim(),
                unit: this.extractUnit(specValue),
                category: this.categorizeSpecification(specName)
              });
            }
          }
        }
      }
      
      return specifications;
    } catch (error) {
      console.error('Specification table extraction error:', error);
      return [];
    }
  }

  /**
   * Check if a text is likely a specification name
   */
  private isLikelySpecification(text: string): boolean {
    const specKeywords = [
      'power', 'voltage', 'current', 'efficiency', 'warranty', 'weight',
      'dimensions', 'temperature', 'frequency', 'mppt', 'input', 'output',
      'rating', 'protection', 'certification', 'ip', 'nema',
      'voc', 'isc', 'thd', 'harmonic', 'standby', 'night', 'consumption',
      'start-up', 'startup', 'start up', 'surge', 'connector', 'communication',
      'monitoring', 'plc', 'wifi', 'zigbee', 'model', 'sku', 'part number',
      'series', 'rapid shutdown', 'system voltage', 'dc input', 'ac output',
      'weighted', 'cec', 'euro', 'peak', 'max', 'nominal', 'rated'
    ];
    
    const lowerText = text.toLowerCase();
    return specKeywords.some(keyword => lowerText.includes(keyword));
  }

  /**
   * Extract unit from specification value
   */
  private extractUnit(value: string): string {
    const unitPatterns = [
      /\b(V|VDC|VAC)\b/i,
      /\b(W|kW)\b/i,
      /\b(A|mA)\b/i,
      /\b(%)\b/i,
      /\b(Hz)\b/i,
      /\b(kg|g)\b/i,
      /\b(mm|cm|inch)\b/i,
      /\b(°C|°F)\b/i
    ];
    
    for (const pattern of unitPatterns) {
      const match = value.match(pattern);
      if (match) return match[0];
    }
    
    return '';
  }

  /**
   * Categorize specification
   */
  private categorizeSpecification(name: string): string {
    const lowerName = name.toLowerCase();
    
    if (lowerName.includes('power') || lowerName.includes('output')) return 'Power';
    if (lowerName.includes('voltage') || lowerName.includes('current')) return 'Electrical';
    if (lowerName.includes('efficiency')) return 'Performance';
    if (lowerName.includes('warranty')) return 'Warranty';
    if (lowerName.includes('weight') || lowerName.includes('dimension')) return 'Mechanical';
    if (lowerName.includes('temperature')) return 'Environmental';
    if (lowerName.includes('ip') || lowerName.includes('nema')) return 'Protection';
    
    return 'General';
  }

  /**
   * Extract images from PDF
   */
  async extractImagesFromPDF(filePath: string): Promise<string[]> {
    try {
      // This would require a PDF library that can handle images
      // For now, return empty array
      console.log('Image extraction not yet implemented');
      return [];
    } catch (error) {
      console.error('PDF image extraction error:', error);
      return [];
    }
  }

  /**
   * Clean up old PDF files
   */
  async cleanupOldFiles(olderThanDays: number = 30): Promise<void> {
    try {
      const files = fs.readdirSync(this.downloadPath);
      const cutoffTime = Date.now() - (olderThanDays * 24 * 60 * 60 * 1000);

      for (const file of files) {
        const filePath = path.join(this.downloadPath, file);
        const stats = fs.statSync(filePath);
        
        if (stats.mtime.getTime() < cutoffTime) {
          fs.unlinkSync(filePath);
          console.log(`Deleted old PDF: ${file}`);
        }
      }
    } catch (error) {
      console.error('Cleanup error:', error);
    }
  }

  /**
   * Get PDF file information
   */
  async getPDFInfo(filename: string): Promise<PDFMetadata | null> {
    try {
      const filePath = path.join(this.downloadPath, filename);
      if (!fs.existsSync(filePath)) {
        return null;
      }

      return await this.extractPDFMetadata(filePath);
    } catch (error) {
      console.error('Get PDF info error:', error);
      return null;
    }
  }

  /**
   * Check if PDF already exists
   */
  async pdfExists(url: string): Promise<string | null> {
    try {
      const checksum = crypto.createHash('md5').update(url).digest('hex');
      const datasheets = await db.$queryRaw<any[]>`
        SELECT filename FROM datasheets WHERE checksum = ${checksum} LIMIT 1
      `;

      return datasheets[0]?.filename || null;
    } catch (error) {
      console.error('Check PDF existence error:', error);
      return null;
    }
  }

  /**
   * Batch process multiple PDFs
   */
  async batchProcessPDFs(requests: PDFProcessingRequest[]): Promise<PDFProcessingResult[]> {
    const results: PDFProcessingResult[] = [];
    
    for (const request of requests) {
      try {
        const result = await this.processPDF(request);
        results.push(result);
        
        // Add delay to avoid overwhelming servers
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (error) {
        results.push({
          success: false,
          filename: '',
          fileSize: 0,
          pageCount: 0,
          text: '',
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }
    
    return results;
  }

  /**
   * Validate PDF file
   */
  async validatePDF(filePath: string): Promise<boolean> {
    try {
      const stats = fs.statSync(filePath);
      if (stats.size === 0) return false;
      
      // Try to extract first page to validate
      const { text } = await this.extractTextFromPDF(filePath);
      return text.length > 0;
    } catch (error) {
      return false;
    }
  }

  /**
   * Get storage statistics
   */
  async getStorageStats(): Promise<{
    totalFiles: number;
    totalSize: number;
    oldestFile: Date | null;
    newestFile: Date | null;
  }> {
    try {
      const files = fs.readdirSync(this.downloadPath);
      let totalSize = 0;
      let oldestTime = Date.now();
      let newestTime = 0;

      for (const file of files) {
        const filePath = path.join(this.downloadPath, file);
        const stats = fs.statSync(filePath);
        
        totalSize += stats.size;
        oldestTime = Math.min(oldestTime, stats.mtime.getTime());
        newestTime = Math.max(newestTime, stats.mtime.getTime());
      }

      return {
        totalFiles: files.length,
        totalSize,
        oldestFile: files.length > 0 ? new Date(oldestTime) : null,
        newestFile: files.length > 0 ? new Date(newestTime) : null,
      };
    } catch (error) {
      console.error('Get storage stats error:', error);
      return {
        totalFiles: 0,
        totalSize: 0,
        oldestFile: null,
        newestFile: null,
      };
    }
  }
}

export const pdfProcessingService = new PDFProcessingService();
