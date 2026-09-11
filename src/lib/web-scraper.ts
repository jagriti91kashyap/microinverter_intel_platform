import { prisma } from '@/lib/prisma-client'

// Web scraping configuration for different manufacturers
const manufacturerConfigs = {
  enphase: {
    baseUrl: 'https://enphase.com',
    productPages: [
      '/en-us/products/solar/microinverters',
      '/en-us/products/solar/inverters',
      '/en-us/products/storage'
    ],
    selectors: {
      productName: 'h1, .product-title, .product-name',
      productSeries: '.product-series, .series',
      productModel: '.product-model, .model-number',
      productDescription: '.product-description, .description',
      specifications: '.specifications, .specs, .spec-table',
      imageUrl: '.product-image img, .main-image img',
      datasheetUrl: 'a[href*="datasheet"], a[href*="data-sheet"]',
      productUrl: 'a.product-link, .product-card a',
      powerRating: '.power-rating, .ac-power, .wattage',
      efficiency: '.efficiency, .efficiency-rating',
      warranty: '.warranty, .warranty-period'
    }
  },
  solaredge: {
    baseUrl: 'https://solaredge.com',
    productPages: [
      '/products/inverters',
      '/products/power-optimizers',
      '/products/storage'
    ],
    selectors: {
      productName: 'h1, .product-title',
      productSeries: '.product-family, .series',
      productModel: '.model-number, .sku',
      productDescription: '.product-description, .overview',
      specifications: '.technical-specs, .specifications',
      imageUrl: '.product-image img, .hero-image img',
      datasheetUrl: 'a[href*="datasheet"]',
      productUrl: '.product-card a, .product-link',
      powerRating: '.power, .rating',
      efficiency: '.efficiency, .peak-efficiency',
      warranty: '.warranty, .years-warranty'
    }
  },
  sma: {
    baseUrl: 'https://sma.de',
    productPages: [
      '/en/products/solar-inverters',
      '/en/products/storage-systems'
    ],
    selectors: {
      productName: 'h1, .product-title',
      productSeries: '.product-series, .series',
      productModel: '.product-model, .model',
      productDescription: '.product-description, .description',
      specifications: '.specifications, .technical-data',
      imageUrl: '.product-image img, .main-image img',
      datasheetUrl: 'a[href*="datasheet"], a[href*="download"]',
      productUrl: '.product-link, .product-card a',
      powerRating: '.power, .rating',
      efficiency: '.efficiency, .efficiency-value',
      warranty: '.warranty, .guarantee'
    }
  }
}

// Web scraping service
export class WebScraperService {
  private static instance: WebScraperService

  static getInstance(): WebScraperService {
    if (!WebScraperService.instance) {
      WebScraperService.instance = new WebScraperService()
    }
    return WebScraperService.instance
  }

  // Scrape manufacturer products
  async scrapeManufacturerProducts(manufacturerId: string): Promise<any[]> {
    try {
      // Get manufacturer from database
      const manufacturer = await prisma.manufacturer.findUnique({
        where: { id: manufacturerId }
      })

      if (!manufacturer) {
        throw new Error(`Manufacturer not found: ${manufacturerId}`)
      }

      // Get manufacturer configuration
      const config = this.getManufacturerConfig(manufacturer.name)
      if (!config) {
        throw new Error(`No scraping configuration for manufacturer: ${manufacturer.name}`)
      }

      const products = []
      
      // Scrape each product page
      for (const pagePath of config.productPages) {
        const pageProducts = await this.scrapeProductPage(config, pagePath)
        products.push(...pageProducts)
      }

      return products
    } catch (error) {
      console.error(`Error scraping manufacturer ${manufacturerId}:`, error)
      throw error
    }
  }

  // Scrape a single product page
  private async scrapeProductPage(config: any, pagePath: string): Promise<any[]> {
    try {
      const url = `${config.baseUrl}${pagePath}`
      
      // For development, return mock data
      // In production, this would use a web scraping library like Puppeteer or Cheerio
      return this.getMockScrapedProducts(config, url)
    } catch (error) {
      console.error(`Error scraping page ${pagePath}:`, error)
      return []
    }
  }

  // Get manufacturer configuration
  private getManufacturerConfig(manufacturerName: string): any {
    const name = manufacturerName.toLowerCase()
    
    if (name.includes('enphase')) {
      return manufacturerConfigs.enphase
    } else if (name.includes('solaredge')) {
      return manufacturerConfigs.solaredge
    } else if (name.includes('sma')) {
      return manufacturerConfigs.sma
    }
    
    return null
  }

  // Mock scraped data for development
  private getMockScrapedProducts(config: any, url: string): any[] {
    const mockProducts = {
      enphase: [
        {
          name: 'IQ8 Microinverter',
          series: 'IQ8',
          model: 'IQ8A-3-72-208-240-277',
          description: 'The latest generation microinverter with 97% efficiency',
          specifications: {
            'Maximum AC Power': '345W',
            'Peak Efficiency': '97.0%',
            'DC Voltage Range': '36-48V',
            'Maximum DC Power': '370W',
            'Weight': '3.1kg',
            'Dimensions': '15.7" x 8.5" x 1.5"',
            'Warranty': '25 years'
          },
          imageUrl: 'https://enphase.com/sites/default/files/2024-01/iq8-microinverter.png',
          datasheetUrl: 'https://enphase.com/download/iq8-and-iq8-microinverters-data-sheet',
          productUrl: 'https://enphase.com/en-us/products/solar/microinverters/iq8',
          scrapedAt: new Date().toISOString(),
          sourceUrl: url
        },
        {
          name: 'IQ8AC Microinverter',
          series: 'IQ8',
          model: 'IQ8AC-72-M-INT',
          description: '230V microinverter for international markets',
          specifications: {
            'Maximum AC Power': '366W',
            'Peak Efficiency': '97.0%',
            'Nominal Grid Voltage': '230V',
            'Maximum DC Power': '400W',
            'Weight': '3.1kg',
            'Dimensions': '15.7" x 8.5" x 1.5"',
            'Warranty': '25 years'
          },
          imageUrl: 'https://enphase.com/sites/default/files/2024-01/iq8ac-microinverter.png',
          datasheetUrl: 'https://enphase.com/download/iq8ac-and-iq8hc-microinverters-data-sheet',
          productUrl: 'https://enphase.com/en-au/products/solar/microinverters/iq8ac',
          scrapedAt: new Date().toISOString(),
          sourceUrl: url
        },
        {
          name: 'IQ Battery 5P',
          series: 'IQ Battery',
          model: 'IQ5P-3P-3-3-3-3',
          description: 'High-capacity battery storage system',
          specifications: {
            'Total Capacity': '5.0kWh',
            'Usable Capacity': '4.6kWh',
            'Continuous Power': '3.84kW',
            'Peak Power': '7.68kW',
            'Weight': '125kg',
            'Dimensions': '26.1" x 16.3" x 6.6"',
            'Warranty': '10 years'
          },
          imageUrl: 'https://enphase.com/sites/default/files/2024-01/iq-battery-5p.png',
          datasheetUrl: 'https://enphase.com/download/iq-battery-5p-data-sheet',
          productUrl: 'https://enphase.com/en-us/products/storage/iq-battery-5p',
          scrapedAt: new Date().toISOString(),
          sourceUrl: url
        }
      ],
      solaredge: [
        {
          name: 'HD-Wave Inverter',
          series: 'HD-Wave',
          model: 'SE3000H-US',
          description: 'High-efficiency single-phase inverter',
          specifications: {
            'Maximum AC Power': '3000W',
            'Peak Efficiency': '99.0%',
            'European Efficiency': '98.4%',
            'Maximum DC Power': '3500W',
            'Weight': '21.1kg',
            'Dimensions': '27.6" x 14.6" x 9.6"',
            'Warranty': '12 years'
          },
          imageUrl: 'https://www.solaredge.com/sites/default/files/se3000h-inverter.png',
          datasheetUrl: 'https://www.solaredge.com/sites/default/files/se3000h-us-datasheet.pdf',
          productUrl: 'https://www.solaredge.com/products/inverters/residential/hd-wave/single-phase-inverter/se3000h',
          scrapedAt: new Date().toISOString(),
          sourceUrl: url
        },
        {
          name: 'Power Optimizer',
          series: 'Power Optimizer',
          model: 'P600',
          description: 'DC-DC power optimizer for maximum energy harvest',
          specifications: {
            'Maximum DC Power': '600W',
            'Maximum DC Voltage': '80V',
            'Maximum DC Current': '12A',
            'Weight': '2.1kg',
            'Dimensions': '10.2" x 6.3" x 1.3"',
            'Warranty': '25 years'
          },
          imageUrl: 'https://www.solaredge.com/sites/default/files/p600-optimizer.png',
          datasheetUrl: 'https://www.solaredge.com/sites/default/files/p600-datasheet.pdf',
          productUrl: 'https://www.solaredge.com/products/power-optimizers/p600',
          scrapedAt: new Date().toISOString(),
          sourceUrl: url
        }
      ],
      sma: [
        {
          name: 'Sunny Boy Inverter',
          series: 'Sunny Boy',
          model: 'SB3.0-1AV-40',
          description: 'Reliable string inverter for residential systems',
          specifications: {
            'Maximum AC Power': '3000W',
            'Peak Efficiency': '97.5%',
            'European Efficiency': '97.3%',
            'Maximum DC Power': '3200W',
            'Weight': '17.5kg',
            'Dimensions': '19.7" x 16.9" x 8.1"',
            'Warranty': '10 years'
          },
          imageUrl: 'https://www.sma.de/fileadmin/templates/sma/images/products/sunny-boy.png',
          datasheetUrl: 'https://files.sma.de/dl/20165/SB30-1AV-40-DEN1722W.pdf',
          productUrl: 'https://www.sma.de/en/products/solar-inverters/sunny-boy-1.5-2.5-3.0-3.5.html',
          scrapedAt: new Date().toISOString(),
          sourceUrl: url
        }
      ]
    }

    // Return products based on manufacturer
    if (url.includes('enphase')) {
      return mockProducts.enphase
    } else if (url.includes('solaredge')) {
      return mockProducts.solaredge
    } else if (url.includes('sma')) {
      return mockProducts.sma
    }

    return []
  }

  // Validate scraped data
  validateScrapedData(product: any): { isValid: boolean; errors: string[] } {
    const errors: string[] = []

    if (!product.name || product.name.trim().length === 0) {
      errors.push('Product name is required')
    }

    if (!product.model || product.model.trim().length === 0) {
      errors.push('Product model is required')
    }

    if (!product.specifications || Object.keys(product.specifications).length === 0) {
      errors.push('Product specifications are required')
    }

    // Validate power rating
    const powerRating = product.specifications['Maximum AC Power'] || product.specifications['Maximum DC Power']
    if (!powerRating) {
      errors.push('Power rating is required in specifications')
    }

    // Validate efficiency
    const efficiency = product.specifications['Peak Efficiency']
    if (!efficiency) {
      errors.push('Efficiency rating is required in specifications')
    }

    return {
      isValid: errors.length === 0,
      errors
    }
  }

  // Extract numeric value from specification
  extractNumericValue(value: string): number | null {
    if (!value) return null
    
    // Extract numeric value from string like "345W" or "97.0%"
    const match = value.match(/[\d,.]+/)
    if (match) {
      return parseFloat(match[0].replace(',', ''))
    }
    
    return null
  }

  // Extract unit from specification
  extractUnit(value: string): string | null {
    if (!value) return null
    
    // Extract unit from string like "345W" or "97.0%"
    const match = value.match(/[a-zA-Z%]+$/)
    if (match) {
      return match[0]
    }
    
    return null
  }

  // Clean and normalize scraped data
  cleanScrapedData(product: any): any {
    return {
      name: product.name?.trim() || '',
      series: product.series?.trim() || '',
      model: product.model?.trim() || '',
      description: product.description?.trim() || '',
      specifications: product.specifications || {},
      imageUrl: product.imageUrl?.trim() || '',
      datasheetUrl: product.datasheetUrl?.trim() || '',
      productUrl: product.productUrl?.trim() || '',
      scrapedAt: product.scrapedAt || new Date().toISOString(),
      sourceUrl: product.sourceUrl || ''
    }
  }
}

export default WebScraperService
