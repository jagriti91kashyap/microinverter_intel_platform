import { Browser, Page, BrowserContext } from 'playwright';
import { chromium } from 'playwright';
import { db } from '@/lib/prisma';
import { JobStatus } from '@prisma/client';

export interface CrawlRequest {
  manufacturerId?: string;
  url: string;
  crawlType: 'MANUFACTURER' | 'PRODUCT' | 'DATASHEET';
  priority?: number;
  metadata?: Record<string, any>;
}

export interface CrawlResult {
  productsFound: ProductData[];
  datasheetsFound: DatasheetData[];
  links: string[];
  errors: string[];
}

export interface ProductData {
  name: string;
  series?: string;
  model?: string;
  url: string;
  specifications?: Record<string, any>;
  datasheetUrl?: string;
  imageUrl?: string;
  description?: string;
}

export interface DatasheetData {
  url: string;
  filename: string;
  title: string;
  fileSize?: number;
  productContext?: string;
}

export interface CrawlConfig {
  maxDepth: number;
  maxPages: number;
  delay: number;
  userAgent: string;
  timeout: number;
  respectRobotsTxt: boolean;
}

export class WebCrawlerService {
  private browser: Browser | null = null;
  private context: BrowserContext | null = null;
  private config: CrawlConfig;

  constructor() {
    this.config = {
      maxDepth: 3,
      maxPages: 50,
      delay: 1000, // 1 second delay between requests
      userAgent: 'Microinverter Platform Bot 1.0 (info@microinverter-platform.com)',
      timeout: 30000, // 30 seconds
      respectRobotsTxt: true,
    };
  }

  /**
   * Initialize the browser instance
   */
  async initialize(): Promise<void> {
    try {
      this.browser = await chromium.launch({
        headless: true,
        args: [
          '--no-sandbox',
          '--disable-dev-shm-usage',
          '--disable-web-security',
          '--disable-features=VizDisplayCompositor',
        ],
      });

      this.context = await this.browser.newContext({
        userAgent: this.config.userAgent,
        viewport: { width: 1920, height: 1080 },
      });

      // Set up request interception for monitoring
      await this.context.route('**/*', (route) => {
        const resourceType = route.request().resourceType();
        // Block unnecessary resources to speed up crawling
        if (['image', 'stylesheet', 'font', 'media'].includes(resourceType)) {
          route.abort();
        } else {
          route.continue();
        }
      });

      console.log('Web crawler initialized successfully');
    } catch (error) {
      console.error('Failed to initialize web crawler:', error);
      throw new Error(`Crawler initialization failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Close the browser instance
   */
  async close(): Promise<void> {
    try {
      if (this.context) {
        await this.context.close();
        this.context = null;
      }
      if (this.browser) {
        await this.browser.close();
        this.browser = null;
      }
      console.log('Web crawler closed');
    } catch (error) {
      console.error('Error closing web crawler:', error);
    }
  }

  /**
   * Start a new crawl job
   */
  async startCrawl(request: CrawlRequest): Promise<string> {
    try {
      // Create crawl job record using raw SQL
      const crawlJob = await db.$queryRaw<any[]>`
        INSERT INTO crawl_jobs (
          manufacturer_id, url, crawl_type, priority, metadata, status, created_at, updated_at
        ) VALUES (
          ${request.manufacturerId || null}, 
          ${request.url}, 
          ${request.crawlType}, 
          ${request.priority || 5}, 
          ${JSON.stringify(request.metadata || {})}, 
          ${JobStatus.PENDING}, 
          NOW(), 
          NOW()
        ) RETURNING *
      `;
      
      const job = crawlJob[0];

      if (!job) {
        throw new Error('Failed to create crawl job');
      }

      console.log(`Started crawl job ${job.id} for ${request.url}`);
      return job.id;
    } catch (error) {
      console.error('Failed to start crawl:', error);
      throw new Error(`Crawl start failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Execute a crawl job
   */
  async executeCrawl(jobId: string): Promise<CrawlResult> {
    const jobs = await db.$queryRaw<any[]>`
      SELECT * FROM crawl_jobs WHERE id = ${jobId} LIMIT 1
    `;
    const job = jobs[0];
    if (!job) {
      throw new Error(`Crawl job not found: ${jobId}`);
    }

    try {
      // Update job status to running using raw SQL
      await db.$queryRaw`
        UPDATE crawl_jobs 
        SET status = ${JobStatus.RUNNING}, started_at = NOW(), updated_at = NOW()
        WHERE id = ${jobId}
      `;

      // Initialize browser if not already done
      if (!this.browser) {
        await this.initialize();
      }

      // Execute crawl based on type
      let result: CrawlResult;
      switch ((job as any).crawlType) {
        case 'MANUFACTURER':
          result = await this.crawlManufacturerSite(job.url, job.manufacturerId);
          break;
        case 'PRODUCT_PAGE':
          result = await this.crawlProductPage(job.url);
          break;
        case 'DATASHEET':
          result = await this.processDatasheet(job.url);
          break;
        case 'CHANGE_DETECTION':
          result = await this.detectChanges(job.url, job.manufacturerId || undefined);
          break;
        default:
          throw new Error(`Unsupported crawl type: ${(job as any).crawlType}`);
      }

      // Update job with results using raw SQL
      await db.$queryRaw`
        UPDATE crawl_jobs 
        SET 
          status = ${JobStatus.COMPLETED}, 
          completed_at = NOW(), 
          updated_at = NOW(),
          products_found = ${result.productsFound.length},
          datasheets_found = ${result.datasheetsFound.length},
          specifications_extracted = ${result.productsFound.reduce((sum, p) => sum + (p.specifications ? Object.keys(p.specifications).length : 0), 0)}
        WHERE id = ${jobId}
      `;

      console.log(`Crawl job ${jobId} completed successfully`);
      return result;
    } catch (error) {
      console.error(`Crawl job ${jobId} failed:`, error);
      
      // Update job with error
      await db.crawlJob.update({
        where: { id: jobId },
        data: {
          status: JobStatus.FAILED,
          completedAt: new Date(),
          error: error instanceof Error ? error.message : 'Unknown error',
        },
      });

      throw error;
    }
  }

  /**
   * Crawl manufacturer website for products
   */
  private async crawlManufacturerSite(url: string, manufacturerId?: string): Promise<CrawlResult> {
    if (!this.context) {
      throw new Error('Browser context not initialized');
    }

    const result: CrawlResult = {
      productsFound: [],
      datasheetsFound: [],
      links: [],
      errors: [],
    };

    try {
      const page = await this.context.newPage();
      await page.goto(url, { waitUntil: 'networkidle', timeout: this.config.timeout });

      // Look for product links
      const productLinks = await this.findProductLinks(page);
      result.links.push(...productLinks);

      // Visit each product page
      for (const link of productLinks.slice(0, this.config.maxPages)) {
        try {
          await page.goto(link, { waitUntil: 'networkidle', timeout: this.config.timeout });
          await this.delay(this.config.delay);

          const productData = await this.extractProductData(page, link);
          if (productData) {
            result.productsFound.push(productData);

            // Look for datasheets on product page
            const datasheetLinks = await this.findDatasheetLinks(page);
            for (const datasheet of datasheetLinks) {
              result.datasheetsFound.push({
                ...datasheet,
                productContext: productData.name,
              });
            }
          }
        } catch (error) {
          result.errors.push(`Failed to process ${link}: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      }

      await page.close();
    } catch (error) {
      result.errors.push(`Crawl failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    return result;
  }

  /**
   * Crawl a specific product page
   */
  private async crawlProductPage(url: string): Promise<CrawlResult> {
    if (!this.context) {
      throw new Error('Browser context not initialized');
    }

    const result: CrawlResult = {
      productsFound: [],
      datasheetsFound: [],
      links: [],
      errors: [],
    };

    try {
      const page = await this.context.newPage();
      await page.goto(url, { waitUntil: 'networkidle', timeout: this.config.timeout });

      const productData = await this.extractProductData(page, url);
      if (productData) {
        result.productsFound.push(productData);

        // Find datasheets
        const datasheetLinks = await this.findDatasheetLinks(page);
        result.datasheetsFound.push(...datasheetLinks);
      }

      await page.close();
    } catch (error) {
      result.errors.push(`Product page crawl failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    return result;
  }

  /**
   * Process a datasheet (download and basic info)
   */
  private async processDatasheet(url: string): Promise<CrawlResult> {
    const result: CrawlResult = {
      productsFound: [],
      datasheetsFound: [],
      links: [],
      errors: [],
    };

    try {
      // For now, just get basic info about the datasheet
      // In a full implementation, this would download and process the PDF
      const filename = url.split('/').pop() || 'datasheet.pdf';
      
      result.datasheetsFound.push({
        url,
        filename,
        title: filename.replace('.pdf', '').replace(/[-_]/g, ' '),
      });
    } catch (error) {
      result.errors.push(`Datasheet processing failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    return result;
  }

  /**
   * Detect changes on a page
   */
  private async detectChanges(url: string, manufacturerId?: string): Promise<CrawlResult> {
    // This would compare current page content with stored content
    // For now, just crawl the page normally
    return this.crawlProductPage(url);
  }

  /**
   * Find product links on a page
   */
  private async findProductLinks(page: Page): Promise<string[]> {
    const selectors = [
      'a[href*="product"]',
      'a[href*="microinverter"]',
      'a[href*="inverter"]',
      '.product-item a',
      '.product-card a',
      '.product-link a',
      '[data-product]',
    ];

    const links: string[] = [];

    for (const selector of selectors) {
      try {
        const elements = await page.$$(selector);
        for (const element of elements) {
          const href = await element.getAttribute('href');
          if (href) {
            const fullUrl = new URL(href, page.url()).toString();
            if (!links.includes(fullUrl) && this.isValidProductUrl(fullUrl)) {
              links.push(fullUrl);
            }
          }
        }
      } catch (error) {
        // Ignore selector errors
      }
    }

    return links;
  }

  /**
   * Find datasheet links on a page
   */
  private async findDatasheetLinks(page: Page): Promise<DatasheetData[]> {
    const selectors = [
      'a[href*="datasheet"]',
      'a[href*=".pdf"]',
      'a[href*="download"]',
      '.datasheet a',
      '.download-pdf a',
      '[data-datasheet]',
    ];

    const datasheets: DatasheetData[] = [];

    for (const selector of selectors) {
      try {
        const elements = await page.$$(selector);
        for (const element of elements) {
          const href = await element.getAttribute('href');
          const text = await element.textContent();
          
          if (href && href.toLowerCase().includes('.pdf')) {
            const fullUrl = new URL(href, page.url()).toString();
            const filename = href.split('/').pop() || 'datasheet.pdf';
            
            datasheets.push({
              url: fullUrl,
              filename,
              title: text?.trim() || filename.replace('.pdf', ''),
            });
          }
        }
      } catch (error) {
        // Ignore selector errors
      }
    }

    return datasheets;
  }

  /**
   * Extract product data from a page
   */
  private async extractProductData(page: Page, url: string): Promise<ProductData | null> {
    try {
      // Extract product name
      const nameSelectors = [
        'h1',
        '.product-title',
        '.product-name',
        '[data-product-name]',
        'title',
      ];

      let name = '';
      for (const selector of nameSelectors) {
        try {
          const element = await page.$(selector);
          if (element) {
            name = await element.textContent() || '';
            if (name.trim()) break;
          }
        } catch (error) {
          // Continue to next selector
        }
      }

      if (!name.trim()) {
        return null;
      }

      // Extract basic specifications
      const specifications = await this.extractSpecifications(page);

      // Find datasheet link
      const datasheetLinks = await this.findDatasheetLinks(page);
      const datasheetUrl = datasheetLinks.length > 0 ? datasheetLinks[0].url : undefined;

      return {
        name: name.trim(),
        url,
        specifications,
        datasheetUrl,
      };
    } catch (error) {
      console.error('Product data extraction failed:', error);
      return null;
    }
  }

  /**
   * Extract specifications from a page
   */
  private async extractSpecifications(page: Page): Promise<Record<string, any>> {
    const specifications: Record<string, any> = {};

    // Look for specification tables
    const specTables = await page.$$('table');
    for (const table of specTables) {
      try {
        const rows = await table.$$('tr');
        for (const row of rows) {
          const cells = await row.$$('td, th');
          if (cells.length >= 2) {
            const label = await cells[0].textContent();
            const value = await cells[1].textContent();
            
            if (label && value) {
              const cleanLabel = label.trim().replace(/:/g, '');
              const cleanValue = value.trim();
              
              // Try to parse numeric values
              const numValue = parseFloat(cleanValue.replace(/[^0-9.]/g, ''));
              if (!isNaN(numValue)) {
                specifications[cleanLabel] = numValue;
              } else {
                specifications[cleanLabel] = cleanValue;
              }
            }
          }
        }
      } catch (error) {
        // Continue with next table
      }
    }

    return specifications;
  }

  /**
   * Check if URL is likely a product page
   */
  private isValidProductUrl(url: string): boolean {
    const productKeywords = [
      'product',
      'microinverter',
      'inverter',
      'series',
      'model',
    ];

    const urlLower = url.toLowerCase();
    return productKeywords.some(keyword => urlLower.includes(keyword));
  }

  /**
   * Delay execution
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Get crawl job status
   */
  async getCrawlStatus(jobId: string): Promise<any> {
    try {
      const job = await db.crawlJob.findUnique({ where: { id: jobId } });
      return job;
    } catch (error) {
      console.error('Failed to get crawl status:', error);
      throw error;
    }
  }

  /**
   * List all crawl jobs
   */
  async listCrawlJobs(status?: JobStatus): Promise<any[]> {
    try {
      const jobs = await db.crawlJob.findMany({
        where: status ? { status } : undefined,
        orderBy: { createdAt: 'desc' },
        take: 50,
      });
      return jobs || [];
    } catch (error) {
      console.error('Failed to list crawl jobs:', error);
      throw error;
    }
  }
}

export const webCrawlerService = new WebCrawlerService();
