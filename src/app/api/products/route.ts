import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { mockProducts, mockManufacturers } from '@/data/mock-data'

// Validation schemas
const createProductSchema = z.object({
  name: z.string().min(1, 'Name is required').max(200, 'Name too long'),
  series: z.string().max(50, 'Series too long').optional(),
  model: z.string().max(100, 'Model too long').optional(),
  manufacturerId: z.string().min(1, 'Manufacturer ID is required'),
  acPower: z.number().min(0, 'AC Power must be positive').optional(),
  maxModuleSize: z.number().min(0, 'DC Power must be positive').optional(),
  voltage: z.number().min(0, 'Voltage must be positive').optional(),
  mppt: z.number().int().min(1, 'MPPT count must be at least 1').optional(),
  efficiency: z.number().min(0, 'Efficiency must be positive').max(100, 'Efficiency cannot exceed 100%').optional(),
  warranty: z.number().int().min(0, 'Warranty must be positive').optional(),
  weight: z.number().min(0, 'Weight must be positive').optional(),
  dimensions: z.string().max(200, 'Dimensions too long').optional(),
  monitoringPlatform: z.string().max(100, 'Monitoring platform too long').optional(),
  status: z.enum(['ACTIVE', 'DISCONTINUED', 'ANNOUNCED', 'COMING_SOON']).default('ACTIVE'),
  imageUrl: z.string().url('Invalid image URL').optional(),
  datasheetUrl: z.string().url('Invalid datasheet URL').optional(),
  productUrl: z.string().url('Invalid product URL').optional(),
  aiSummary: z.string().max(1000, 'AI summary too long').optional(),
  confidenceScore: z.number().min(0).max(1).default(1.0)
})

const updateProductSchema = createProductSchema.partial()

/**
 * GET /api/products
 * 
 * List all products with advanced filtering, sorting, and pagination.
 * 
 * @param {NextRequest} request - The HTTP request object
 * @returns {Promise<NextResponse>} JSON response with paginated product list
 * 
 * @example
 * // Request
 * GET /api/products?page=1&pageSize=20&search=IQ8&manufacturer=Enphase
 * 
 * // Response (200 OK)
 * {
 *   "items": [
 *     {
 *       "id": "1",
 *       "name": "IQ8 Microinverter",
 *       "series": "IQ8",
 *       "model": "IQ8A-3-72-208-240-277",
 *       "manufacturerId": "1",
 *       "acPower": 345,
 *       "efficiency": 97.0,
 *       "warranty": 25,
 *       "status": "ACTIVE",
 *       "manufacturer": { "id": "1", "name": "Enphase Energy" },
 *       "countries": ["United States", "Canada"]
 *     }
 *   ],
 *   "total": 45,
 *   "page": 1,
 *   "pageSize": 20,
 *   "totalPages": 3,
 *   "hasNext": true,
 *   "hasPrev": false
 * }
 * 
 * @query {number} [page=1] - Page number (1-indexed)
 * @query {number} [pageSize=20] - Items per page (max 100)
 * @query {string} [search] - Search query (name, series, model, manufacturer)
 * @query {string} [manufacturerId] - Filter by manufacturer ID
 * @query {string} [manufacturer] - Filter by manufacturer name
 * @query {string} [status] - Filter by status (ACTIVE, DISCONTINUED, ANNOUNCED, COMING_SOON)
 * @query {number} [minPower] - Minimum AC power in watts
 * @query {number} [maxPower] - Maximum AC power in watts
 * @query {number} [minEfficiency] - Minimum efficiency percentage
 * @query {number} [maxEfficiency] - Maximum efficiency percentage
 * @query {string} [country] - Filter by availability country
 * @query {string} [sortBy=name] - Sort field (name, acPower, efficiency, warranty)
 * @query {string} [sortOrder=asc] - Sort order (asc, desc)
 * 
 * @throws {400} Bad Request - Invalid query parameters
 * @throws {500} Internal Server Error - Database or server error
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'))
    const pageSize = Math.min(100, Math.max(1, parseInt(searchParams.get('pageSize') || '20')))
    const search = searchParams.get('search') || ''
    const manufacturerId = searchParams.get('manufacturerId')
    const manufacturer = searchParams.get('manufacturer')
    const productStatus = searchParams.get('status')
    const minPower = searchParams.get('minPower')
    const maxPower = searchParams.get('maxPower')
    const minEfficiency = searchParams.get('minEfficiency')
    const maxEfficiency = searchParams.get('maxEfficiency')
    const country = searchParams.get('country')
    const sortBy = searchParams.get('sortBy') || 'name'
    const sortOrder = searchParams.get('sortOrder') || 'asc'

    // Apply filters to mock data
    let filteredProducts = mockProducts
    
    if (search) {
      const searchLower = search.toLowerCase()
      filteredProducts = filteredProducts.filter(p => 
        p.name.toLowerCase().includes(searchLower) ||
        (p.series && p.series.toLowerCase().includes(searchLower)) ||
        (p.model && p.model.toLowerCase().includes(searchLower)) ||
        p.manufacturer.name.toLowerCase().includes(searchLower)
      )
    }

    if (manufacturerId) {
      filteredProducts = filteredProducts.filter(p => p.manufacturerId === manufacturerId)
    }

    if (manufacturer) {
      filteredProducts = filteredProducts.filter(p => 
        p.manufacturer.name.toLowerCase().includes(manufacturer.toLowerCase())
      )
    }

    if (productStatus) {
      filteredProducts = filteredProducts.filter(p => p.status === productStatus)
    }

    if (minPower || maxPower) {
      filteredProducts = filteredProducts.filter(p => {
        const power = p.acPower || 0
        if (minPower && power < parseFloat(minPower)) return false
        if (maxPower && power > parseFloat(maxPower)) return false
        return true
      })
    }

    if (minEfficiency || maxEfficiency) {
      filteredProducts = filteredProducts.filter(p => {
        const efficiency = p.efficiency || 0
        if (minEfficiency && efficiency < parseFloat(minEfficiency)) return false
        if (maxEfficiency && efficiency > parseFloat(maxEfficiency)) return false
        return true
      })
    }

    if (country) {
      filteredProducts = filteredProducts.filter(p => 
        p.countries.some(c => c.toLowerCase().includes(country.toLowerCase()))
      )
    }

    // Apply sorting to mock data
    filteredProducts.sort((a, b) => {
      let aValue: any = a[sortBy as keyof typeof a] || ''
      let bValue: any = b[sortBy as keyof typeof b] || ''
      
      if (sortBy === 'manufacturer') {
        aValue = a.manufacturer.name
        bValue = b.manufacturer.name
      }
      
      if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase()
        bValue = bValue.toLowerCase()
      }
      
      return sortOrder === 'desc' 
        ? aValue > bValue ? -1 : aValue < bValue ? 1 : 0
        : aValue < bValue ? -1 : aValue > bValue ? 1 : 0
    })

    // Apply pagination to mock data
    const total = filteredProducts.length
    const startIndex = (page - 1) * pageSize
    const endIndex = startIndex + pageSize
    const paginatedProducts = filteredProducts.slice(startIndex, endIndex)

    return NextResponse.json({
      items: paginatedProducts,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
      hasNext: page * pageSize < total,
      hasPrev: page > 1
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch products' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/products
 * 
 * Create a new product with specifications and metadata.
 * 
 * @param {NextRequest} request - The HTTP request object containing product data
 * @returns {Promise<NextResponse>} JSON response with created product (201 Created)
 * 
 * @example
 * // Request
 * POST /api/products
 * Content-Type: application/json
 * 
 * {
 *   "name": "IQ8P Microinverter",
 *   "series": "IQ8",
 *   "model": "IQ8P-72-2-INT",
 *   "manufacturerId": "1",
 *   "acPower": 345,
 *   "maxModuleSize": 370,
 *   "voltage": 240,
 *   "mppt": 1,
 *   "efficiency": 97.0,
 *   "warranty": 25,
 *   "weight": 3.1,
 *   "dimensions": "15.7 x 8.5 x 1.5 inches",
 *   "monitoringPlatform": "Enphase Enlighten",
 *   "status": "ACTIVE",
 *   "datasheetUrl": "https://...",
 *   "productUrl": "https://..."
 * }
 * 
 * // Response (201 Created)
 * {
 *   "id": "new-id",
 *   "name": "IQ8P Microinverter",
 *   "manufacturerId": "1",
 *   "status": "ACTIVE",
 *   "createdAt": "2026-10-15T10:30:00Z"
 * }
 * 
 * @body {string} name - Product name (required, 1-200 chars)
 * @body {string} [series] - Product series (max 50 chars)
 * @body {string} [model] - Model number (max 100 chars)
 * @body {string} manufacturerId - Manufacturer ID (required)
 * @body {number} [acPower] - AC power output in watts
 * @body {number} [maxModuleSize] - Maximum module size in watts
 * @body {number} [voltage] - Operating voltage
 * @body {number} [mppt] - MPPT tracker count
 * @body {number} [efficiency] - Peak efficiency percentage (0-100)
 * @body {number} [warranty] - Warranty in years
 * @body {number} [weight] - Weight in kg
 * @body {string} [dimensions] - Physical dimensions
 * @body {string} [monitoringPlatform] - Monitoring platform name
 * @body {string} [status=ACTIVE] - Product status
 * @body {string} [imageUrl] - Product image URL
 * @body {string} [datasheetUrl] - Datasheet PDF URL
 * @body {string} [productUrl] - Product page URL
 * @body {string} [aiSummary] - AI-generated summary (max 1000 chars)
 * @body {number} [confidenceScore=1.0] - Data confidence score (0-1)
 * 
 * @throws {400} Bad Request - Validation failed
 * @throws {404} Not Found - Manufacturer not found
 * @throws {500} Internal Server Error - Server error
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate input
    const validatedData = createProductSchema.parse(body)

    // Find manufacturer
    const manufacturer = mockManufacturers.find(m => m.id === validatedData.manufacturerId)
    if (!manufacturer) {
      return NextResponse.json(
        { error: 'Manufacturer not found' },
        { status: 404 }
      )
    }

    // Create mock product
    const newProduct = {
      id: Date.now().toString(),
      ...validatedData,
      manufacturer,
      countries: ['United States', 'Canada'], // Default countries
      availability: 'IN_STOCK' as const,
      price: null,
      status: 'ACTIVE'
    }

    return NextResponse.json(newProduct, { status: 201 })
  } catch (error) {
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.issues },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { error: 'Failed to create product' },
      { status: 500 }
    )
  }
}
