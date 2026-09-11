import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { mockManufacturers, mockProducts } from '@/data/mock-data'

// Validation schemas
const createManufacturerSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name too long'),
  website: z.string().url('Invalid URL').optional(),
  logoUrl: z.string().url('Invalid URL').optional(),
  description: z.string().max(500, 'Description too long').optional(),
  country: z.string().max(100, 'Country name too long').optional(),
  isActive: z.boolean().default(true)
})

const updateManufacturerSchema = createManufacturerSchema.partial()

// GET /api/manufacturers - List manufacturers with filtering and pagination
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'))
    const pageSize = Math.min(100, Math.max(1, parseInt(searchParams.get('pageSize') || '10')))
    const search = searchParams.get('search') || ''
    const isActive = searchParams.get('isActive')
    const country = searchParams.get('country') || ''
    const sortBy = searchParams.get('sortBy') || 'name'
    const sortOrder = searchParams.get('sortOrder') || 'asc'

    // Calculate product counts for each manufacturer
    const manufacturersWithCounts = mockManufacturers.map(manufacturer => ({
      ...manufacturer,
      productCount: mockProducts.filter(p => p.manufacturerId === manufacturer.id && p.status === 'ACTIVE').length
    }))

    // Apply filters to mock data
    let filteredManufacturers = manufacturersWithCounts
    
    if (search) {
      const searchLower = search.toLowerCase()
      filteredManufacturers = filteredManufacturers.filter(m => 
        m.name.toLowerCase().includes(searchLower) ||
        (m.description && m.description.toLowerCase().includes(searchLower)) ||
        (m.country && m.country.toLowerCase().includes(searchLower))
      )
    }

    if (isActive !== null) {
      filteredManufacturers = filteredManufacturers.filter(m => 
        m.isActive === (isActive === 'true')
      )
    }

    if (country) {
      filteredManufacturers = filteredManufacturers.filter(m => 
        m.country && m.country.toLowerCase().includes(country.toLowerCase())
      )
    }

    // Apply sorting to mock data
    filteredManufacturers.sort((a, b) => {
      let aValue: any = a[sortBy as keyof typeof a] || ''
      let bValue: any = b[sortBy as keyof typeof b] || ''
      
      if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase()
        bValue = bValue.toLowerCase()
      }
      
      return sortOrder === 'desc' 
        ? aValue > bValue ? -1 : aValue < bValue ? 1 : 0
        : aValue < bValue ? -1 : aValue > bValue ? 1 : 0
    })

    // Apply pagination to mock data
    const total = filteredManufacturers.length
    const startIndex = (page - 1) * pageSize
    const endIndex = startIndex + pageSize
    const paginatedManufacturers = filteredManufacturers.slice(startIndex, endIndex)

    return NextResponse.json({
      items: paginatedManufacturers,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
      hasNext: page * pageSize < total,
      hasPrev: page > 1
    })
  } catch (error) {
    console.error('Error fetching manufacturers:', error)
    return NextResponse.json(
      { error: 'Failed to fetch manufacturers' },
      { status: 500 }
    )
  }
}

// POST /api/manufacturers - Create new manufacturer (mock implementation)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate input
    const validatedData = createManufacturerSchema.parse(body)

    // Check if manufacturer already exists
    const existingManufacturer = mockManufacturers.find(m => 
      m.name.toLowerCase() === validatedData.name?.toLowerCase()
    )

    if (existingManufacturer) {
      return NextResponse.json(
        { error: 'Manufacturer with this name already exists' },
        { status: 409 }
      )
    }

    // Create mock manufacturer
    const newManufacturer = {
      id: Date.now().toString(),
      ...validatedData,
      productCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    console.log(`Mock manufacturer created: ${newManufacturer.name}`)
    return NextResponse.json(newManufacturer, { status: 201 })
  } catch (error) {
    console.error('Error creating manufacturer:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.issues },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { error: 'Failed to create manufacturer' },
      { status: 500 }
    )
  }
}
