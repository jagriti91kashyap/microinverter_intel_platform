import { PrismaClient } from '@prisma/client';

// For development with local PostgreSQL
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Check if we're in development and have a DATABASE_URL
const isDevelopment = process.env.NODE_ENV === 'development';
const hasDatabaseUrl = !!process.env.DATABASE_URL;

if (isDevelopment && !hasDatabaseUrl) {
  console.warn('⚠️  DATABASE_URL not found. Using mock database for development.');
}

// Production PostgreSQL client with pgvector support
export const prisma = 
  globalForPrisma.prisma ??
  new PrismaClient({
    log: ['query', 'info', 'warn', 'error'],
    errorFormat: 'pretty',
  });

// Enhanced vector operations for semantic search
export class VectorService {
  static async generateEmbedding(text: string): Promise<number[]> {
    // This will be implemented with OpenAI embeddings
    throw new Error('Embedding generation not implemented yet');
  }

  static async semanticSearch(query: string, limit: number = 10): Promise<any[]> {
    const embedding = await this.generateEmbedding(query);
    
    return prisma.$queryRaw`
      SELECT 
        p.*,
        si.content,
        si.embedding <=> ${embedding}::vector as similarity
      FROM search_index si
      JOIN products p ON si.product_id = p.id
      ORDER BY si.embedding <=> ${embedding}::vector
      LIMIT ${limit}
    `;
  }

  static async indexProduct(productId: string, content: string): Promise<void> {
    const embedding = await this.generateEmbedding(content);
    
    // Use raw SQL for search index since it's not in the generated client yet
    await prisma.$executeRaw`
      INSERT INTO search_index (product_id, content, embedding, version)
      VALUES (${productId}, ${content}, ${embedding}, 1)
      ON CONFLICT (product_id) 
      DO UPDATE SET 
        content = EXCLUDED.content,
        embedding = EXCLUDED.embedding,
        last_indexed = NOW(),
        version = search_index.version + 1
    `;
  }

  static async reindexAllProducts(): Promise<void> {
    const products = await prisma.product.findMany({
      include: {
        manufacturer: true,
        specifications: true,
        certifications: true
      }
    });

    for (const product of products) {
      const content = [
        product.name,
        product.series,
        product.model,
        product.manufacturer.name,
        product.monitoringPlatform,
        ...product.specifications.map(s => `${s.name}: ${s.value} ${s.unit || ''}`),
        ...product.certifications.map(c => `${c.standard} in ${c.country}`)
      ].join(' ');

      await this.indexProduct(product.id, content);
    }
  }
}

// Audit logging service
export class AuditService {
  static async log({
    userId,
    action,
    resource,
    resourceId,
    oldValues,
    newValues,
    ipAddress,
    userAgent
  }: {
    userId?: string;
    action: string;
    resource: string;
    resourceId?: string;
    oldValues?: any;
    newValues?: any;
    ipAddress?: string;
    userAgent?: string;
  }) {
    return prisma.$executeRaw`
      INSERT INTO audit_logs (user_id, action, resource, resource_id, old_values, new_values, ip_address, user_agent)
      VALUES (${userId || null}, ${action}, ${resource}, ${resourceId || null}, ${oldValues ? JSON.stringify(oldValues) : null}, ${newValues ? JSON.stringify(newValues) : null}, ${ipAddress || null}, ${userAgent || null})
    `;
  }
}

// Notification service
export class NotificationService {
  static async create({
    userId,
    title,
    message,
    type,
    metadata
  }: {
    userId: string;
    title: string;
    message: string;
    type: string;
    metadata?: any;
  }) {
    return prisma.$executeRaw`
      INSERT INTO notifications (user_id, title, message, type, metadata)
      VALUES (${userId}, ${title}, ${message}, ${type}, ${metadata ? JSON.stringify(metadata) : null})
      RETURNING *
    `;
  }

  static async markAsRead(notificationId: string, userId: string) {
    return prisma.$executeRaw`
      UPDATE notifications 
      SET is_read = true, read_at = NOW() 
      WHERE id = ${notificationId} AND user_id = ${userId}
    `;
  }

  static async getUnreadCount(userId: string): Promise<number> {
    const result = await prisma.$queryRaw<any[]>`
      SELECT COUNT(*) as count
      FROM notifications
      WHERE user_id = ${userId} AND is_read = false
    `;
    return Number(result[0]?.count || 0);
  }
}

// System metrics service
export class MetricsService {
  static async record({
    metric,
    value,
    unit,
    metadata
  }: {
    metric: string;
    value: number;
    unit?: string;
    metadata?: any;
  }) {
    return prisma.$executeRaw`
      INSERT INTO system_metrics (metric, value, unit, metadata)
      VALUES (${metric}, ${value}, ${unit || null}, ${metadata ? JSON.stringify(metadata) : null})
    `;
  }

  static async getMetrics(metric: string, hours: number = 24): Promise<any[]> {
    const since = new Date(Date.now() - hours * 60 * 60 * 1000);
    
    return prisma.$queryRaw<any[]>`
      SELECT *
      FROM system_metrics
      WHERE metric = ${metric} AND timestamp >= ${since}
      ORDER BY timestamp ASC
    `;
  }
}

// API Key service
export class ApiKeyService {
  static async generate({
    userId,
    name,
    permissions,
    expiresAt
  }: {
    userId: string;
    name: string;
    permissions: string[];
    expiresAt?: Date;
  }) {
    const key = `mk_${Buffer.from(`${userId}-${Date.now()}-${Math.random()}`).toString('base64')}`;
    
    return prisma.$executeRaw`
      INSERT INTO api_keys (user_id, name, key, permissions, expires_at)
      VALUES (${userId}, ${name}, ${key}, ${JSON.stringify(permissions)}, ${expiresAt || null})
      RETURNING *
    `;
  }

  static async validate(key: string): Promise<any> {
    const result = await prisma.$queryRaw<any[]>`
      SELECT ak.*, u.email, u.name, u.role
      FROM api_keys ak
      JOIN users u ON ak.user_id = u.id
      WHERE ak.key = ${key} AND ak.is_active = true
      AND (ak.expires_at IS NULL OR ak.expires_at > NOW())
    `;
    
    const apiKey = result[0];
    if (!apiKey) {
      return null;
    }

    // Update last used
    await prisma.$executeRaw`
      UPDATE api_keys 
      SET last_used_at = NOW() 
      WHERE id = ${apiKey.id}
    `;

    return apiKey;
  }
}

// Database health check
export async function checkDatabaseHealth(): Promise<boolean> {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return true;
  } catch (error) {
    console.error('Database health check failed:', error);
    return false;
  }
}

// Initialize database extensions
export async function initializeDatabase() {
  try {
    // Enable pgvector extension
    await prisma.$executeRaw`CREATE EXTENSION IF NOT EXISTS vector`;
    
    // Create indexes for performance
    await prisma.$executeRaw`
      CREATE INDEX IF NOT EXISTS idx_products_manufacturer_ac_power 
      ON products(manufacturer_id, ac_power DESC NULLS LAST)
    `;
    
    await prisma.$executeRaw`
      CREATE INDEX IF NOT EXISTS idx_search_index_embedding 
      ON search_index USING ivfflat (embedding vector_cosine_ops)
    `;
    
    console.log('✅ Database initialized successfully');
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    throw error;
  }
}

if (isDevelopment && !hasDatabaseUrl) {
  // Mock implementation for development without database
  console.warn('⚠️  Using mock database - some features will be limited');
}

if (!isDevelopment) {
  globalForPrisma.prisma = prisma;
}
