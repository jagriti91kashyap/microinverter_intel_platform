import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma-client'
import { validateServerSession } from '@/lib/session-manager'

// Search validation schemas
const searchSchema = z.object({
  q: z.string().min(1, 'Search query is required').max(200, 'Search query too long'),
  page: z.coerce.number().int().min(1).max(1000).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
  manufacturers: z.array(z.string()).optional(),
  countries: z.array(z.string()).optional(),
  minPower: z.coerce.number().min(0).optional(),
  maxPower: z.coerce.number().min(0).optional(),
  minEfficiency: z.coerce.number().min(0).max(100).optional(),
  maxEfficiency: z.coerce.number().min(0).max(100).optional(),
  minWarranty: z.coerce.number().int().min(0).optional(),
  maxWarranty: z.coerce.number().int().min(0).optional(),
  certifications: z.array(z.string()).optional(),
  status: z.array(z.enum(['ACTIVE', 'DISCONTINUED', 'ANNOUNCED', 'COMING_SOON'])).optional(),
  sortBy: z.enum(['relevance', 'name', 'acPower', 'efficiency', 'warranty', 'createdAt']).default('relevance'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
  includeSpecs: z.boolean().default(false),
  includeCertifications: z.boolean().default(false)
})

const suggestionsSchema = z.object({
  q: z.string().min(2, 'Suggestions query must be at least 2 characters').max(50, 'Query too long'),
  limit: z.coerce.number().int().min(1).max(20).default(5)
})

// Enhanced product data with comprehensive specifications
const enhancedProducts = [
  {
    id: '1',
    name: 'IQ8 Microinverter',
    series: 'IQ8',
    model: 'IQ8A-3-72-208-240-277',
    manufacturerId: '1',
    acPower: 345,
    maxModuleSize: 370,
    voltage: 240,
    mppt: 1,
    efficiency: 97.0,
    warranty: 25,
    weight: 3.1,
    dimensions: JSON.stringify({ length: 15.7, width: 8.5, height: 1.5, unit: 'inches' }),
    monitoringPlatform: 'Enphase Enlighten',
    status: 'ACTIVE',
    imageUrl: 'https://enphase.com/sites/default/files/2024-01/iq8-microinverter.png',
    datasheetUrl: 'https://enphase.com/download/iq8-and-iq8-microinverters-data-sheet',
    productUrl: 'https://enphase.com/en-us/products/solar/microinverters/iq8',
    aiSummary: 'The IQ8 Microinverter is Enphase\'s latest generation microinverter with 97% efficiency and 25-year warranty.',
    confidenceScore: 0.95,
    manufacturer: {
      id: '1',
      name: 'Enphase Energy',
      country: 'United States',
      website: 'https://enphase.com',
      description: 'Leading microinverter manufacturer with innovative energy management solutions'
    },
    specifications: [
      { category: 'Electrical', name: 'Maximum AC Power', value: '345', unit: 'W', confidence: 0.95 },
      { category: 'Electrical', name: 'Peak Efficiency', value: '97.0', unit: '%', confidence: 0.95 },
      { category: 'Mechanical', name: 'Weight', value: '3.1', unit: 'kg', confidence: 0.95 },
      { category: 'Environmental', name: 'Operating Temperature', value: '-40 to 85', unit: '°C', confidence: 0.95 }
    ],
    certifications: [
      { country: 'United States', standard: 'UL 1741', certified: true, dateObtained: '2020-01-15' },
      { country: 'Canada', standard: 'CSA C22.2', certified: true, dateObtained: '2020-02-20' },
      { country: 'European Union', standard: 'IEC 62109', certified: true, dateObtained: '2019-11-10' }
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: '2',
    name: 'IQ8AC Microinverter',
    series: 'IQ8',
    model: 'IQ8AC-72-M-INT',
    manufacturerId: '1',
    acPower: 366,
    maxModuleSize: 400,
    voltage: 230,
    mppt: 1,
    efficiency: 97.0,
    warranty: 25,
    weight: 3.1,
    dimensions: JSON.stringify({ length: 15.7, width: 8.5, height: 1.5, unit: 'inches' }),
    monitoringPlatform: 'Enphase Enlighten',
    status: 'ACTIVE',
    imageUrl: 'https://enphase.com/sites/default/files/2024-01/iq8ac-microinverter.png',
    datasheetUrl: 'https://enphase.com/download/iq8ac-and-iq8hc-microinverters-data-sheet',
    productUrl: 'https://enphase.com/en-au/products/solar/microinverters/iq8ac',
    aiSummary: 'The IQ8AC Microinverter is designed for 230V markets with 366W AC output and 97% efficiency.',
    confidenceScore: 0.95,
    manufacturer: {
      id: '1',
      name: 'Enphase Energy',
      country: 'United States',
      website: 'https://enphase.com',
      description: 'Leading microinverter manufacturer with innovative energy management solutions'
    },
    specifications: [
      { category: 'Electrical', name: 'Maximum AC Power', value: '366', unit: 'W', confidence: 0.95 },
      { category: 'Electrical', name: 'Peak Efficiency', value: '97.0', unit: '%', confidence: 0.95 },
      { category: 'Mechanical', name: 'Weight', value: '3.1', unit: 'kg', confidence: 0.95 }
    ],
    certifications: [
      { country: 'European Union', standard: 'IEC 62109', certified: true, dateObtained: '2019-11-10' },
      { country: 'Australia', standard: 'AS 4777', certified: true, dateObtained: '2020-03-15' }
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: '3',
    name: 'HD-Wave Inverter',
    series: 'HD-Wave',
    model: 'SE3000H-US',
    manufacturerId: '2',
    acPower: 3000,
    maxModuleSize: 3500,
    voltage: 240,
    mppt: 2,
    efficiency: 99.0,
    warranty: 12,
    weight: 21.1,
    dimensions: JSON.stringify({ length: 27.6, width: 14.6, height: 9.6, unit: 'inches' }),
    monitoringPlatform: 'SolarEdge Monitoring Platform',
    status: 'ACTIVE',
    imageUrl: 'https://www.solaredge.com/sites/default/files/se3000h-inverter.png',
    datasheetUrl: 'https://www.solaredge.com/sites/default/files/se3000h-us-datasheet.pdf',
    productUrl: 'https://www.solaredge.com/products/inverters/residential/hd-wave/single-phase-inverter/se3000h',
    aiSummary: 'The HD-Wave Inverter from SolarEdge offers 99% efficiency with advanced power optimization technology.',
    confidenceScore: 0.95,
    manufacturer: {
      id: '2',
      name: 'SolarEdge Technologies',
      country: 'Israel',
      website: 'https://solaredge.com',
      description: 'Global leader in smart energy technology with power optimizers and inverters'
    },
    specifications: [
      { category: 'Electrical', name: 'Maximum AC Power', value: '3000', unit: 'W', confidence: 0.95 },
      { category: 'Electrical', name: 'Peak Efficiency', value: '99.0', unit: '%', confidence: 0.95 },
      { category: 'Mechanical', name: 'Weight', value: '21.1', unit: 'kg', confidence: 0.95 }
    ],
    certifications: [
      { country: 'United States', standard: 'UL 1741', certified: true, dateObtained: '2019-06-20' },
      { country: 'European Union', standard: 'IEC 62109', certified: true, dateObtained: '2019-07-15' }
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: '4',
    name: 'Sunny Boy Inverter',
    series: 'Sunny Boy',
    model: 'SB3.0-1AV-40',
    manufacturerId: '3',
    acPower: 3000,
    maxModuleSize: 3200,
    voltage: 240,
    mppt: 2,
    efficiency: 97.5,
    warranty: 10,
    weight: 17.5,
    dimensions: JSON.stringify({ length: 19.7, width: 16.9, height: 8.1, unit: 'inches' }),
    monitoringPlatform: 'SMA Sunny Portal',
    status: 'ACTIVE',
    imageUrl: 'https://www.sma.de/fileadmin/templates/sma/images/products/sunny-boy.png',
    datasheetUrl: 'https://files.sma.de/dl/20165/SB30-1AV-40-DEN1722W.pdf',
    productUrl: 'https://www.sma.de/en/products/solar-inverters/sunny-boy-1.5-2.5-3.0-3.5.html',
    aiSummary: 'The Sunny Boy 3.0 inverter from SMA provides 97.5% efficiency with German engineering quality.',
    confidenceScore: 0.95,
    manufacturer: {
      id: '3',
      name: 'SMA Solar Technology',
      country: 'Germany',
      website: 'https://sma.de',
      description: 'German manufacturer of solar inverters and monitoring systems'
    },
    specifications: [
      { category: 'Electrical', name: 'Maximum AC Power', value: '3000', unit: 'W', confidence: 0.95 },
      { category: 'Electrical', name: 'Peak Efficiency', value: '97.5', unit: '%', confidence: 0.95 },
      { category: 'Mechanical', name: 'Weight', value: '17.5', unit: 'kg', confidence: 0.95 }
    ],
    certifications: [
      { country: 'Germany', standard: 'VDE 0126', certified: true, dateObtained: '2019-05-10' },
      { country: 'European Union', standard: 'IEC 62109', certified: true, dateObtained: '2019-06-15' }
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
]

// Advanced search with relevance scoring
function calculateRelevance(product: any, query: string): number {
  const queryLower = query.toLowerCase()
  const searchTerms = queryLower.split(' ').filter(term => term.length > 0)
  
  let relevance = 0
  
  // Exact name match gets highest score
  if (product.name.toLowerCase() === queryLower) {
    relevance += 100
  }
  
  // Name contains query
  if (product.name.toLowerCase().includes(queryLower)) {
    relevance += 50
  }
  
  // Series match
  if (product.series && product.series.toLowerCase().includes(queryLower)) {
    relevance += 30
  }
  
  // Model match
  if (product.model && product.model.toLowerCase().includes(queryLower)) {
    relevance += 25
  }
  
  // Manufacturer match
  if (product.manufacturer.name.toLowerCase().includes(queryLower)) {
    relevance += 20
  }
  
  // AI summary match
  if (product.aiSummary && product.aiSummary.toLowerCase().includes(queryLower)) {
    relevance += 15
  }
  
  // Term-based scoring
  searchTerms.forEach(term => {
    if (product.name.toLowerCase().includes(term)) relevance += 10
    if (product.series && product.series.toLowerCase().includes(term)) relevance += 8
    if (product.model && product.model.toLowerCase().includes(term)) relevance += 6
    if (product.manufacturer.name.toLowerCase().includes(term)) relevance += 5
    if (product.aiSummary && product.aiSummary.toLowerCase().includes(term)) relevance += 3
  })
  
  return relevance
}

// Main search endpoint
export async function GET(request: NextRequest) {
  try {
    // Validate session
    const { user, error, status } = await validateServerSession(request)
    if (!user) {
      return NextResponse.json({ error }, { status })
    }

    const { searchParams } = new URL(request.url)
    const suggestions = searchParams.get('suggestions') === 'true'
    
    if (suggestions) {
      return await getSearchSuggestions(request)
    }
    
    return await performSearch(request)
  } catch (error) {
    console.error('Search API error:', error)
    return NextResponse.json(
      { error: 'Search failed' },
      { status: 500 }
    )
  }
}

async function performSearch(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  
  // Parse and validate search parameters
  const searchParamsObj = {
    q: searchParams.get('q') || '',
    page: searchParams.get('page') || '1',
    pageSize: searchParams.get('pageSize') || '20',
    manufacturers: searchParams.get('manufacturers')?.split(',').filter(Boolean),
    countries: searchParams.get('countries')?.split(',').filter(Boolean),
    minPower: searchParams.get('minPower'),
    maxPower: searchParams.get('maxPower'),
    minEfficiency: searchParams.get('minEfficiency'),
    maxEfficiency: searchParams.get('maxEfficiency'),
    minWarranty: searchParams.get('minWarranty'),
    maxWarranty: searchParams.get('maxWarranty'),
    certifications: searchParams.get('certifications')?.split(',').filter(Boolean),
    status: searchParams.get('status')?.split(',').filter(Boolean),
    sortBy: searchParams.get('sortBy') || 'relevance',
    sortOrder: searchParams.get('sortOrder') || 'desc',
    includeSpecs: searchParams.get('includeSpecs') === 'true',
    includeCertifications: searchParams.get('includeCertifications') === 'true'
  }
  
  const validatedParams = searchSchema.parse(searchParamsObj)
  
  try {
    // Try database search first
    const dbResults = await performDatabaseSearch(validatedParams)
    if (dbResults) {
      return NextResponse.json(dbResults)
    }
  } catch (dbError) {
    console.error('Database search failed, falling back to enhanced search:', dbError)
  }
  
  // Fallback to enhanced search with mock data
  return NextResponse.json(performEnhancedSearch(validatedParams))
}

async function performDatabaseSearch(params: any) {
  // Build where clause for database search
  const where: any = {}
  
  if (params.q) {
    where.OR = [
      { name: { contains: params.q, mode: 'insensitive' } },
      { series: { contains: params.q, mode: 'insensitive' } },
      { model: { contains: params.q, mode: 'insensitive' } },
      { manufacturer: { name: { contains: params.q, mode: 'insensitive' } } },
      { aiSummary: { contains: params.q, mode: 'insensitive' } }
    ]
  }
  
  if (params.manufacturers && params.manufacturers.length > 0) {
    where.manufacturer = {
      name: { in: params.manufacturers }
    }
  }
  
  if (params.countries && params.countries.length > 0) {
    where.manufacturer = {
      ...where.manufacturer,
      country: { in: params.countries }
    }
  }
  
  if (params.minPower || params.maxPower) {
    where.acPower = {}
    if (params.minPower) where.acPower.gte = parseFloat(params.minPower)
    if (params.maxPower) where.acPower.lte = parseFloat(params.maxPower)
  }
  
  if (params.minEfficiency || params.maxEfficiency) {
    where.efficiency = {}
    if (params.minEfficiency) where.efficiency.gte = parseFloat(params.minEfficiency)
    if (params.maxEfficiency) where.efficiency.lte = parseFloat(params.maxEfficiency)
  }
  
  if (params.minWarranty || params.maxWarranty) {
    where.warranty = {}
    if (params.minWarranty) where.warranty.gte = parseInt(params.minWarranty)
    if (params.maxWarranty) where.warranty.lte = parseInt(params.maxWarranty)
  }
  
  if (params.status && params.status.length > 0) {
    where.status = { in: params.status }
  }
  
  // Build include options
  const includeOptions: any = {
    manufacturer: {
      select: {
        id: true,
        name: true,
        country: true,
        website: true,
        description: true
      }
    }
  }
  
  if (params.includeSpecs) {
    includeOptions.specifications = {
      select: {
        id: true,
        category: true,
        name: true,
        value: true,
        unit: true,
        confidence: true
      }
    }
  }
  
  if (params.includeCertifications) {
    includeOptions.certifications = {
      select: {
        id: true,
        country: true,
        standard: true,
        certified: true,
        dateObtained: true
      }
    }
  }
  
  // Build order clause
  const orderBy: any = {}
  if (params.sortBy === 'relevance') {
    // For relevance, we'll need to implement a more complex ranking system
    orderBy.createdAt = 'desc'
  } else if (['name', 'acPower', 'efficiency', 'warranty', 'createdAt'].includes(params.sortBy)) {
    orderBy[params.sortBy] = params.sortOrder
  } else {
    orderBy.createdAt = 'desc'
  }
  
  // Get total count
  const total = await prisma.product.count({ where })
  
  // Get products
  const products = await prisma.product.findMany({
    where,
    include: includeOptions,
    orderBy,
    skip: (params.page - 1) * params.pageSize,
    take: params.pageSize
  })
  
  // Calculate relevance if needed
  let items = products
  if (params.sortBy === 'relevance' && params.q) {
    items = products.map(product => ({
      ...product,
      relevance: calculateRelevance(product, params.q)
    })).sort((a, b) => b.relevance - a.relevance)
  }
  
  return NextResponse.json({
    items,
    total,
    page: params.page,
    pageSize: params.pageSize,
    totalPages: Math.ceil(total / params.pageSize),
    hasNext: params.page * params.pageSize < total,
    hasPrev: params.page > 1
  })
}

function performEnhancedSearch(params: any) {
  let filteredProducts = enhancedProducts
  
  // Text search with relevance scoring
  if (params.q) {
    filteredProducts = filteredProducts.map(product => ({
      ...product,
      relevance: calculateRelevance(product, params.q)
    })).filter(product => product.relevance > 0)
  }
  
  // Manufacturer filter
  if (params.manufacturers && params.manufacturers.length > 0) {
    filteredProducts = filteredProducts.filter(product =>
      params.manufacturers.includes(product.manufacturer.name)
    )
  }
  
  // Country filter
  if (params.countries && params.countries.length > 0) {
    filteredProducts = filteredProducts.filter(product =>
      params.countries.includes(product.manufacturer.country)
    )
  }
  
  // Power range filter
  if (params.minPower || params.maxPower) {
    filteredProducts = filteredProducts.filter(product => {
      const power = product.acPower || 0
      if (params.minPower && power < parseFloat(params.minPower)) return false
      if (params.maxPower && power > parseFloat(params.maxPower)) return false
      return true
    })
  }
  
  // Efficiency range filter
  if (params.minEfficiency || params.maxEfficiency) {
    filteredProducts = filteredProducts.filter(product => {
      const efficiency = product.efficiency || 0
      if (params.minEfficiency && efficiency < parseFloat(params.minEfficiency)) return false
      if (params.maxEfficiency && efficiency > parseFloat(params.maxEfficiency)) return false
      return true
    })
  }
  
  // Warranty range filter
  if (params.minWarranty || params.maxWarranty) {
    filteredProducts = filteredProducts.filter(product => {
      const warranty = product.warranty || 0
      if (params.minWarranty && warranty < parseInt(params.minWarranty)) return false
      if (params.maxWarranty && warranty > parseInt(params.maxWarranty)) return false
      return true
    })
  }
  
  // Status filter
  if (params.status && params.status.length > 0) {
    filteredProducts = filteredProducts.filter(product =>
      params.status.includes(product.status)
    )
  }
  
  // Sort results
  if (params.sortBy === 'relevance' && params.q) {
    filteredProducts.sort((a, b) => b.relevance - a.relevance)
  } else if (['name', 'acPower', 'efficiency', 'warranty', 'createdAt'].includes(params.sortBy)) {
    filteredProducts.sort((a, b) => {
      const aValue = a[params.sortBy] || ''
      const bValue = b[params.sortBy] || ''
      return params.sortOrder === 'desc' 
        ? bValue.toString().localeCompare(aValue.toString())
        : aValue.toString().localeCompare(bValue.toString())
    })
  }
  
  // Apply pagination
  const total = filteredProducts.length
  const startIndex = (params.page - 1) * params.pageSize
  const endIndex = startIndex + params.pageSize
  const paginatedProducts = filteredProducts.slice(startIndex, endIndex)
  
  // Remove relevance from response if not needed
  const items = paginatedProducts.map(({ relevance, ...product }) => {
    const result: any = product
    if (params.sortBy === 'relevance') {
      result.relevance = relevance
    }
    return result
  })
  
  return {
    items,
    total,
    page: params.page,
    pageSize: params.pageSize,
    totalPages: Math.ceil(total / params.pageSize),
    hasNext: params.page * params.pageSize < total,
    hasPrev: params.page > 1
  }
}

async function getSearchSuggestions(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const validatedParams = suggestionsSchema.parse({
      q: searchParams.get('q') || '',
      limit: searchParams.get('limit') || '5'
    })
    
    const suggestions = [
      // Product suggestions
      ...enhancedProducts.map(product => ({
        id: product.id,
        name: product.name,
        type: 'product' as const,
        manufacturer: product.manufacturer.name,
        series: product.series,
        model: product.model,
        relevance: calculateRelevance(product, validatedParams.q)
      })),
      // Manufacturer suggestions
      ...Array.from(new Set(enhancedProducts.map(p => p.manufacturer))).map(manufacturer => ({
        id: manufacturer.id,
        name: manufacturer.name,
        type: 'manufacturer' as const,
        country: manufacturer.country,
        relevance: manufacturer.name.toLowerCase().includes(validatedParams.q.toLowerCase()) ? 50 : 0
      }))
    ]
    .filter(item => item.relevance > 0)
    .sort((a, b) => b.relevance - a.relevance)
    .slice(0, validatedParams.limit)
    
    return NextResponse.json({ suggestions })
  } catch (error) {
    console.error('Suggestions error:', error)
    return NextResponse.json(
      { error: 'Failed to get suggestions' },
      { status: 500 }
    )
  }
}
