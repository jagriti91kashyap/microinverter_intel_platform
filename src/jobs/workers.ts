import { Worker } from 'bullmq';
import { bullmqConnection } from '@/lib/redis';
import { 
  processCrawlJob, 
  processDatasheetJob, 
  processExtractionJob, 
  processEmbeddingJob 
} from './crawl-job';

// Create workers for each queue
export const crawlWorker = new Worker(
  'crawl-queue',
  async (job) => {
    await processCrawlJob(job);
  },
  {
    connection: bullmqConnection,
    concurrency: 2, // Limit concurrent crawls to avoid overwhelming servers
    limiter: {
      max: 5,
      duration: 60000, // 5 crawls per minute
    },
  }
);

export const datasheetWorker = new Worker(
  'datasheet-queue',
  async (job) => {
    await processDatasheetJob(job);
  },
  {
    connection: bullmqConnection,
    concurrency: 3, // Process multiple datasheets in parallel
  }
);

export const extractionWorker = new Worker(
  'extraction-queue',
  async (job) => {
    await processExtractionJob(job);
  },
  {
    connection: bullmqConnection,
    concurrency: 5, // AI extraction can run in parallel
  }
);

export const embeddingWorker = new Worker(
  'embedding-queue',
  async (job) => {
    await processEmbeddingJob(job);
  },
  {
    connection: bullmqConnection,
    concurrency: 2, // Limit embedding generation to manage API costs
  }
);

// Error handling for workers
crawlWorker.on('error', (error) => {
  // Crawl worker error
});

datasheetWorker.on('error', (error) => {
  // Datasheet worker error
});

extractionWorker.on('error', (error) => {
  // Extraction worker error
});

embeddingWorker.on('error', (error) => {
  // Embedding worker error
});

// Job completion handlers
crawlWorker.on('completed', (job) => {
  // Crawl job completed
});

datasheetWorker.on('completed', (job) => {
  // Datasheet job completed
});

extractionWorker.on('completed', (job) => {
  // Extraction job completed
});

embeddingWorker.on('completed', (job) => {
  // Embedding job completed
});

// Job failure handlers
crawlWorker.on('failed', (job, error) => {
  // Crawl job failed
});

datasheetWorker.on('failed', (job, error) => {
  // Datasheet job failed
});

extractionWorker.on('failed', (job, error) => {
  // Extraction job failed
});

embeddingWorker.on('failed', (job, error) => {
  // Embedding job failed
});

// Graceful shutdown
process.on('SIGINT', async () => {
  await Promise.all([
    crawlWorker.close(),
    datasheetWorker.close(),
    extractionWorker.close(),
    embeddingWorker.close(),
  ]);
  
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await Promise.all([
    crawlWorker.close(),
    datasheetWorker.close(),
    extractionWorker.close(),
    embeddingWorker.close(),
  ]);
  
  process.exit(0);
});

export default {
  crawlWorker,
  datasheetWorker,
  extractionWorker,
  embeddingWorker,
};
