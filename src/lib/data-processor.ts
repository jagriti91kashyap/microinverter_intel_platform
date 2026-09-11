import { prisma } from '@/lib/prisma-client'
import WebScraperService from './web-scraper'
import AIExtractorService from './ai-extractor'

// Data processing pipeline service
export class DataProcessorService {
  private static instance: DataProcessorService
  private webScraper: WebScraperService
  private aiExtractor: AIExtractorService

  static getInstance(): DataProcessorService {
    if (!DataProcessorService.instance) {
      DataProcessorService.instance = new DataProcessorService()
    }
    return DataProcessorService.instance
  }

  constructor() {
    this.webScraper = WebScraperService.getInstance()
    this.aiExtractor = AIExtractorService.getInstance()
  }

  // Process manufacturer data ingestion
  async processManufacturerIngestion(manufacturerId: string, userId: string): Promise<{
    success: boolean
    processed: number
    updated: number
    created: number
    errors: string[]
  }> {
    const results = {
      success: true,
      processed: 0,
      updated: 0,
      created: 0,
      errors: [] as string[]
    }

    try {
      // Create crawl job
      const crawlJob = await this.createCrawlJob(manufacturerId, userId)
      
      try {
        // Update job status to running
        await this.updateCrawlJobStatus(crawlJob.id, 'RUNNING')
        
        // Scrape products from manufacturer website
        const scrapedProducts = await this.webScraper.scrapeManufacturerProducts(manufacturerId)
        
        if (scrapedProducts.length === 0) {
          results.errors.push('No products found during scraping')
          await this.updateCrawlJobStatus(crawlJob.id, 'COMPLETED', 0, 0, 0, results.errors)
          return results
        }

        // Process each scraped product
        for (const scrapedProduct of scrapedProducts) {
          try {
            const processResult = await this.processScrapedProduct(scrapedProduct, manufacturerId, userId)
            
            results.processed++
            if (processResult.created) {
              results.created++
            } else if (processResult.updated) {
              results.updated++
            }
          } catch (error) {
            const errorMessage = `Error processing product ${scrapedProduct.name}: ${error}`
            results.errors.push(errorMessage)
            console.error(errorMessage)
          }
        }

        // Update job status to completed
        await this.updateCrawlJobStatus(
          crawlJob.id, 
          'COMPLETED', 
          results.processed, 
          results.created, 
          results.updated, 
          results.errors.length > 0 ? results.errors : undefined
        )

      } catch (error) {
        results.success = false
        results.errors.push(`Scraping failed: ${error}`)
        await this.updateCrawlJobStatus(crawlJob.id, 'FAILED', 0, 0, 0, [error instanceof Error ? error.message : String(error)])
      }

    } catch (error) {
      results.success = false
      results.errors.push(`Failed to create crawl job: ${error}`)
      console.error('Error in manufacturer ingestion:', error)
    }

    return results
  }

  // Process individual scraped product
  async processScrapedProduct(scrapedProduct: any, manufacturerId: string, userId: string): Promise<{
    created: boolean
    updated: boolean
    product?: any
  }> {
    try {
      // Validate scraped data
      const validation = this.webScraper.validateScrapedData(scrapedProduct)
      if (!validation.isValid) {
        throw new Error(`Validation failed: ${validation.errors.join(', ')}`)
      }

      // Clean scraped data
      const cleanedData = this.webScraper.cleanScrapedData(scrapedProduct)

      // Extract structured data using AI
      const extractedData = await this.aiExtractor.extractProductData(cleanedData, manufacturerId)

      // Check for existing product
      const comparison = await this.aiExtractor.compareWithExisting(extractedData, manufacturerId)

      if (comparison.isDuplicate && comparison.existingProduct) {
        // Update existing product
        const updatedProduct = await this.updateExistingProduct(
          comparison.existingProduct.id,
          extractedData,
          comparison.changes || [],
          userId
        )
        
        return { created: false, updated: true, product: updatedProduct }
      } else {
        // Create new product
        const newProduct = await this.createNewProduct(extractedData, userId)
        
        return { created: true, updated: false, product: newProduct }
      }
    } catch (error) {
      console.error('Error processing scraped product:', error)
      throw error
    }
  }

  // Create new product from extracted data
  private async createNewProduct(extractedData: any, userId: string): Promise<any> {
    try {
      const product = await prisma.product.create({
        data: {
          name: extractedData.name,
          series: extractedData.series,
          model: extractedData.model,
          manufacturerId: extractedData.manufacturerId,
          acPower: extractedData.performance.acPower,
          maxModuleSize: extractedData.performance.maxModuleSize,
          voltage: extractedData.performance.voltage,
          mppt: extractedData.performance.mppt,
          efficiency: extractedData.performance.efficiency,
          warranty: extractedData.performance.warranty,
          weight: extractedData.performance.weight,
          dimensions: extractedData.specifications.find((spec: any) => spec.name.includes('Dimensions'))?.value || '',
          monitoringPlatform: extractedData.monitoringPlatform,
          status: extractedData.status,
          imageUrl: extractedData.imageUrl,
          datasheetUrl: extractedData.datasheetUrl,
          productUrl: extractedData.productUrl,
          aiSummary: extractedData.aiSummary,
          confidenceScore: extractedData.confidenceScore,
          lastCrawledAt: new Date(),
          extractedAt: extractedData.extractedAt
        }
      })

      // Create specifications
      if (extractedData.specifications && extractedData.specifications.length > 0) {
        await this.createSpecifications(product.id, extractedData.specifications)
      }

      // Create certifications
      if (extractedData.certifications && extractedData.certifications.length > 0) {
        await this.createCertifications(product.id, extractedData.certifications)
      }

      // Create availability data
      if (extractedData.availability && extractedData.availability.length > 0) {
        await this.createAvailability(product.id, extractedData.availability)
      }

      // Create data source
      await this.createDataSource(product.id, extractedData.sourceData.sourceUrl, 'WEBSITE_SCRAPING')

      // Log creation
      await this.createAuditLog(product.id, 'CREATE', userId, extractedData)

      return product
    } catch (error) {
      console.error('Error creating new product:', error)
      throw error
    }
  }

  // Update existing product
  private async updateExistingProduct(
    productId: string, 
    extractedData: any, 
    changes: any[], 
    userId: string
  ): Promise<any> {
    try {
      const updateData: any = {
        lastCrawledAt: new Date(),
        updatedAt: new Date()
      }

      // Update fields that have changed
      if (changes.some(change => change.field === 'description')) {
        updateData.description = extractedData.description
      }

      if (changes.some(change => change.field === 'specification')) {
        // Update performance metrics if specifications changed
        updateData.acPower = extractedData.performance.acPower
        updateData.maxModuleSize = extractedData.performance.maxModuleSize
        updateData.voltage = extractedData.performance.voltage
        updateData.mppt = extractedData.performance.mppt
        updateData.efficiency = extractedData.performance.efficiency
        updateData.warranty = extractedData.performance.warranty
        updateData.weight = extractedData.performance.weight
        updateData.aiSummary = extractedData.aiSummary
        updateData.confidenceScore = extractedData.confidenceScore
      }

      const product = await prisma.product.update({
        where: { id: productId },
        data: updateData
      })

      // Update specifications if changed
      const specChanges = changes.filter(change => change.field === 'specification')
      if (specChanges.length > 0) {
        await this.updateSpecifications(productId, extractedData.specifications)
      }

      // Log changes
      await this.createAuditLog(productId, 'UPDATE', userId, { changes, extractedData })

      return product
    } catch (error) {
      console.error('Error updating existing product:', error)
      throw error
    }
  }

  // Create crawl job
  private async createCrawlJob(manufacturerId: string, userId: string): Promise<any> {
    return await prisma.crawlJob.create({
      data: {
        manufacturerId,
        userId,
        url: `https://manufacturer-${manufacturerId}.com`,
        crawlType: 'MANUFACTURER',
        status: 'PENDING',
        startedAt: new Date(),
        config: {
          scrapeProducts: true,
          extractSpecs: true,
          updateExisting: true
        }
      }
    })
  }

  // Update crawl job status
  private async updateCrawlJobStatus(
    jobId: string,
    status: string,
    itemsProcessed?: number,
    itemsCreated?: number,
    itemsUpdated?: number,
    errors?: string[]
  ): Promise<any> {
    const updateData: any = {
      status,
      updatedAt: new Date()
    }

    if (status === 'COMPLETED' || status === 'FAILED') {
      updateData.completedAt = new Date()
    }

    if (itemsProcessed !== undefined) {
      updateData.itemsProcessed = itemsProcessed
    }

    if (itemsCreated !== undefined) {
      updateData.itemsCreated = itemsCreated
    }

    if (itemsUpdated !== undefined) {
      updateData.itemsUpdated = itemsUpdated
    }

    if (errors) {
      updateData.errors = errors
    }

    return await prisma.crawlJob.update({
      where: { id: jobId },
      data: updateData
    })
  }

  // Create specifications for product
  private async createSpecifications(productId: string, specifications: any[]): Promise<void> {
    const specData = specifications.map(spec => ({
      productId,
      category: spec.category,
      name: spec.name,
      value: spec.value,
      unit: spec.unit,
      description: spec.description,
      confidence: spec.confidence,
      isVerified: spec.isVerified,
      extractedAt: new Date()
    }))

    await prisma.productSpecification.createMany({
      data: specData
    })
  }

  // Update specifications for product
  private async updateSpecifications(productId: string, specifications: any[]): Promise<void> {
    // Delete existing specifications
    await prisma.productSpecification.deleteMany({
      where: { productId }
    })

    // Create new specifications
    await this.createSpecifications(productId, specifications)
  }

  // Create certifications for product
  private async createCertifications(productId: string, certifications: any[]): Promise<void> {
    const certData = certifications.map(cert => ({
      productId,
      country: cert.country,
      standard: cert.standard,
      certified: cert.certified,
      dateObtained: cert.dateObtained ? new Date(cert.dateObtained) : null,
      documentUrl: cert.documentUrl || null
    }))

    await prisma.productCertification.createMany({
      data: certData
    })
  }

  // Create availability data for product
  private async createAvailability(productId: string, availability: any[]): Promise<void> {
    const availabilityData = availability.map(avail => ({
      productId,
      country: avail.country,
      region: avail.region,
      isAvailable: avail.isAvailable,
      price: avail.price,
      currency: avail.currency,
      supplier: avail.supplier,
      lastChecked: new Date()
    }))

    await prisma.productAvailability.createMany({
      data: availabilityData
    })
  }

  // Create data source for product
  private async createDataSource(productId: string, url: string, type: string): Promise<any> {
    return await prisma.dataSource.create({
      data: {
        productId,
        url,
        type: type as any,
        title: `Scraped from ${url}`,
        isActive: true,
        lastCrawled: new Date()
      }
    })
  }

  // Create audit log
  private async createAuditLog(productId: string, action: string, userId: string, data: any): Promise<any> {
    return await prisma.auditLog.create({
      data: {
        userId,
        action: action as any,
        resource: 'Product',
        resourceId: productId,
        oldValues: action === 'UPDATE' ? JSON.stringify(data.changes) : undefined,
        newValues: JSON.stringify(data.extractedData)
      }
    })
  }

  // Get processing statistics
  async getProcessingStats(manufacturerId?: string): Promise<{
    totalJobs: number
    completedJobs: number
    failedJobs: number
    runningJobs: number
    totalProducts: number
    recentlyUpdated: number
  }> {
    const whereClause = manufacturerId ? { manufacturerId } : {}

    const [totalJobs, completedJobs, failedJobs, runningJobs, totalProducts, recentlyUpdated] = await Promise.all([
      prisma.crawlJob.count({ where: whereClause }),
      prisma.crawlJob.count({ where: { ...whereClause, status: 'COMPLETED' } }),
      prisma.crawlJob.count({ where: { ...whereClause, status: 'FAILED' } }),
      prisma.crawlJob.count({ where: { ...whereClause, status: 'RUNNING' } }),
      prisma.product.count({ where: manufacturerId ? { manufacturerId } : {} }),
      prisma.product.count({
        where: {
          ...whereClause,
          updatedAt: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // Last 7 days
          }
        }
      })
    ])

    return {
      totalJobs,
      completedJobs,
      failedJobs,
      runningJobs,
      totalProducts,
      recentlyUpdated
    }
  }

  // Validate data quality
  async validateDataQuality(productId: string): Promise<{
    score: number
    issues: string[]
    recommendations: string[]
  }> {
    try {
      const product = await prisma.product.findUnique({
        where: { id: productId },
        include: {
          specifications: true,
          certifications: true,
          availability: true
        }
      })

      if (!product) {
        throw new Error('Product not found')
      }

      const issues: string[] = []
      const recommendations: string[] = []
      let score = 100

      // Check for required fields
      if (!product.name || product.name.trim().length === 0) {
        issues.push('Product name is missing')
        score -= 20
      }

      if (!product.model || product.model.trim().length === 0) {
        issues.push('Product model is missing')
        score -= 15
      }

      // Check specifications
      if (!product.specifications || product.specifications.length === 0) {
        issues.push('No specifications found')
        score -= 25
        recommendations.push('Add technical specifications')
      } else {
        // Check for key specifications
        const hasPower = product.specifications.some(spec => 
          spec.name.toLowerCase().includes('power')
        )
        const hasEfficiency = product.specifications.some(spec => 
          spec.name.toLowerCase().includes('efficiency')
        )

        if (!hasPower) {
          issues.push('Power rating is missing')
          score -= 10
          recommendations.push('Add power rating specification')
        }

        if (!hasEfficiency) {
          issues.push('Efficiency rating is missing')
          score -= 10
          recommendations.push('Add efficiency specification')
        }
      }

      // Check confidence score
      if (product.confidenceScore && product.confidenceScore < 0.7) {
        issues.push('Low confidence score in extracted data')
        score -= 15
        recommendations.push('Review and improve data extraction')
      }

      // Check for recent updates
      const daysSinceUpdate = Math.floor(
        (Date.now() - product.updatedAt.getTime()) / (1000 * 60 * 60 * 24)
      )
      
      if (daysSinceUpdate > 30) {
        issues.push('Product data is outdated')
        score -= 10
        recommendations.push('Update product information')
      }

      return {
        score: Math.max(0, score),
        issues,
        recommendations
      }
    } catch (error) {
      console.error('Error validating data quality:', error)
      return {
        score: 0,
        issues: ['Unable to validate data quality'],
        recommendations: ['Check product data and try again']
      }
    }
  }
}

export default DataProcessorService
