# API Documentation

Complete reference for all 26 API routes in the Microinverter Intelligence Platform.

## Base URL

```
Development: http://localhost:3000/api
Production: https://microinverterintelplatform-git-main-mbu1.vercel.app/api
```

## Authentication

All API endpoints (except auth routes) require a valid session. Use NextAuth.js credentials:

```bash
# Demo credentials
Username: Enphase
Password: (any value)
```

### Session Header
```
Authorization: Bearer <session_token>
```

## Error Responses

All endpoints return consistent error responses:

```json
{
  "error": "Error message",
  "status": 400,
  "details": {}
}
```

### Common Status Codes
- `200`: Success
- `201`: Created
- `400`: Bad Request (validation error)
- `401`: Unauthorized (missing session)
- `403`: Forbidden (insufficient permissions)
- `404`: Not Found
- `409`: Conflict (duplicate resource)
- `500`: Internal Server Error

---

## Products API

### 1. GET /api/products
List all products with advanced filtering and pagination.

**Query Parameters:**
```
page: number (default: 1)
pageSize: number (default: 20, max: 100)
search: string (searches name, series, model, manufacturer)
manufacturerId: string (filter by manufacturer ID)
manufacturer: string (filter by manufacturer name)
status: enum (ACTIVE, DISCONTINUED, ANNOUNCED, COMING_SOON)
minPower: number (minimum AC power in watts)
maxPower: number (maximum AC power in watts)
minEfficiency: number (minimum efficiency percentage)
maxEfficiency: number (maximum efficiency percentage)
country: string (filter by availability country)
sortBy: string (default: name)
sortOrder: enum (asc, desc)
```

**Response:**
```json
{
  "items": [
    {
      "id": "1",
      "name": "IQ8 Microinverter",
      "series": "IQ8",
      "model": "IQ8A-3-72-208-240-277",
      "manufacturerId": "1",
      "acPower": 345,
      "maxModuleSize": 370,
      "voltage": 240,
      "mppt": 1,
      "efficiency": 97.0,
      "warranty": 25,
      "weight": 3.1,
      "dimensions": "15.7 x 8.5 x 1.5 inches",
      "monitoringPlatform": "Enphase Enlighten",
      "status": "ACTIVE",
      "imageUrl": "https://...",
      "datasheetUrl": "https://...",
      "productUrl": "https://...",
      "manufacturer": {
        "id": "1",
        "name": "Enphase Energy",
        "country": "United States"
      },
      "countries": ["United States", "Canada"],
      "availability": "IN_STOCK",
      "price": null,
      "launchDate": "2024-01-15",
      "updatedAt": "2026-10-15T10:30:00Z"
    }
  ],
  "total": 167,
  "page": 1,
  "pageSize": 20,
  "totalPages": 9,
  "hasNext": true,
  "hasPrev": false
}
```

**Error Codes:**
- `400`: Invalid query parameters
- `401`: Unauthorized
- `500`: Server error

---

### 2. POST /api/products
Create a new product (mock implementation).

**Request Body:**
```json
{
  "name": "New Product",
  "series": "Series Name",
  "model": "Model-123",
  "manufacturerId": "1",
  "acPower": 300,
  "maxModuleSize": 350,
  "voltage": 240,
  "mppt": 1,
  "efficiency": 97.0,
  "warranty": 25,
  "weight": 3.0,
  "dimensions": "15 x 8 x 1.5 inches",
  "monitoringPlatform": "Platform Name",
  "status": "ACTIVE",
  "imageUrl": "https://...",
  "datasheetUrl": "https://...",
  "productUrl": "https://...",
  "aiSummary": "Product summary",
  "confidenceScore": 0.95
}
```

**Response (201 Created):**
```json
{
  "id": "new-id",
  "name": "New Product",
  "manufacturerId": "1",
  "status": "ACTIVE",
  "createdAt": "2026-10-15T10:30:00Z"
}
```

**Error Codes:**
- `400`: Validation failed
- `401`: Unauthorized
- `403`: Insufficient permissions
- `404`: Manufacturer not found
- `500`: Server error

---

### 3. GET /api/products/[id]
Get a specific product by ID.

**Response:**
```json
{
  "id": "1",
  "name": "IQ8 Microinverter",
  "series": "IQ8",
  "model": "IQ8A-3-72-208-240-277",
  "manufacturerId": "1",
  "acPower": 345,
  "efficiency": 97.0,
  "warranty": 25,
  "status": "ACTIVE",
  "manufacturer": {
    "id": "1",
    "name": "Enphase Energy"
  },
  "specifications": [
    {
      "category": "Electrical",
      "name": "Maximum AC Power",
      "value": "345",
      "unit": "W"
    }
  ],
  "certifications": [
    {
      "country": "United States",
      "standard": "UL 1741",
      "certified": true
    }
  ]
}
```

**Error Codes:**
- `401`: Unauthorized
- `404`: Product not found
- `500`: Server error

---

## Search API

### 4. GET /api/search
Full-text search with relevance scoring and advanced filtering.

**Query Parameters:**
```
q: string (required, search query)
page: number (default: 1)
pageSize: number (default: 20, max: 100)
manufacturers: string[] (comma-separated manufacturer names)
countries: string[] (comma-separated country names)
minPower: number (minimum AC power)
maxPower: number (maximum AC power)
minEfficiency: number (minimum efficiency %)
maxEfficiency: number (maximum efficiency %)
minWarranty: number (minimum warranty years)
maxWarranty: number (maximum warranty years)
certifications: string[] (comma-separated certification standards)
status: enum[] (ACTIVE, DISCONTINUED, ANNOUNCED, COMING_SOON)
sortBy: enum (relevance, name, acPower, efficiency, warranty, createdAt)
sortOrder: enum (asc, desc)
includeSpecs: boolean (include detailed specifications)
includeCertifications: boolean (include certification details)
suggestions: boolean (get search suggestions instead of results)
```

**Response:**
```json
{
  "items": [
    {
      "id": "1",
      "name": "IQ8 Microinverter",
      "series": "IQ8",
      "model": "IQ8A-3-72-208-240-277",
      "acPower": 345,
      "efficiency": 97.0,
      "warranty": 25,
      "manufacturer": {
        "id": "1",
        "name": "Enphase Energy",
        "country": "United States"
      },
      "relevance": 95,
      "specifications": [],
      "certifications": []
    }
  ],
  "total": 45,
  "page": 1,
  "pageSize": 20,
  "totalPages": 3,
  "hasNext": true,
  "hasPrev": false
}
```

**Error Codes:**
- `400`: Invalid search parameters
- `401`: Unauthorized
- `500`: Server error

---

### 5. GET /api/search/semantic
Semantic search using embeddings (requires OPENAI_API_KEY).

**Query Parameters:**
```
q: string (required, natural language query)
page: number (default: 1)
pageSize: number (default: 20)
threshold: number (similarity threshold, 0-1, default: 0.7)
```

**Response:**
```json
{
  "items": [
    {
      "id": "1",
      "name": "IQ8 Microinverter",
      "similarity": 0.92,
      "manufacturer": { "name": "Enphase Energy" }
    }
  ],
  "total": 12,
  "page": 1,
  "pageSize": 20
}
```

**Error Codes:**
- `400`: Invalid query
- `401`: Unauthorized
- `500`: Embedding service error

---

## Dashboard API

### 6. GET /api/dashboard
Get comprehensive dashboard metrics and KPIs.

**Response:**
```json
{
  "totalProducts": 167,
  "totalManufacturers": 21,
  "recentUpdates": 8,
  "activeJobs": 2,
  "recentLaunches": 5,
  "recentlyUpdated": [
    {
      "id": "1",
      "name": "IQ8 Microinverter",
      "manufacturer": { "name": "Enphase Energy" },
      "status": "ACTIVE",
      "updatedAt": "2026-10-15T10:30:00Z"
    }
  ],
  "recentlyLaunched": [
    {
      "id": "4",
      "name": "IQ8P Microinverter",
      "manufacturer": { "name": "Enphase Energy" },
      "launchDate": "2026-10-15T00:00:00Z",
      "status": "ACTIVE"
    }
  ],
  "manufacturerDistribution": [
    {
      "name": "Enphase Energy",
      "count": 16,
      "percentage": 9.6
    }
  ],
  "countryDistribution": [
    {
      "country": "United States",
      "count": 167,
      "percentage": 100
    }
  ],
  "powerClassDistribution": [
    {
      "powerClass": "< 500W",
      "count": 89,
      "percentage": 53.3
    }
  ],
  "warrantyDistribution": [
    {
      "warrantyYears": "25 years",
      "count": 98,
      "percentage": 58.7
    }
  ],
  "platformStatus": [
    {
      "label": "Database",
      "status": "operational",
      "value": "Connected",
      "lastChecked": "2026-10-15T10:30:00Z"
    }
  ]
}
```

**Error Codes:**
- `401`: Unauthorized
- `403`: Insufficient permissions (requires read:analytics)
- `500`: Server error

---

### 7. POST /api/dashboard
Refresh dashboard metrics (requires manage:system permission).

**Response:**
```json
{
  "message": "Dashboard metrics refresh initiated"
}
```

**Error Codes:**
- `401`: Unauthorized
- `403`: Insufficient permissions
- `500`: Server error

---

### 8. GET /api/dashboard/kpi
Get specific KPI metrics.

**Query Parameters:**
```
metric: enum (products, manufacturers, updates, launches)
period: enum (day, week, month, year)
```

**Response:**
```json
{
  "metric": "products",
  "value": 167,
  "change": 5,
  "changePercent": 3.1,
  "period": "month"
}
```

---

### 9. GET /api/dashboard/analytics
Get detailed analytics data for charts.

**Response:**
```json
{
  "trends": [
    {
      "date": "2026-10-01",
      "products": 162,
      "updates": 3
    }
  ],
  "topManufacturers": [
    {
      "name": "Enphase Energy",
      "count": 16
    }
  ]
}
```

---

## Manufacturers API

### 10. GET /api/manufacturers
List all manufacturers with filtering and pagination.

**Query Parameters:**
```
page: number (default: 1)
pageSize: number (default: 10, max: 100)
search: string (searches name, description, country)
isActive: boolean (filter by active status)
country: string (filter by country)
sortBy: string (default: name)
sortOrder: enum (asc, desc)
```

**Response:**
```json
{
  "items": [
    {
      "id": "1",
      "name": "Enphase Energy",
      "website": "https://enphase.com",
      "logoUrl": "https://...",
      "description": "Leading microinverter manufacturer",
      "country": "United States",
      "isActive": true,
      "productCount": 16,
      "createdAt": "2024-01-01T00:00:00Z"
    }
  ],
  "total": 21,
  "page": 1,
  "pageSize": 10,
  "totalPages": 3,
  "hasNext": true,
  "hasPrev": false
}
```

---

### 11. POST /api/manufacturers
Create a new manufacturer.

**Request Body:**
```json
{
  "name": "New Manufacturer",
  "website": "https://example.com",
  "logoUrl": "https://...",
  "description": "Description",
  "country": "United States",
  "isActive": true
}
```

**Response (201 Created):**
```json
{
  "id": "new-id",
  "name": "New Manufacturer",
  "country": "United States",
  "isActive": true
}
```

---

### 12. GET /api/manufacturers/[id]
Get a specific manufacturer with products.

**Response:**
```json
{
  "id": "1",
  "name": "Enphase Energy",
  "website": "https://enphase.com",
  "description": "Leading microinverter manufacturer",
  "country": "United States",
  "isActive": true,
  "productCount": 16,
  "products": [
    {
      "id": "1",
      "name": "IQ8 Microinverter",
      "status": "ACTIVE"
    }
  ]
}
```

---

## Authentication API

### 13. POST /api/auth/login
Login with credentials (NextAuth.js).

**Request Body:**
```json
{
  "username": "Enphase",
  "password": "any-password",
  "callbackUrl": "/dashboard"
}
```

**Response:**
```json
{
  "ok": true,
  "status": 200,
  "error": null,
  "url": "/dashboard"
}
```

---

### 14. POST /api/auth/register
Register a new user (if enabled).

**Request Body:**
```json
{
  "username": "newuser",
  "email": "user@example.com",
  "password": "secure-password"
}
```

**Response:**
```json
{
  "id": "user-id",
  "username": "newuser",
  "email": "user@example.com"
}
```

---

### 15. POST /api/auth/verify
Verify user session.

**Response:**
```json
{
  "valid": true,
  "user": {
    "id": "user-id",
    "name": "Enphase",
    "email": "admin@enphase.com",
    "role": "ADMIN"
  }
}
```

---

### 16. GET /api/auth/[...nextauth]
NextAuth.js dynamic route handler (signin, callback, signout).

---

## AI Pipeline API

### 17. POST /api/ai/extract
Extract structured data from text using Claude.

**Request Body:**
```json
{
  "text": "Product specification text",
  "schema": {
    "type": "object",
    "properties": {
      "power": { "type": "number" },
      "efficiency": { "type": "number" }
    }
  }
}
```

**Response:**
```json
{
  "data": {
    "power": 345,
    "efficiency": 97.0
  },
  "confidence": 0.95
}
```

---

### 18. POST /api/ai/extract-web
Extract data from a web URL.

**Request Body:**
```json
{
  "url": "https://enphase.com/products/iq8",
  "schema": { "type": "object" }
}
```

**Response:**
```json
{
  "data": { "name": "IQ8 Microinverter" },
  "confidence": 0.92
}
```

---

### 19. POST /api/ai/insights
Generate AI insights about products.

**Request Body:**
```json
{
  "productIds": ["1", "2", "3"],
  "analysisType": "comparison"
}
```

**Response:**
```json
{
  "insights": "Comparative analysis of the three products...",
  "confidence": 0.88
}
```

---

### 20. POST /api/ai/generate-embeddings
Generate embeddings for semantic search.

**Request Body:**
```json
{
  "texts": ["IQ8 Microinverter", "HD-Wave Inverter"],
  "model": "text-embedding-3-small"
}
```

**Response:**
```json
{
  "embeddings": [
    [0.1, 0.2, 0.3, ...],
    [0.2, 0.3, 0.4, ...]
  ]
}
```

---

## Crawling API

### 21. POST /api/crawl/start
Start a new web crawl job.

**Request Body:**
```json
{
  "url": "https://enphase.com",
  "depth": 2,
  "languages": ["en", "de", "fr"],
  "extractSchema": { "type": "object" }
}
```

**Response:**
```json
{
  "jobId": "job-123",
  "status": "QUEUED",
  "createdAt": "2026-10-15T10:30:00Z"
}
```

---

### 22. GET /api/crawl/status/[jobId]
Get crawl job status.

**Response:**
```json
{
  "jobId": "job-123",
  "status": "RUNNING",
  "progress": 45,
  "pagesProcessed": 23,
  "totalPages": 50,
  "startedAt": "2026-10-15T10:30:00Z",
  "estimatedCompletion": "2026-10-15T11:00:00Z"
}
```

---

### 23. GET /api/crawl/list
List all crawl jobs.

**Query Parameters:**
```
status: enum (QUEUED, RUNNING, COMPLETED, FAILED)
limit: number (default: 20)
offset: number (default: 0)
```

**Response:**
```json
{
  "jobs": [
    {
      "jobId": "job-123",
      "status": "COMPLETED",
      "pagesProcessed": 50,
      "completedAt": "2026-10-15T11:00:00Z"
    }
  ],
  "total": 45
}
```

---

### 24. GET /api/crawl-jobs
List crawl jobs (alternative endpoint).

**Response:**
```json
{
  "items": [
    {
      "id": "job-123",
      "url": "https://enphase.com",
      "status": "COMPLETED",
      "createdAt": "2026-10-15T10:30:00Z"
    }
  ],
  "total": 45
}
```

---

### 25. GET /api/crawl-jobs/[id]
Get specific crawl job details.

**Response:**
```json
{
  "id": "job-123",
  "url": "https://enphase.com",
  "status": "COMPLETED",
  "results": [
    {
      "url": "https://enphase.com/products/iq8",
      "data": { "name": "IQ8 Microinverter" }
    }
  ]
}
```

---

## PDF Processing API

### 26. POST /api/pdf/process
Process and extract data from PDF datasheets.

**Request Body:**
```json
{
  "url": "https://enphase.com/datasheets/iq8.pdf",
  "extractSchema": {
    "type": "object",
    "properties": {
      "power": { "type": "number" },
      "efficiency": { "type": "number" }
    }
  }
}
```

**Response:**
```json
{
  "filename": "iq8.pdf",
  "pages": 8,
  "data": {
    "power": 345,
    "efficiency": 97.0
  },
  "confidence": 0.94,
  "extractedAt": "2026-10-15T10:30:00Z"
}
```

---

## Additional Endpoints

### Market Search
- `GET /api/market-search` - Search regional markets and availability

### Datasheet Upload
- `POST /api/datasheets/upload` - Upload and process datasheet files

### Change Detection
- `POST /api/changes/detect` - Detect product changes and generate events

---

## Rate Limiting

Currently no rate limiting is enforced. Future versions will implement:
- 100 requests per minute for authenticated users
- 10 requests per minute for unauthenticated users
- 1000 requests per day for API keys

---

## Pagination

All list endpoints support pagination with consistent parameters:

```
page: number (1-indexed, default: 1)
pageSize: number (default: 20, max: 100)
```

Response includes:
```json
{
  "items": [],
  "total": 167,
  "page": 1,
  "pageSize": 20,
  "totalPages": 9,
  "hasNext": true,
  "hasPrev": false
}
```

---

## Filtering

Common filter patterns:

**Text Search:**
```
?search=IQ8
```

**Multiple Values:**
```
?manufacturers=Enphase,SolarEdge&countries=US,DE
```

**Range Filters:**
```
?minPower=100&maxPower=500&minEfficiency=95&maxEfficiency=99
```

**Status Filters:**
```
?status=ACTIVE,ANNOUNCED
```

---

## Response Headers

All responses include:

```
Content-Type: application/json
X-Request-ID: unique-request-id
X-Response-Time: milliseconds
```

---

## Webhooks (Future)

Planned webhook events:
- `product.created` - New product added
- `product.updated` - Product specifications changed
- `product.discontinued` - Product discontinued
- `crawl.completed` - Web crawl job finished
- `alert.triggered` - System alert generated

---

## SDK & Client Libraries

### JavaScript/TypeScript
```typescript
import { MicroinverterClient } from '@microinverter/sdk'

const client = new MicroinverterClient({
  baseUrl: 'https://api.example.com',
  apiKey: 'your-api-key'
})

const products = await client.products.list({ page: 1 })
```

---

## Support & Issues

For API issues or questions:
1. Check this documentation
2. Review error response details
3. Check server logs: `npm run dev`
4. Contact: api-support@enphase.com

---

**Last Updated**: October 15, 2026
**API Version**: 1.0.0
**Status**: Stable
