import { Job, Queue } from 'bullmq';
import { bullmqConnection } from '@/lib/redis';
import { webCrawlerService } from '@/services/crawling/crawler';
import { pdfProcessingService } from '@/services/pdf/processor';
import { aiExtractionService } from '@/services/ai/extraction';
import { embeddingService } from '@/services/ai/embeddings';
import { db } from '@/lib/prisma';
import { JobStatus } from '@prisma/client';

export interface CrawlJobData {
  manufacturerId?: string;
  url: string;
  crawlType: 'MANUFACTURER' | 'PRODUCT' | 'DATASHEET';
  priority?: number;
  metadata?: Record<string, any>;
}

export interface ProcessDatasheetJobData {
  datasheetUrl: string;
  productId?: string;
  manufacturerId?: string;
}

export interface ExtractSpecificationsJobData {
  productId: string;
  content: string;
  sourceUrl?: string;
  pageNumber?: number;
}

export interface GenerateEmbeddingsJobData {
  productIds: string[];
  type: 'product' | 'batch';
}

// Create queues
export const crawlQueue = new Queue<CrawlJobData>('crawl-queue', {
  connection: bullmqConnection,
  defaultJobOptions: {
    removeOnComplete: 100,
    removeOnFail: 50,
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 2000,
    },
  },
});

export const datasheetQueue = new Queue<ProcessDatasheetJobData>('datasheet-queue', {
  connection: bullmqConnection,
  defaultJobOptions: {
    removeOnComplete: 100,
    removeOnFail: 50,
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 2000,
    },
  },
});

export const extractionQueue = new Queue<ExtractSpecificationsJobData>('extraction-queue', {
  connection: bullmqConnection,
  defaultJobOptions: {
    removeOnComplete: 100,
    removeOnFail: 50,
    attempts: 2,
    backoff: {
      type: 'exponential',
      delay: 1000,
    },
  },
});

export const embeddingQueue = new Queue<GenerateEmbeddingsJobData>('embedding-queue', {
  connection: bullmqConnection,
  defaultJobOptions: {
    removeOnComplete: 100,
    removeOnFail: 50,
    attempts: 2,
    backoff: {
      type: 'exponential',
      delay: 1000,
    },
  },
});

/**
 * Process crawl jobs
 */
export async function processCrawlJob(job: Job<CrawlJobData>): Promise<void> {
  const { manufacturerId, url, crawlType, priority, metadata } = job.data;
  
  try {
    console.log(`Processing crawl job: ${job.id} for ${url}`);
    
    // Update job status in database
    const crawlJob = await db.crawlJob.findUnique({
      where: { id: job.id! },
    });

    if (!crawlJob) {
      throw new Error(`Crawl job not found: ${job.id}`);
    }

    // Execute the crawl
    const result = await webCrawlerService.executeCrawl(job.id!);
    
    // Process results
    if (result.productsFound.length > 0) {
      await processCrawlResults(result, manufacturerId);
    }

    // Queue datasheet processing jobs
    if (result.datasheetsFound.length > 0) {
      for (const datasheet of result.datasheetsFound) {
        await datasheetQueue.add('process-datasheet', {
          datasheetUrl: datasheet.url,
          manufacturerId,
        }, {
          priority: priority || 5,
          delay: 1000, // Stagger datasheet processing
        });
      }
    }

    console.log(`Crawl job ${job.id} completed successfully`);
  } catch (error) {
    console.error(`Crawl job ${job.id} failed:`, error);
    
    // Update job status to failed
    await db.crawlJob.update({
      where: { id: job.id! },
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
 * Process datasheet jobs
 */
export async function processDatasheetJob(job: Job<ProcessDatasheetJobData>): Promise<void> {
  const { datasheetUrl, productId, manufacturerId } = job.data;
  
  try {
    console.log(`Processing datasheet job: ${job.id} for ${datasheetUrl}`);
    
    // Check if datasheet already exists
    const existingDatasheet = await pdfProcessingService.pdfExists(datasheetUrl);
    if (existingDatasheet) {
      console.log(`Datasheet already exists: ${datasheetUrl}`);
      return;
    }

    // Process the PDF
    const result = await pdfProcessingService.processPDF({
      url: datasheetUrl,
      productId,
      manufacturerId,
    });

    if (result.success && result.specifications && productId) {
      // Store specifications in database
      await storeSpecifications(result.specifications, productId, datasheetUrl);
      
      // Queue embedding generation for the product
      await embeddingQueue.add('generate-embeddings', {
        productIds: [productId],
        type: 'product',
      });
    }

    console.log(`Datasheet job ${job.id} completed`);
  } catch (error) {
    console.error(`Datasheet job ${job.id} failed:`, error);
    throw error;
  }
}

/**
 * Process specification extraction jobs
 */
export async function processExtractionJob(job: Job<ExtractSpecificationsJobData>): Promise<void> {
  const { productId, content, sourceUrl, pageNumber } = job.data;
  
  try {
    console.log(`Processing extraction job: ${job.id} for product ${productId}`);
    
    // Extract specifications using AI
    const result = await aiExtractionService.extractSpecifications({
      content,
      sourceUrl,
      pageNumber,
    });

    // Store specifications
    await storeSpecifications(result.specifications, productId, sourceUrl);
    
    // Update product with AI summary if needed
    if (result.specifications.length > 0) {
      await updateProductWithAIData(productId, result);
    }

    console.log(`Extraction job ${job.id} completed`);
  } catch (error) {
    console.error(`Extraction job ${job.id} failed:`, error);
    throw error;
  }
}

/**
 * Process embedding generation jobs
 */
export async function processEmbeddingJob(job: Job<GenerateEmbeddingsJobData>): Promise<void> {
  const { productIds, type } = job.data;
  
  try {
    console.log(`Processing embedding job: ${job.id} for ${type}`);
    
    if (type === 'batch') {
      await embeddingService.batchGenerateEmbeddings(productIds);
    } else {
      for (const productId of productIds) {
        await embeddingService.generateProductEmbedding(productId);
      }
    }

    console.log(`Embedding job ${job.id} completed`);
  } catch (error) {
    console.error(`Embedding job ${job.id} failed:`, error);
    throw error;
  }
}

/**
 * Process crawl results and create/update products
 */
async function processCrawlResults(
  results: any,
  manufacturerId?: string
): Promise<void> {
  for (const productData of results.productsFound) {
    try {
      // Check if product already exists
      const existingProduct = await db.product.findFirst({
        where: {
          name: productData.name,
          manufacturerId: manufacturerId!,
        },
      });

      if (existingProduct) {
        // Update existing product
        await db.product.update({
          where: { id: existingProduct.id },
          data: {
            updatedAt: new Date(),
            productUrl: productData.url,
            imageUrl: productData.imageUrl,
          },
        });
      } else {
        // Create new product
        const newProduct = await db.product.create({
          data: {
            name: productData.name,
            series: productData.series,
            model: productData.model,
            manufacturerId: manufacturerId!,
            productUrl: productData.url,
            imageUrl: productData.imageUrl,
            status: 'ACTIVE',
          },
        });

        // Queue specification extraction if we have content
        if (productData.specifications) {
          const content = Object.entries(productData.specifications)
            .map(([key, value]) => `${key}: ${value}`)
            .join('\n');
          
          await extractionQueue.add('extract-specifications', {
            productId: newProduct!.id,
            content,
            sourceUrl: productData.url,
          });
        }
      }
    } catch (error) {
      console.error(`Failed to process product ${productData.name}:`, error);
    }
  }
}

/**
 * Store specifications in database
 */
async function storeSpecifications(
  specifications: any[],
  productId: string,
  sourceUrl?: string
): Promise<void> {
  for (const spec of specifications) {
    try {
      await db.productSpecification.create({
        data: {
          productId,
          category: spec.category,
          name: spec.name,
          value: spec.value,
          unit: spec.unit,
          confidence: spec.confidence || 1.0,
          sourceId: sourceUrl,
        },
      });
    } catch (error) {
      console.error(`Failed to store specification ${spec.name}:`, error);
    }
  }
}

/**
 * Update product with AI-generated data
 */
async function updateProductWithAIData(
  productId: string,
  extractionResult: any
): Promise<void> {
  try {
    // Generate AI summary
    const product = await db.product.findUnique({
      where: { id: productId },
      include: {
        manufacturer: true,
        specifications: true,
      },
    });

    if (product) {
      const summary = await aiExtractionService.generateProductSummary({
        name: product.name,
        manufacturer: product.manufacturer.name,
        specifications: extractionResult.specifications,
      });

      await db.product.update({
        where: { id: productId },
        data: {
          updatedAt: new Date(),
        },
      });
    }
  } catch (error) {
    console.error(`Failed to update product with AI data:`, error);
  }
}

/**
 * Add a new crawl job to the queue
 */
export async function addCrawlJob(data: CrawlJobData): Promise<Job<CrawlJobData>> {
  return await crawlQueue.add('crawl', data, {
    priority: data.priority || 5,
    attempts: 3,
  });
}

/**
 * Add a datasheet processing job to the queue
 */
export async function addDatasheetJob(data: ProcessDatasheetJobData): Promise<Job<ProcessDatasheetJobData>> {
  return await datasheetQueue.add('process-datasheet', data, {
    priority: 5,
    delay: 1000, // Delay to avoid overwhelming servers
  });
}

/**
 * Add a specification extraction job to the queue
 */
export async function addExtractionJob(data: ExtractSpecificationsJobData): Promise<Job<ExtractSpecificationsJobData>> {
  return await extractionQueue.add('extract-specifications', data, {
    priority: 5,
  });
}

/**
 * Add an embedding generation job to the queue
 */
export async function addEmbeddingJob(data: GenerateEmbeddingsJobData): Promise<Job<GenerateEmbeddingsJobData>> {
  return await embeddingQueue.add('generate-embeddings', data, {
    priority: 3, // Lower priority for embeddings
  });
}

/**
 * Get queue statistics
 */
export async function getQueueStats(): Promise<{
  crawl: { waiting: number; active: number; completed: number; failed: number };
  datasheet: { waiting: number; active: number; completed: number; failed: number };
  extraction: { waiting: number; active: number; completed: number; failed: number };
  embedding: { waiting: number; active: number; completed: number; failed: number };
}> {
  const [crawl, datasheet, extraction, embedding] = await Promise.all([
    crawlQueue.getJobCounts(),
    datasheetQueue.getJobCounts(),
    extractionQueue.getJobCounts(),
    embeddingQueue.getJobCounts(),
  ]);

  return {
    crawl: {
      waiting: crawl.waiting || 0,
      active: crawl.active || 0,
      completed: crawl.completed || 0,
      failed: crawl.failed || 0,
    },
    datasheet: {
      waiting: datasheet.waiting || 0,
      active: datasheet.active || 0,
      completed: datasheet.completed || 0,
      failed: datasheet.failed || 0,
    },
    extraction: {
      waiting: extraction.waiting || 0,
      active: extraction.active || 0,
      completed: extraction.completed || 0,
      failed: extraction.failed || 0,
    },
    embedding: {
      waiting: embedding.waiting || 0,
      active: embedding.active || 0,
      completed: embedding.completed || 0,
      failed: embedding.failed || 0,
    },
  };
}

/**
 * Clean up completed jobs
 */
export async function cleanupJobs(olderThanHours: number = 24): Promise<void> {
  const timestamp = Date.now() - (olderThanHours * 60 * 60 * 1000);
  
  await Promise.all([
    crawlQueue.clean(olderThanHours * 1000, 0, 'completed'),
    datasheetQueue.clean(olderThanHours * 1000, 0, 'completed'),
    extractionQueue.clean(olderThanHours * 1000, 0, 'completed'),
    embeddingQueue.clean(olderThanHours * 1000, 0, 'completed'),
  ]);
  
  console.log(`Cleaned up jobs older than ${olderThanHours} hours`);
}
