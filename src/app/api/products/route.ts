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

// GET /api/products - List products with advanced filtering and pagination
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
    console.error('Error fetching products:', error)
    return NextResponse.json(
      { error: 'Failed to fetch products' },
      { status: 500 }
    )
  }
}

// POST /api/products - Create new product (mock implementation)
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

    console.log(`Mock product created: ${newProduct.name}`)
    return NextResponse.json(newProduct, { status: 201 })
  } catch (error) {
    console.error('Error creating product:', error)
    
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
