import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

// Validation schemas
const createCrawlJobSchema = z.object({
  manufacturerId: z.string().min(1, 'Manufacturer ID is required'),
  type: z.enum(['FULL_CRAWL', 'INCREMENTAL_CRAWL', 'PRODUCT_UPDATE']).default('FULL_CRAWL'),
  config: z.object({
    scrapeProducts: z.boolean().default(true),
    extractSpecs: z.boolean().default(true),
    updateExisting: z.boolean().default(true),
    forceUpdate: z.boolean().default(false)
  }).optional()
})

// GET /api/crawl-jobs - List crawl jobs
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'))
    const pageSize = Math.min(100, Math.max(1, parseInt(searchParams.get('pageSize') || '20')))
    const manufacturerId = searchParams.get('manufacturerId')
    const jobStatus = searchParams.get('status')
    const type = searchParams.get('type')
    const sortBy = searchParams.get('sortBy') || 'createdAt'
    const sortOrder = searchParams.get('sortOrder') || 'desc'

    // Mock data
    const mockJobs = [
      {
        id: '1',
        manufacturerId: '1',
        userId: '1',
        type: 'FULL_CRAWL',
        status: 'COMPLETED',
        itemsProcessed: 3,
        itemsCreated: 3,
        itemsUpdated: 0,
        startedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        completedAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
        config: {
          scrapeProducts: true,
          extractSpecs: true,
          updateExisting: true,
          forceUpdate: false
        },
        manufacturer: {
          id: '1',
          name: 'Enphase Energy',
          country: 'United States'
        },
        user: {
          id: '1',
          email: 'enphase@demo.com',
          role: 'ADMIN'
        }
      },
      {
        id: '2',
        manufacturerId: '2',
        userId: '1',
        type: 'INCREMENTAL_CRAWL',
        status: 'RUNNING',
        itemsProcessed: 0,
        itemsCreated: 0,
        itemsUpdated: 0,
        startedAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
        completedAt: null,
        createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
        config: {
          scrapeProducts: true,
          extractSpecs: true,
          updateExisting: true,
          forceUpdate: false
        },
        manufacturer: {
          id: '2',
          name: 'SolarEdge Technologies',
          country: 'Israel'
        },
        user: {
          id: '1',
          email: 'enphase@demo.com',
          role: 'ADMIN'
        }
      },
      {
        id: '3',
        manufacturerId: '3',
        userId: '1',
        type: 'PRODUCT_UPDATE',
        status: 'FAILED',
        itemsProcessed: 1,
        itemsCreated: 0,
        itemsUpdated: 0,
        startedAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
        completedAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
        createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
        config: {
          scrapeProducts: true,
          extractSpecs: true,
          updateExisting: true,
          forceUpdate: false
        },
        manufacturer: {
          id: '3',
          name: 'Chint Power Systems',
          country: 'China'
        },
        user: {
          id: '1',
          email: 'enphase@demo.com',
          role: 'ADMIN'
        }
      }
    ]

    // Apply filters to mock data
    let filteredJobs = mockJobs
    
    if (manufacturerId) {
      filteredJobs = filteredJobs.filter(job => job.manufacturerId === manufacturerId)
    }

    if (jobStatus) {
      filteredJobs = filteredJobs.filter(job => job.status === jobStatus)
    }

    if (type) {
      filteredJobs = filteredJobs.filter(job => job.type === type)
    }

    // Apply sorting to mock data
    filteredJobs.sort((a, b) => {
      const aValue = a[sortBy as keyof typeof a] || ''
      const bValue = b[sortBy as keyof typeof b] || ''
      return sortOrder === 'desc' 
        ? bValue.toString().localeCompare(aValue.toString())
        : aValue.toString().localeCompare(bValue.toString())
    })

    // Apply pagination to mock data
    const total = filteredJobs.length
    const startIndex = (page - 1) * pageSize
    const endIndex = startIndex + pageSize
    const paginatedJobs = filteredJobs.slice(startIndex, endIndex)

    return NextResponse.json({
      items: paginatedJobs,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
      hasNext: page * pageSize < total,
      hasPrev: page > 1
    })
  } catch (error) {
    console.error('Error fetching crawl jobs:', error)
    return NextResponse.json(
      { error: 'Failed to fetch crawl jobs' },
      { status: 500 }
    )
  }
}

// POST /api/crawl-jobs - Create new crawl job
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate input
    const validatedData = createCrawlJobSchema.parse(body)

    // Mock job creation
    const mockJob = {
      id: Date.now().toString(),
      manufacturerId: validatedData.manufacturerId,
      userId: '1',
      type: validatedData.type,
      status: 'PENDING',
      itemsProcessed: 0,
      itemsCreated: 0,
      itemsUpdated: 0,
      config: validatedData.config || {
        scrapeProducts: true,
        extractSpecs: true,
        updateExisting: true,
        forceUpdate: false
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      manufacturer: {
        id: validatedData.manufacturerId,
        name: 'Mock Manufacturer',
        country: 'Mock Country'
      },
      user: {
        id: '1',
        email: 'enphase@demo.com',
        role: 'ADMIN'
      }
    }

    console.log(`Mock crawl job created: ${mockJob.id}`)
    return NextResponse.json(mockJob, { status: 201 })
  } catch (error) {
    console.error('Error creating crawl job:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.issues },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { error: 'Failed to create crawl job' },
      { status: 500 }
    )
  }
}

