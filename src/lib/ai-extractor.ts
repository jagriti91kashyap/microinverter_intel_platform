import { prisma } from '@/lib/prisma-client'

// AI data extraction service
export class AIExtractorService {
  private static instance: AIExtractorService

  static getInstance(): AIExtractorService {
    if (!AIExtractorService.instance) {
      AIExtractorService.instance = new AIExtractorService()
    }
    return AIExtractorService.instance
  }

  // Extract structured product data from scraped content
  async extractProductData(scrapedProduct: any, manufacturerId: string): Promise<any> {
    try {
      // Extract basic product information
      const basicInfo = this.extractBasicInfo(scrapedProduct)
      
      // Extract technical specifications
      const specifications = this.extractSpecifications(scrapedProduct.specifications)
      
      // Extract performance metrics
      const performance = this.extractPerformanceMetrics(specifications)
      
      // Generate AI summary
      const aiSummary = await this.generateAISummary(basicInfo, specifications, performance)
      
      // Calculate confidence score
      const confidenceScore = this.calculateConfidenceScore(scrapedProduct, specifications)
      
      // Extract certifications
      const certifications = this.extractCertifications(scrapedProduct)
      
      // Extract availability data
      const availability = this.extractAvailability(scrapedProduct)
      
      return {
        ...basicInfo,
        manufacturerId,
        specifications,
        performance,
        aiSummary,
        confidenceScore,
        certifications,
        availability,
        extractedAt: new Date(),
        sourceData: scrapedProduct
      }
    } catch (error) {
      console.error('Error extracting product data:', error)
      throw error
    }
  }

  // Extract basic product information
  private extractBasicInfo(scrapedProduct: any): any {
    return {
      name: scrapedProduct.name || '',
      series: scrapedProduct.series || '',
      model: scrapedProduct.model || '',
      description: scrapedProduct.description || '',
      imageUrl: scrapedProduct.imageUrl || '',
      datasheetUrl: scrapedProduct.datasheetUrl || '',
      productUrl: scrapedProduct.productUrl || '',
      monitoringPlatform: this.extractMonitoringPlatform(scrapedProduct),
      status: 'ACTIVE' as const
    }
  }

  // Extract and normalize technical specifications
  private extractSpecifications(specs: any): any[] {
    if (!specs || typeof specs !== 'object') {
      return []
    }

    const specifications = []
    
    // Define specification categories and their mappings
    const categoryMappings = {
      'Electrical': ['power', 'voltage', 'current', 'efficiency', 'frequency'],
      'Mechanical': ['weight', 'dimensions', 'size', 'mounting'],
      'Environmental': ['temperature', 'humidity', 'altitude', 'ip'],
      'Safety': ['certification', 'protection', 'safety'],
      'Warranty': ['warranty', 'guarantee', 'service']
    }

    for (const [key, value] of Object.entries(specs)) {
      const category = this.categorizeSpecification(key, categoryMappings)
      const normalizedSpec = this.normalizeSpecification(key, value, category)
      
      if (normalizedSpec) {
        specifications.push(normalizedSpec)
      }
    }

    return specifications
  }

  // Categorize specification based on key
  private categorizeSpecification(key: string, mappings: any): string {
    const keyLower = key.toLowerCase()
    
    for (const [category, keywords] of Object.entries(mappings)) {
      if (keywords.some((keyword: string) => keyLower.includes(keyword))) {
        return category
      }
    }
    
    return 'General'
  }

  // Normalize specification data
  private normalizeSpecification(name: string, value: string, category: string): any {
    if (!value) return null

    const numericValue = this.extractNumericValue(value)
    const unit = this.extractUnit(value)
    const confidence = this.calculateSpecificationConfidence(name, value)

    return {
      category,
      name,
      value,
      unit,
      numericValue,
      confidence,
      description: `${name}: ${value}`,
      isVerified: confidence > 0.8
    }
  }

  // Extract performance metrics from specifications
  private extractPerformanceMetrics(specifications: any[]): any {
    const metrics = {
      acPower: null as number | null,
      maxModuleSize: null as number | null,
      efficiency: null as number | null,
      warranty: null as number | null,
      weight: null as number | null,
      voltage: null as number | null,
      mppt: null as number | null
    }

    specifications.forEach(spec => {
      const nameLower = spec.name.toLowerCase()
      
      if (nameLower.includes('ac power') || nameLower.includes('maximum ac power')) {
        metrics.acPower = spec.numericValue
      } else if (nameLower.includes('dc power') || nameLower.includes('maximum dc power')) {
        metrics.maxModuleSize = spec.numericValue
      } else if (nameLower.includes('efficiency')) {
        metrics.efficiency = spec.numericValue
      } else if (nameLower.includes('warranty') || nameLower.includes('guarantee')) {
        metrics.warranty = spec.numericValue
      } else if (nameLower.includes('weight')) {
        metrics.weight = spec.numericValue
      } else if (nameLower.includes('voltage')) {
        metrics.voltage = spec.numericValue
      } else if (nameLower.includes('mppt')) {
        metrics.mppt = spec.numericValue
      }
    })

    return metrics
  }

  // Generate AI-powered summary
  private async generateAISummary(basicInfo: any, specifications: any[], performance: any): Promise<string> {
    try {
      // In production, this would call an AI service like OpenAI
      // For now, generate a template-based summary
      
      const powerInfo = performance.acPower ? `${performance.acPower}W` : 'high power'
      const efficiencyInfo = performance.efficiency ? `${performance.efficiency}% efficiency` : 'high efficiency'
      const warrantyInfo = performance.warranty ? `${performance.warranty}-year warranty` : 'standard warranty'
      
      let summary = `The ${basicInfo.name} is a ${basicInfo.series || ''} ${basicInfo.model || ''} `
      summary += `offering ${powerInfo} output with ${efficiencyInfo}. `
      
      if (basicInfo.description) {
        summary += `Features include ${basicInfo.description.toLowerCase()}. `
      }
      
      summary += `Comes with ${warrantyInfo} and is designed for reliable performance.`
      
      return summary
    } catch (error) {
      console.error('Error generating AI summary:', error)
      return `${basicInfo.name} - ${basicInfo.series || ''} ${basicInfo.model || ''}`
    }
  }

  // Calculate confidence score for extracted data
  private calculateConfidenceScore(scrapedProduct: any, specifications: any[]): number {
    let score = 0.5 // Base score
    
    // Check for required fields
    if (scrapedProduct.name && scrapedProduct.name.trim().length > 0) score += 0.1
    if (scrapedProduct.model && scrapedProduct.model.trim().length > 0) score += 0.1
    if (scrapedProduct.specifications && Object.keys(scrapedProduct.specifications).length > 0) score += 0.1
    
    // Check for key specifications
    const hasPower = specifications.some(spec => 
      spec.name.toLowerCase().includes('power') && spec.numericValue
    )
    const hasEfficiency = specifications.some(spec => 
      spec.name.toLowerCase().includes('efficiency') && spec.numericValue
    )
    
    if (hasPower) score += 0.1
    if (hasEfficiency) score += 0.1
    
    // Check for data quality
    const avgSpecConfidence = specifications.reduce((sum, spec) => sum + spec.confidence, 0) / specifications.length
    score += avgSpecConfidence * 0.1
    
    return Math.min(score, 1.0)
  }

  // Calculate specification confidence
  private calculateSpecificationConfidence(name: string, value: string): number {
    let confidence = 0.5
    
    // Higher confidence for well-known specifications
    const knownSpecs = ['power', 'efficiency', 'voltage', 'current', 'warranty', 'weight', 'dimensions']
    if (knownSpecs.some(known => name.toLowerCase().includes(known))) {
      confidence += 0.2
    }
    
    // Higher confidence for values with units
    if (this.extractUnit(value)) {
      confidence += 0.1
    }
    
    // Higher confidence for numeric values
    if (this.extractNumericValue(value) !== null) {
      confidence += 0.1
    }
    
    // Higher confidence for reasonable ranges
    const numericValue = this.extractNumericValue(value)
    if (numericValue !== null) {
      if (name.toLowerCase().includes('efficiency') && numericValue <= 100) {
        confidence += 0.1
      } else if (name.toLowerCase().includes('power') && numericValue > 0 && numericValue < 10000) {
        confidence += 0.1
      }
    }
    
    return Math.min(confidence, 1.0)
  }

  // Extract certifications
  private extractCertifications(scrapedProduct: any): any[] {
    // In production, this would analyze the scraped content for certification mentions
    // For now, return mock certifications based on manufacturer
    
    const certifications = []
    
    if (scrapedProduct.sourceUrl?.includes('enphase')) {
      certifications.push(
        { country: 'United States', standard: 'UL 1741', certified: true, dateObtained: '2020-01-15' },
        { country: 'Canada', standard: 'CSA C22.2', certified: true, dateObtained: '2020-02-20' },
        { country: 'European Union', standard: 'IEC 62109', certified: true, dateObtained: '2019-11-10' }
      )
    } else if (scrapedProduct.sourceUrl?.includes('solaredge')) {
      certifications.push(
        { country: 'United States', standard: 'UL 1741', certified: true, dateObtained: '2019-06-20' },
        { country: 'European Union', standard: 'IEC 62109', certified: true, dateObtained: '2019-07-15' }
      )
    } else if (scrapedProduct.sourceUrl?.includes('sma')) {
      certifications.push(
        { country: 'Germany', standard: 'VDE 0126', certified: true, dateObtained: '2019-05-10' },
        { country: 'European Union', standard: 'IEC 62109', certified: true, dateObtained: '2019-06-15' }
      )
    }
    
    return certifications
  }

  // Extract availability data
  private extractAvailability(scrapedProduct: any): any[] {
    // In production, this would check availability from various sources
    // For now, return mock availability data
    
    const availability = []
    
    if (scrapedProduct.sourceUrl?.includes('enphase')) {
      availability.push(
        { country: 'United States', region: 'North America', isAvailable: true, price: 245.99, currency: 'USD', supplier: 'Enphase Authorized Distributor' },
        { country: 'Canada', region: 'North America', isAvailable: true, price: 265.99, currency: 'CAD', supplier: 'Enphase Canada' }
      )
    } else if (scrapedProduct.sourceUrl?.includes('solaredge')) {
      availability.push(
        { country: 'United States', region: 'North America', isAvailable: true, price: 1899.99, currency: 'USD', supplier: 'SolarEdge Distributor' }
      )
    } else if (scrapedProduct.sourceUrl?.includes('sma')) {
      availability.push(
        { country: 'Germany', region: 'Europe', isAvailable: true, price: 1299.99, currency: 'EUR', supplier: 'SMA Germany' }
      )
    }
    
    return availability
  }

  // Extract monitoring platform
  private extractMonitoringPlatform(scrapedProduct: any): string {
    // Extract monitoring platform from scraped data
    if (scrapedProduct.sourceUrl?.includes('enphase')) {
      return 'Enphase Enlighten'
    } else if (scrapedProduct.sourceUrl?.includes('solaredge')) {
      return 'SolarEdge Monitoring Platform'
    } else if (scrapedProduct.sourceUrl?.includes('sma')) {
      return 'SMA Sunny Portal'
    }
    
    return ''
  }

  // Extract numeric value from string
  private extractNumericValue(value: string): number | null {
    if (!value) return null
    
    const match = value.match(/[\d,.]+/)
    if (match) {
      return parseFloat(match[0].replace(',', ''))
    }
    
    return null
  }

  // Extract unit from string
  private extractUnit(value: string): string | null {
    if (!value) return null
    
    const match = value.match(/[a-zA-Z%]+$/)
    if (match) {
      return match[0]
    }
    
    return null
  }

  // Compare extracted data with existing product
  async compareWithExisting(extractedData: any, manufacturerId: string): Promise<{
    isDuplicate: boolean
    existingProduct?: any
    changes?: any[]
  }> {
    try {
      // Check for existing product with same manufacturer, name, and model
      const existingProduct = await prisma.product.findFirst({
        where: {
          manufacturerId,
          name: extractedData.name,
          model: extractedData.model
        },
        include: {
          specifications: true,
          certifications: true
        }
      })

      if (!existingProduct) {
        return { isDuplicate: false }
      }

      // Compare specifications to detect changes
      const changes = this.detectChanges(existingProduct, extractedData)

      return {
        isDuplicate: true,
        existingProduct,
        changes
      }
    } catch (error) {
      console.error('Error comparing with existing product:', error)
      return { isDuplicate: false }
    }
  }

  // Detect changes between existing and extracted data
  private detectChanges(existingProduct: any, extractedData: any): any[] {
    const changes = []

    // Compare basic fields
    if (existingProduct.description !== extractedData.description) {
      changes.push({
        field: 'description',
        oldValue: existingProduct.description,
        newValue: extractedData.description,
        type: 'updated'
      })
    }

    // Compare specifications
    const existingSpecs = existingProduct.specifications || []
    const extractedSpecs = extractedData.specifications || []

    extractedSpecs.forEach(extractedSpec => {
      const existingSpec = existingSpecs.find((spec: any) => spec.name === extractedSpec.name)
      
      if (!existingSpec) {
        changes.push({
          field: 'specification',
          name: extractedSpec.name,
          oldValue: null,
          newValue: extractedSpec.value,
          type: 'added'
        })
      } else if (existingSpec.value !== extractedSpec.value) {
        changes.push({
          field: 'specification',
          name: extractedSpec.name,
          oldValue: existingSpec.value,
          newValue: extractedSpec.value,
          type: 'updated'
        })
      }
    })

    return changes
  }
}

export default AIExtractorService
