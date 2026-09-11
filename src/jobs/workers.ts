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
    console.log(`Processing crawl job ${job.id}`);
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
    console.log(`Processing datasheet job ${job.id}`);
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
    console.log(`Processing extraction job ${job.id}`);
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
    console.log(`Processing embedding job ${job.id}`);
    await processEmbeddingJob(job);
  },
  {
    connection: bullmqConnection,
    concurrency: 2, // Limit embedding generation to manage API costs
  }
);

// Error handling for workers
crawlWorker.on('error', (error) => {
  console.error('Crawl worker error:', error);
});

datasheetWorker.on('error', (error) => {
  console.error('Datasheet worker error:', error);
});

extractionWorker.on('error', (error) => {
  console.error('Extraction worker error:', error);
});

embeddingWorker.on('error', (error) => {
  console.error('Embedding worker error:', error);
});

// Job completion handlers
crawlWorker.on('completed', (job) => {
  console.log(`Crawl job ${job.id} completed`);
});

datasheetWorker.on('completed', (job) => {
  console.log(`Datasheet job ${job.id} completed`);
});

extractionWorker.on('completed', (job) => {
  console.log(`Extraction job ${job.id} completed`);
});

embeddingWorker.on('completed', (job) => {
  console.log(`Embedding job ${job.id} completed`);
});

// Job failure handlers
crawlWorker.on('failed', (job, error) => {
  console.error(`Crawl job ${job?.id} failed:`, error);
});

datasheetWorker.on('failed', (job, error) => {
  console.error(`Datasheet job ${job?.id} failed:`, error);
});

extractionWorker.on('failed', (job, error) => {
  console.error(`Extraction job ${job?.id} failed:`, error);
});

embeddingWorker.on('failed', (job, error) => {
  console.error(`Embedding job ${job?.id} failed:`, error);
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('Shutting down workers...');
  
  await Promise.all([
    crawlWorker.close(),
    datasheetWorker.close(),
    extractionWorker.close(),
    embeddingWorker.close(),
  ]);
  
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('Shutting down workers...');
  
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
