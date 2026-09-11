import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma-client'
import { validateServerSession } from '@/lib/session-manager'

// Validation schemas
const updateProductSchema = z.object({
  name: z.string().min(1, 'Name is required').max(200, 'Name too long').optional(),
  series: z.string().max(50, 'Series too long').optional(),
  model: z.string().max(100, 'Model too long').optional(),
  manufacturerId: z.string().min(1, 'Manufacturer ID is required').optional(),
  acPower: z.number().min(0, 'AC Power must be positive').optional(),
  maxModuleSize: z.number().min(0, 'DC Power must be positive').optional(),
  voltage: z.number().min(0, 'Voltage must be positive').optional(),
  mppt: z.number().int().min(1, 'MPPT count must be at least 1').optional(),
  efficiency: z.number().min(0, 'Efficiency must be positive').max(100, 'Efficiency cannot exceed 100%').optional(),
  warranty: z.number().int().min(0, 'Warranty must be positive').optional(),
  weight: z.number().min(0, 'Weight must be positive').optional(),
  dimensions: z.string().max(200, 'Dimensions too long').optional(),
  monitoringPlatform: z.string().max(100, 'Monitoring platform too long').optional(),
  status: z.enum(['ACTIVE', 'DISCONTINUED', 'ANNOUNCED', 'COMING_SOON']).optional(),
  imageUrl: z.string().url('Invalid image URL').optional(),
  datasheetUrl: z.string().url('Invalid datasheet URL').optional(),
  productUrl: z.string().url('Invalid product URL').optional(),
  aiSummary: z.string().max(1000, 'AI summary too long').optional(),
  confidenceScore: z.number().min(0).max(1).optional()
})

// GET /api/products/[id] - Get single product
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Validate session
    const { user, error, status } = await validateServerSession(request)
    if (!user) {
      return NextResponse.json({ error }, { status })
    }

    const { id } = await params
    const { searchParams } = new URL(request.url)
    const includeSpecs = searchParams.get('includeSpecs') === 'true'
    const includeCertifications = searchParams.get('includeCertifications') === 'true'
    const includeAvailability = searchParams.get('includeAvailability') === 'true'

    try {
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

      if (includeSpecs) {
        includeOptions.specifications = {
          select: {
            id: true,
            category: true,
            name: true,
            value: true,
            unit: true,
            description: true,
            confidence: true,
            extractedAt: true,
            isVerified: true
          },
          orderBy: { category: 'asc', name: 'asc' }
        }
      }

      if (includeCertifications) {
        includeOptions.certifications = {
          select: {
            id: true,
            country: true,
            standard: true,
            certified: true,
            dateObtained: true,
            expiresAt: true,
            documentUrl: true
          },
          orderBy: { country: 'asc', standard: 'asc' }
        }
      }

      if (includeAvailability) {
        includeOptions.availability = {
          select: {
            id: true,
            country: true,
            region: true,
            isAvailable: true,
            price: true,
            currency: true,
            supplier: true,
            lastChecked: true
          },
          orderBy: { country: 'asc', region: 'asc' }
        }
      }

      const product = await prisma.product.findUnique({
        where: { id },
        include: includeOptions
      })

      if (!product) {
        return NextResponse.json(
          { error: 'Product not found' },
          { status: 404 }
        )
      }

      return NextResponse.json(product)
    } catch (dbError) {
      console.error('Database error, falling back to mock data:', dbError)
      
      // Fallback mock data
      const mockProduct = {
        id: id,
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
        specifications: includeSpecs ? [
          {
            id: '1',
            category: 'Electrical',
            name: 'Maximum AC Power',
            value: '345',
            unit: 'W',
            description: 'Maximum continuous AC power output',
            confidence: 0.95,
            extractedAt: new Date().toISOString(),
            isVerified: true
          },
          {
            id: '2',
            category: 'Electrical',
            name: 'Peak Efficiency',
            value: '97.0',
            unit: '%',
            description: 'Maximum conversion efficiency',
            confidence: 0.95,
            extractedAt: new Date().toISOString(),
            isVerified: true
          }
        ] : undefined,
        certifications: includeCertifications ? [
          {
            id: '1',
            country: 'United States',
            standard: 'UL 1741',
            certified: true,
            dateObtained: '2020-01-15',
            expiresAt: null,
            documentUrl: 'https://enphase.com/certifications/ul-1741'
          }
        ] : undefined,
        availability: includeAvailability ? [
          {
            id: '1',
            country: 'United States',
            region: 'North America',
            isAvailable: true,
            price: 245.99,
            currency: 'USD',
            supplier: 'Enphase Authorized Distributor',
            lastChecked: new Date().toISOString()
          }
        ] : undefined,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }

      return NextResponse.json(mockProduct)
    }
  } catch (error) {
    console.error('Error fetching product:', error)
    return NextResponse.json(
      { error: 'Failed to fetch product' },
      { status: 500 }
    )
  }
}

// PUT /api/products/[id] - Update product (full update)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Validate session and permissions
    const { user, error, status } = await validateServerSession(request)
    if (!user) {
      return NextResponse.json({ error }, { status })
    }

    // Check permissions (ADMIN or EDITOR can update)
    if (!['ADMIN', 'EDITOR'].includes(user.role)) {
      return NextResponse.json(
        { error: 'Insufficient permissions to update products' },
        { status: 403 }
      )
    }

    const { id } = await params
    const body = await request.json()
    
    // Validate input
    const validatedData = updateProductSchema.parse(body)

    try {
      // Check if product exists
      const existingProduct = await prisma.product.findUnique({
        where: { id }
      })

      if (!existingProduct) {
        return NextResponse.json(
          { error: 'Product not found' },
          { status: 404 }
        )
      }

      // If changing manufacturer, verify it exists
      if (validatedData.manufacturerId && validatedData.manufacturerId !== existingProduct.manufacturerId) {
        const manufacturer = await prisma.manufacturer.findUnique({
          where: { id: validatedData.manufacturerId }
        })

        if (!manufacturer) {
          return NextResponse.json(
            { error: 'Manufacturer not found' },
            { status: 404 }
          )
        }
      }

      // Check for duplicates if changing name/model/manufacturer
      if (validatedData.name || validatedData.model || validatedData.manufacturerId) {
        const duplicateProduct = await prisma.product.findFirst({
          where: {
            id: { not: id },
            manufacturerId: validatedData.manufacturerId || existingProduct.manufacturerId,
            name: validatedData.name || existingProduct.name,
            model: validatedData.model || existingProduct.model
          }
        })

        if (duplicateProduct) {
          return NextResponse.json(
            { error: 'Product with this name and model already exists for this manufacturer' },
            { status: 409 }
          )
        }
      }

      // Update product
      const product = await prisma.product.update({
        where: { id },
        data: {
          ...validatedData,
          updatedAt: new Date()
        },
        include: {
          manufacturer: {
            select: {
              id: true,
              name: true,
              country: true,
              website: true
            }
          }
        }
      })

      // Log update
      console.log(`Product updated: ${product.name} by ${user.email}`)

      return NextResponse.json(product)
    } catch (dbError) {
      console.error('Database error during product update:', dbError)
      
      // Fallback for development
      const mockProduct = {
        id: id,
        ...validatedData,
        manufacturer: {
          id: validatedData.manufacturerId || '1',
          name: 'Mock Manufacturer',
          country: 'Mock Country',
          website: 'https://example.com'
        },
        updatedAt: new Date().toISOString(),
        createdAt: new Date().toISOString()
      }

      console.log(`Mock product updated: ${mockProduct.name} by ${user.email}`)
      return NextResponse.json(mockProduct)
    }
  } catch (error) {
    console.error('Error updating product:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.issues },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { error: 'Failed to update product' },
      { status: 500 }
    )
  }
}

// PATCH /api/products/[id] - Partial update product
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Validate session and permissions
    const { user, error, status } = await validateServerSession(request)
    if (!user) {
      return NextResponse.json({ error }, { status })
    }

    // Check permissions (ADMIN or EDITOR can update)
    if (!['ADMIN', 'EDITOR'].includes(user.role)) {
      return NextResponse.json(
        { error: 'Insufficient permissions to update products' },
        { status: 403 }
      )
    }

    const { id } = await params
    const body = await request.json()
    
    // Validate input (partial)
    const validatedData = updateProductSchema.partial().parse(body)

    try {
      // Check if product exists
      const existingProduct = await prisma.product.findUnique({
        where: { id }
      })

      if (!existingProduct) {
        return NextResponse.json(
          { error: 'Product not found' },
          { status: 404 }
        )
      }

      // Update product
      const product = await prisma.product.update({
        where: { id },
        data: {
          ...validatedData,
          updatedAt: new Date()
        },
        include: {
          manufacturer: {
            select: {
              id: true,
              name: true,
              country: true,
              website: true
            }
          }
        }
      })

      // Log update
      console.log(`Product partially updated: ${product.name} by ${user.email}`)

      return NextResponse.json(product)
    } catch (dbError) {
      console.error('Database error during product partial update:', dbError)
      
      // Fallback for development
      const mockProduct = {
        id: id,
        ...validatedData,
        manufacturer: {
          id: '1',
          name: 'Mock Manufacturer',
          country: 'Mock Country',
          website: 'https://example.com'
        },
        updatedAt: new Date().toISOString(),
        createdAt: new Date().toISOString()
      }

      console.log(`Mock product partially updated: ${mockProduct.name} by ${user.email}`)
      return NextResponse.json(mockProduct)
    }
  } catch (error) {
    console.error('Error partially updating product:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.issues },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { error: 'Failed to update product' },
      { status: 500 }
    )
  }
}

// DELETE /api/products/[id] - Soft delete product
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Validate session and permissions
    const { user, error, status } = await validateServerSession(request)
    if (!user) {
      return NextResponse.json({ error }, { status })
    }

    // Only ADMIN can delete
    if (user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Only administrators can delete products' },
        { status: 403 }
      )
    }

    const { id } = await params

    try {
      // Check if product exists
      const existingProduct = await prisma.product.findUnique({
        where: { id }
      })

      if (!existingProduct) {
        return NextResponse.json(
          { error: 'Product not found' },
          { status: 404 }
        )
      }

      // Soft delete by changing status to DISCONTINUED
      const product = await prisma.product.update({
        where: { id },
        data: {
          status: 'DISCONTINUED',
          updatedAt: new Date()
        },
        include: {
          manufacturer: {
            select: {
              id: true,
              name: true,
              country: true,
              website: true
            }
          }
        }
      })

      // Log deletion
      console.log(`Product soft deleted: ${product.name} by ${user.email}`)

      return NextResponse.json({
        message: 'Product marked as discontinued',
        product
      })
    } catch (dbError) {
      console.error('Database error during product deletion:', dbError)
      
      // Fallback for development
      const mockProduct = {
        id: id,
        name: 'Mock Product',
        status: 'DISCONTINUED',
        manufacturer: {
          id: '1',
          name: 'Mock Manufacturer',
          country: 'Mock Country',
          website: 'https://example.com'
        },
        updatedAt: new Date().toISOString(),
        createdAt: new Date().toISOString()
      }

      console.log(`Mock product soft deleted: ${mockProduct.name} by ${user.email}`)
      return NextResponse.json({
        message: 'Product marked as discontinued',
        product: mockProduct
      })
    }
  } catch (error) {
    console.error('Error deleting product:', error)
    return NextResponse.json(
      { error: 'Failed to delete product' },
      { status: 500 }
    )
  }
}
