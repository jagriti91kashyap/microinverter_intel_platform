import OpenAI from 'openai';
import { db } from '@/lib/prisma';

let _openai: OpenAI | null = null;
function getOpenAIClient(): OpenAI {
  if (!_openai) {
    if (!process.env.OPENAI_API_KEY) throw new Error('OPENAI_API_KEY environment variable is not set');
    _openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }
  return _openai;
}

export interface EmbeddingRequest {
  text: string;
  type: 'product' | 'specification' | 'manufacturer';
  metadata?: Record<string, any>;
}

export interface SemanticSearchRequest {
  query: string;
  limit?: number;
  threshold?: number;
  filters?: {
    manufacturerId?: string;
    powerRange?: { min: number; max: number };
    status?: string;
  };
}

export interface SemanticSearchResult {
  id: string;
  type: string;
  score: number;
  data: any;
}

export class EmbeddingService {
  /**
   * Generate embedding for a given text
   */
  async generateEmbedding(text: string): Promise<number[]> {
    try {
      const response = await getOpenAIClient().embeddings.create({
        model: 'text-embedding-3-large', // 3072 dimensions
        input: text.replace(/\s+/g, ' ').trim(),
      });

      return response.data[0]?.embedding || [];
    } catch (error) {
      console.error('Embedding generation error:', error);
      throw new Error(`Failed to generate embedding: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Generate and store embedding for a product
   */
  async generateProductEmbedding(productId: string): Promise<void> {
    try {
      // Get product with all related data
      const product = await db.product.findUnique({
        where: { id: productId },
        include: {
          manufacturer: true,
          specifications: true,
        },
      });

      if (!product) {
        throw new Error(`Product not found: ${productId}`);
      }

      // Create rich text for embedding
      const embeddingText = this.createProductEmbeddingText(product);
      
      // Generate embedding
      const embedding = await this.generateEmbedding(embeddingText);
      
      // Store embedding (using pgvector) - use raw SQL since embedding field may not be recognized
      await db.$queryRaw`
        UPDATE products 
        SET embedding = ${embedding}::bytea
        WHERE id = ${productId}
      `;

    } catch (error) {
      console.error('Product embedding error:', error);
      throw error;
    }
  }

  /**
   * Perform semantic search on products
   */
  async semanticSearch(request: SemanticSearchRequest): Promise<SemanticSearchResult[]> {
    try {
      // Generate embedding for search query
      const queryEmbedding = await this.generateEmbedding(request.query);

      // Build SQL query for vector similarity search
      const sql = this.buildSemanticSearchSQL(request);
      
      // Execute search (this would need pgvector extension)
      const results = await this.executeVectorSearch(sql, queryEmbedding, request);
      
      return results;
    } catch (error) {
      console.error('Semantic search error:', error);
      throw error;
    }
  }

  /**
   * Batch generate embeddings for multiple products
   */
  async batchGenerateEmbeddings(productIds: string[]): Promise<void> {
    const batchSize = 10; // Process in batches to avoid rate limits
    
    for (let i = 0; i < productIds.length; i += batchSize) {
      const batch = productIds.slice(i, i + batchSize);
      
      await Promise.allSettled(
        batch.map(productId => this.generateProductEmbedding(productId))
      );
      
      // Add delay between batches to respect rate limits
      if (i + batchSize < productIds.length) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
  }

  /**
   * Update embeddings when product data changes
   */
  async updateProductEmbedding(productId: string): Promise<void> {
    await this.generateProductEmbedding(productId);
  }

  /**
   * Delete embedding for a product
   */
  async deleteProductEmbedding(productId: string): Promise<void> {
    try {
      await db.$queryRaw`
        UPDATE products 
        SET embedding = null
        WHERE id = ${productId}
      `;
    } catch (error) {
      console.error('Delete embedding error:', error);
      throw error;
    }
  }

  private createProductEmbeddingText(product: any): string {
    const parts: string[] = [];

    // Basic product info
    parts.push(`Product: ${product.name}`);
    parts.push(`Series: ${product.series || ''}`);
    parts.push(`Model: ${product.model || ''}`);
    parts.push(`Manufacturer: ${product.manufacturer?.name || ''}`);
    parts.push(`Status: ${product.status}`);

    // Specifications
    if (product.specifications && product.specifications.length > 0) {
      parts.push('Specifications:');
      product.specifications.forEach((spec: any) => {
        parts.push(`${spec.name}: ${spec.value} ${spec.unit || ''}`);
      });
    }

    // Key metrics
    if (product.acPower) parts.push(`AC Power: ${product.acPower}W`);
    if (product.maxModuleSize) parts.push(`DC Power: ${product.maxModuleSize}W`);
    if (product.efficiency) parts.push(`Efficiency: ${product.efficiency}%`);
    if (product.warranty) parts.push(`Warranty: ${product.warranty} years`);
    if (product.mppt) parts.push(`No. of MPPTs: ${product.mppt}`);

    // AI summary if available
    if (product.aiSummary) {
      parts.push(`Summary: ${product.aiSummary}`);
    }

    return parts.join(' ');
  }

  private buildSemanticSearchSQL(request: SemanticSearchRequest): string {
    let sql = `
      SELECT 
        p.id,
        p.name,
        p.series,
        p.model,
        p.ac_power,
        p.dc_power,
        p.efficiency,
        p.warranty,
        p.status,
        m.name as manufacturer_name,
        p.embedding <=> $1 as similarity_score
      FROM products p
      JOIN manufacturers m ON p.manufacturer_id = m.id
      WHERE p.embedding IS NOT NULL
    `;

    const params: string[] = [];
    let paramIndex = 2; // $1 is for the embedding vector

    // Add filters
    if (request.filters?.manufacturerId) {
      sql += ` AND p.manufacturer_id = $${paramIndex}`;
      params.push(request.filters.manufacturerId);
      paramIndex++;
    }

    if (request.filters?.powerRange) {
      sql += ` AND p.ac_power >= $${paramIndex} AND p.ac_power <= $${paramIndex + 1}`;
      params.push(request.filters.powerRange.min.toString(), request.filters.powerRange.max.toString());
      paramIndex += 2;
    }

    if (request.filters?.status) {
      sql += ` AND p.status = $${paramIndex}`;
      params.push(request.filters.status);
      paramIndex++;
    }

    // Add similarity threshold and ordering
    const threshold = request.threshold || 0.7;
    sql += ` AND (p.embedding <=> $1) < ${1 - threshold}`;
    sql += ` ORDER BY similarity_score ASC`;

    // Add limit
    const limit = request.limit || 20;
    sql += ` LIMIT ${limit}`;

    return sql;
  }

  private async executeVectorSearch(
    sql: string, 
    embedding: number[], 
    request: SemanticSearchRequest
  ): Promise<SemanticSearchResult[]> {
    try {
      // This would execute the SQL query with pgvector
      // For now, we'll return a mock implementation
      // In production, this would use the actual database connection
      
      // Mock implementation - in reality this would be:
      // const results = await prisma.$queryRawUnsafe(sql, embedding, ...params);
      
      // For now, return empty results
      console.log('Vector search SQL:', sql);
      console.log('Embedding dimensions:', embedding.length);
      
      return [];
    } catch (error) {
      console.error('Vector search execution error:', error);
      throw error;
    }
  }

  /**
   * Find similar products based on embedding similarity
   */
  async findSimilarProducts(productId: string, limit: number = 5): Promise<SemanticSearchResult[]> {
    try {
      const products = await db.$queryRaw<any[]>`
        SELECT id, embedding 
        FROM products 
        WHERE id = ${productId}
        LIMIT 1
      `;
      
      const product = products[0];

      if (!product?.embedding) {
        throw new Error('Product embedding not found');
      }

      const sql = `
        SELECT 
          p.id,
          p.name,
          p.series,
          p.model,
          p.ac_power,
          p.efficiency,
          m.name as manufacturer_name,
          p.embedding <=> $1 as similarity_score
        FROM products p
        JOIN manufacturers m ON p.manufacturer_id = m.id
        WHERE p.id != $2 AND p.embedding IS NOT NULL
        ORDER BY similarity_score ASC
        LIMIT ${limit}
      `;

      // Execute query (mock for now)
      console.log('Similar products search for:', productId);
      return [];
    } catch (error) {
      console.error('Find similar products error:', error);
      throw error;
    }
  }

  /**
   * Generate embeddings for all products that don't have them
   */
  async generateMissingEmbeddings(): Promise<void> {
    try {
      const products = await db.$queryRaw<any[]>`
        SELECT id 
        FROM products 
        WHERE embedding IS NULL
      `;

      const productsWithoutEmbeddings = products;

      if (!productsWithoutEmbeddings || productsWithoutEmbeddings.length === 0) {
        console.log('All products have embeddings');
        return;
      }

      console.log(`Generating embeddings for ${productsWithoutEmbeddings.length} products`);
      
      const productIds = productsWithoutEmbeddings.map(p => p.id);
      await this.batchGenerateEmbeddings(productIds);
      
      console.log('Embedding generation completed');
    } catch (error) {
      console.error('Generate missing embeddings error:', error);
      throw error;
    }
  }
}

export const embeddingService = new EmbeddingService();
