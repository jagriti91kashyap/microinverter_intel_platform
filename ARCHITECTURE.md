# System Architecture

Comprehensive documentation of the Microinverter Intelligence Platform architecture.

## Table of Contents

1. [High-Level Overview](#high-level-overview)
2. [System Components](#system-components)
3. [Data Architecture](#data-architecture)
4. [API Layer](#api-layer)
5. [Frontend Architecture](#frontend-architecture)
6. [AI/ML Pipeline](#aiml-pipeline)
7. [Deployment Architecture](#deployment-architecture)
8. [Data Flow](#data-flow)
9. [Security Architecture](#security-architecture)
10. [Performance Considerations](#performance-considerations)

---

## High-Level Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                    Microinverter Platform                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐           │
│  │   Frontend   │  │   API Layer  │  │   Database   │           │
│  │  (React 19)  │  │  (26 routes) │  │ (PostgreSQL) │           │
│  └──────────────┘  └──────────────┘  └──────────────┘           │
│         │                  │                  │                   │
│         └──────────────────┼──────────────────┘                   │
│                            │                                      │
│         ┌──────────────────┼──────────────────┐                   │
│         │                  │                  │                   │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐           │
│  │ AI Services  │  │   Crawling   │  │   Caching    │           │
│  │ (OpenAI,     │  │  (Playwright)│  │   (Redis)    │           │
│  │  Anthropic)  │  │              │  │              │           │
│  └──────────────┘  └──────────────┘  └──────────────┘           │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

---

## System Components

### 1. Frontend Layer

**Framework**: Next.js 15 (App Router) + React 19

**Key Components:**

```
src/components/
├── layout/
│   ├── AppShell.tsx          # Main layout wrapper
│   ├── Sidebar.tsx           # Navigation sidebar (240px)
│   └── Header.tsx            # Top header (48px)
├── charts/
│   ├── KPIChart.tsx          # Dashboard KPI visualization
│   ├── TrendChart.tsx        # Time-series trends
│   └── DistributionChart.tsx # Category distributions
├── maps/
│   ├── ManufacturerMap.tsx   # Interactive world map
│   └── RegionalMap.tsx       # Regional availability
├── ui/
│   ├── Button.tsx            # shadcn/ui button
│   ├── Card.tsx              # shadcn/ui card
│   ├── Dialog.tsx            # Modal dialogs
│   └── Tabs.tsx              # Tab navigation
└── providers/
    └── SessionProvider.tsx   # NextAuth session wrapper
```

**Pages:**

```
src/app/
├── dashboard/                # KPI dashboard
├── search/                   # Product library
├── compare/                  # Product comparison
├── changes/                  # Change events timeline
├── manufacturers/            # Manufacturer directory
├── pipeline/                 # AI pipeline status
├── auth/signin/              # Login page
└── api/                      # 26 API routes
```

**Styling:**
- Tailwind CSS 4 with custom animations
- Enphase Orange (#F26322) primary color
- Desktop-optimized (max-width: 1400px)
- No dark mode, no glassmorphism

---

### 2. API Layer

**Framework**: Next.js API Routes (26 endpoints)

**Route Groups:**

```
/api/
├── products/                 # Product CRUD (2 routes)
│   ├── GET /api/products     # List with filtering
│   ├── POST /api/products    # Create product
│   └── GET /api/products/[id]# Get product details
├── search/                   # Search & semantic (2 routes)
│   ├── GET /api/search       # Full-text search
│   └── GET /api/search/semantic # Embedding-based search
├── dashboard/                # Metrics & analytics (3 routes)
│   ├── GET /api/dashboard    # KPI metrics
│   ├── POST /api/dashboard   # Refresh metrics
│   ├── GET /api/dashboard/kpi # Specific KPI
│   └── GET /api/dashboard/analytics # Analytics data
├── manufacturers/            # Manufacturer management (2 routes)
│   ├── GET /api/manufacturers # List manufacturers
│   ├── POST /api/manufacturers # Create manufacturer
│   └── GET /api/manufacturers/[id] # Get details
├── auth/                     # Authentication (4 routes)
│   ├── POST /api/auth/login  # Credentials login
│   ├── POST /api/auth/register # User registration
│   ├── POST /api/auth/verify # Session verification
│   └── GET /api/auth/[...nextauth] # NextAuth handler
├── ai/                       # AI services (4 routes)
│   ├── POST /api/ai/extract  # Data extraction
│   ├── POST /api/ai/extract-web # Web extraction
│   ├── POST /api/ai/insights # Generate insights
│   └── POST /api/ai/generate-embeddings # Embeddings
├── crawl/                    # Web crawling (4 routes)
│   ├── POST /api/crawl/start # Start crawl job
│   ├── GET /api/crawl/status/[jobId] # Job status
│   ├── GET /api/crawl/list   # List jobs
│   └── GET /api/crawl-jobs   # Alternative list
├── crawl-jobs/               # Job management (2 routes)
│   ├── GET /api/crawl-jobs   # List jobs
│   └── GET /api/crawl-jobs/[id] # Job details
├── pdf/                      # PDF processing (1 route)
│   └── POST /api/pdf/process # Extract from PDF
├── datasheets/               # Datasheet upload (1 route)
│   └── POST /api/datasheets/upload # Upload file
├── changes/                  # Change detection (1 route)
│   └── POST /api/changes/detect # Detect changes
└── market-search/            # Market analysis (1 route)
    └── GET /api/market-search # Regional search
```

**Request/Response Pattern:**

```typescript
// Request
GET /api/products?page=1&pageSize=20&search=IQ8

// Response
{
  "items": [...],
  "total": 167,
  "page": 1,
  "pageSize": 20,
  "totalPages": 9,
  "hasNext": true,
  "hasPrev": false
}
```

---

### 3. Database Layer

**Technology**: PostgreSQL + Prisma ORM

**Schema:**

```
┌─────────────────┐
│    Product      │
├─────────────────┤
│ id (PK)         │
│ name            │
│ series          │
│ model           │
│ manufacturerId  │ ──┐
│ acPower         │   │
│ efficiency      │   │
│ warranty        │   │
│ status          │   │
│ createdAt       │   │
│ updatedAt       │   │
└─────────────────┘   │
                      │
┌─────────────────┐   │
│  Manufacturer   │   │
├─────────────────┤   │
│ id (PK)         │ ◄─┘
│ name            │
│ country         │
│ website         │
│ isActive        │
└─────────────────┘

┌─────────────────┐
│ Specification   │
├─────────────────┤
│ id (PK)         │
│ productId (FK)  │ ──┐
│ category        │   │
│ name            │   │
│ value           │   │
│ unit            │   │
└─────────────────┘   │
                      │
┌─────────────────┐   │
│    Product      │ ◄─┘
└─────────────────┘

┌─────────────────┐
│ Certification   │
├─────────────────┤
│ id (PK)         │
│ productId (FK)  │ ──┐
│ country         │   │
│ standard        │   │
│ certified       │   │
└─────────────────┘   │
                      │
┌─────────────────┐   │
│    Product      │ ◄─┘
└─────────────────┘

┌─────────────────┐
│   CrawlJob      │
├─────────────────┤
│ id (PK)         │
│ url             │
│ status          │
│ progress        │
│ results         │
│ createdAt       │
│ completedAt     │
└─────────────────┘
```

**Key Tables:**
- `Product`: 167 products with specs
- `Manufacturer`: 21 manufacturers
- `Specification`: Product technical specs
- `Certification`: Regional certifications
- `CrawlJob`: Web crawl job tracking
- `ProductAvailability`: Regional availability
- `ChangeEvent`: Product change history

---

### 4. Data Architecture

**Product Data Structure:**

```typescript
interface Product {
  id: string
  name: string
  series: string
  model: string
  manufacturerId: string
  acPower: number          // Watts
  maxModuleSize: number    // Watts
  voltage: number          // Volts
  mppt: number             // Count
  efficiency: number       // Percentage
  warranty: number         // Years
  weight: number           // kg
  dimensions: string       // "L x W x H"
  monitoringPlatform: string
  status: 'ACTIVE' | 'DISCONTINUED' | 'ANNOUNCED' | 'COMING_SOON'
  imageUrl: string
  datasheetUrl: string
  productUrl: string
  manufacturer: Manufacturer
  countries: string[]
  availability: 'IN_STOCK' | 'OUT_OF_STOCK' | 'DISCONTINUED'
  price: number | null
  launchDate: string
  updatedAt: string
}
```

**Manufacturer Index (21 total):**

```
0: Enphase Energy (16 products)
1: APsystems (12 products)
2: Hoymiles (38 products)
3: Deye (10 products)
4: Sigenergy (8 products)
5: Envertech (8 products)
6: Chilicon (2 products)
7: SMA (3 products)
8: Fronius (2 products)
9: SolarEdge (12 products)
10: Tigo (2 products)
11: TSUN (4 products)
12: AEconversion (3 products)
13: Atmoce (10 products)
14: Q CELLS (11 products)
15: Huawei (4 products)
16: FoxESS (8 products)
17: Tesla (3 products)
18: Anker (1 product)
19: Marstek (1 product)
20: EcoFlow (2 products)
```

**Regional Coverage:**

```
North America (NA):
  - United States
  - Canada
  - Mexico

Europe (EU):
  - 25 European countries
  - Per-country variants (EU-DE, EU-FR, etc.)

Asia-Pacific (APAC):
  - Australia
  - Japan
  - India
  - Southeast Asia

Latin America (LATAM):
  - Brazil
  - Mexico
  - Regional variants

Global:
  - Worldwide availability tracking
```

---

## API Layer

### Request Flow

```
┌─────────────────────────────────────────────────────────┐
│ Client Request (Browser/SDK)                            │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│ Next.js Middleware                                      │
│ - Session validation                                    │
│ - CORS handling                                         │
│ - Request logging                                       │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│ API Route Handler                                       │
│ - Parameter validation (Zod)                            │
│ - Business logic                                        │
│ - Database queries                                      │
└────────────────────┬────────────────────────────────────┘
                     │
        ┌────────────┼────────────┐
        │            │            │
        ▼            ▼            ▼
    ┌────────┐  ┌────────┐  ┌────────┐
    │Database│  │ Cache  │  │ AI API │
    │(Prisma)│  │(Redis) │  │(OpenAI)│
    └────────┘  └────────┘  └────────┘
        │            │            │
        └────────────┼────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│ Response Formatting                                     │
│ - JSON serialization                                    │
│ - Error handling                                        │
│ - Status codes                                          │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│ Client Response (JSON)                                  │
└─────────────────────────────────────────────────────────┘
```

### Validation Strategy

```typescript
// Zod schemas for runtime validation
const searchSchema = z.object({
  q: z.string().min(1).max(200),
  page: z.coerce.number().int().min(1).max(1000).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
  manufacturers: z.array(z.string()).optional(),
  countries: z.array(z.string()).optional(),
  minPower: z.coerce.number().min(0).optional(),
  maxPower: z.coerce.number().min(0).optional(),
  // ... more fields
})

// Validation in route handler
const validatedParams = searchSchema.parse(searchParamsObj)
```

---

## Frontend Architecture

### Component Hierarchy

```
AppShell
├── Header
│   ├── Logo
│   ├── Navigation
│   └── UserMenu
├── Sidebar
│   ├── NavLinks
│   │   ├── Dashboard
│   │   ├── Product Library
│   │   ├── Compare
│   │   ├── Changes
│   │   ├── Manufacturers
│   │   └── Pipeline
│   └── Settings
└── MainContent
    ├── Dashboard Page
    │   ├── KPICards
    │   ├── TrendCharts
    │   └── RecentLaunches
    ├── Search Page
    │   ├── SearchBar
    │   ├── Filters
    │   └── ProductGrid
    ├── Compare Page
    │   ├── ProductSelector
    │   ├── ComparisonTable
    │   └── AISummary
    ├── Changes Page
    │   ├── Timeline
    │   └── EventCards
    ├── Manufacturers Page
    │   ├── ManufacturerGrid
    │   └── DetailView
    │       └── InteractiveMap
    └── Pipeline Page
        ├── JobStatus
        └── MultiLangTab
```

### State Management

```
NextAuth Session
├── User
│   ├── id
│   ├── name
│   ├── email
│   └── role
└── Permissions
    ├── read:analytics
    ├── manage:system
    └── write:products
```

### Data Fetching Pattern

```typescript
// Server-side (API routes)
export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  
  const data = await prisma.product.findMany(...)
  return NextResponse.json(data)
}

// Client-side (React components)
const [products, setProducts] = useState([])
const [loading, setLoading] = useState(true)

useEffect(() => {
  fetch('/api/products?page=1')
    .then(res => res.json())
    .then(data => setProducts(data.items))
    .finally(() => setLoading(false))
}, [])
```

---

## AI/ML Pipeline

### Components

```
┌──────────────────────────────────────────────────────┐
│           AI/ML Pipeline Architecture                │
├──────────────────────────────────────────────────────┤
│                                                      │
│  ┌────────────────────────────────────────────┐    │
│  │ Data Extraction Layer                      │    │
│  ├────────────────────────────────────────────┤    │
│  │ • Claude API (Anthropic)                   │    │
│  │ • Web scraping (Playwright)                │    │
│  │ • PDF processing (pdf-parse)               │    │
│  │ • Structured data extraction               │    │
│  └────────────────────────────────────────────┘    │
│                     │                               │
│                     ▼                               │
│  ┌────────────────────────────────────────────┐    │
│  │ Processing Layer                           │    │
│  ├────────────────────────────────────────────┤    │
│  │ • Data validation & cleaning               │    │
│  │ • Specification normalization              │    │
│  │ • Duplicate detection                      │    │
│  │ • Confidence scoring                       │    │
│  └────────────────────────────────────────────┘    │
│                     │                               │
│                     ▼                               │
│  ┌────────────────────────────────────────────┐    │
│  │ Enrichment Layer                           │    │
│  ├────────────────────────────────────────────┤    │
│  │ • GPT-4o summarization                     │    │
│  │ • Multi-language translation               │    │
│  │ • Embedding generation                     │    │
│  │ • Insight generation                       │    │
│  └────────────────────────────────────────────┘    │
│                     │                               │
│                     ▼                               │
│  ┌────────────────────────────────────────────┐    │
│  │ Storage Layer                              │    │
│  ├────────────────────────────────────────────┤    │
│  │ • PostgreSQL + pgvector                    │    │
│  │ • Embedding vectors                        │    │
│  │ • Change history                           │    │
│  │ • Audit logs                               │    │
│  └────────────────────────────────────────────┘    │
│                                                      │
└──────────────────────────────────────────────────────┘
```

### Multi-Language Support

```
Supported Languages (10):
- English (en)
- German (de)
- French (fr)
- Spanish (es)
- Italian (it)
- Dutch (nl)
- Portuguese (pt)
- Japanese (ja)
- Chinese (zh)
- Korean (ko)

Translation Pipeline:
1. Extract text from source
2. Detect language
3. Translate via GPT-4o-mini
4. Store translations
5. Generate embeddings per language
```

### Crawling Pipeline

```
┌─────────────────────────────────────────┐
│ Crawl Job Initialization                │
├─────────────────────────────────────────┤
│ • URL validation                        │
│ • Depth configuration                   │
│ • Language selection                    │
│ • Schema definition                     │
└────────────┬────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────┐
│ Queue to BullMQ (Redis)                 │
├─────────────────────────────────────────┤
│ • Job persistence                       │
│ • Retry logic                           │
│ • Priority handling                     │
└────────────┬────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────┐
│ Playwright Crawler Worker               │
├─────────────────────────────────────────┤
│ • Browser automation                    │
│ • JavaScript rendering                  │
│ • Dynamic content loading                │
│ • Screenshot capture                    │
└────────────┬────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────┐
│ Claude Extraction                       │
├─────────────────────────────────────────┤
│ • Structured data extraction            │
│ • Schema validation                     │
│ • Confidence scoring                    │
└────────────┬────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────┐
│ Database Storage                        │
├─────────────────────────────────────────┤
│ • Product creation/update               │
│ • Change event logging                  │
│ • Audit trail                           │
└─────────────────────────────────────────┘
```

---

## Deployment Architecture

### Development Environment

```
Local Machine
├── Node.js 18+
├── npm/yarn
├── PostgreSQL (optional)
├── Redis (optional)
└── Environment variables (.env.local)

npm run dev
→ http://localhost:3000
```

### Production Environment

```
┌──────────────────────────────────────────────────┐
│ Vercel (Deployment Platform)                     │
├──────────────────────────────────────────────────┤
│                                                  │
│ ┌────────────────────────────────────────────┐  │
│ │ Edge Network (Global CDN)                  │  │
│ │ - Static asset caching                     │  │
│ │ - Request routing                          │  │
│ │ - DDoS protection                          │  │
│ └────────────────────────────────────────────┘  │
│                     │                            │
│                     ▼                            │
│ ┌────────────────────────────────────────────┐  │
│ │ Serverless Functions                       │  │
│ │ - Next.js API routes                       │  │
│ │ - Auto-scaling                             │  │
│ │ - Cold start optimization                  │  │
│ └────────────────────────────────────────────┘  │
│                     │                            │
│                     ▼                            │
│ ┌────────────────────────────────────────────┐  │
│ │ External Services                          │  │
│ │ - PostgreSQL (AWS RDS)                     │  │
│ │ - Redis (AWS ElastiCache)                  │  │
│ │ - OpenAI API                               │  │
│ │ - Anthropic API                            │  │
│ └────────────────────────────────────────────┘  │
│                                                  │
└──────────────────────────────────────────────────┘

Auto-deployment:
main branch → Vercel → Production
```

### Docker Deployment

```yaml
version: '3.8'
services:
  postgres:
    image: pgvector/pgvector:pg15
    environment:
      POSTGRES_DB: microinverter_platform
      POSTGRES_PASSWORD: postgres
    ports:
      - "5432:5432"

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"

  app:
    build: .
    environment:
      DATABASE_URL: postgresql://postgres:postgres@postgres:5432/microinverter_platform
      REDIS_URL: redis://redis:6379
      NEXTAUTH_SECRET: your-secret
      NEXTAUTH_URL: http://localhost:3000
    ports:
      - "3000:3000"
    depends_on:
      - postgres
      - redis

  worker:
    build: .
    command: npm run worker
    environment:
      DATABASE_URL: postgresql://postgres:postgres@postgres:5432/microinverter_platform
      REDIS_URL: redis://redis:6379
    depends_on:
      - postgres
      - redis
```

---

## Data Flow

### Product Search Flow

```
User Input (Search Query)
        │
        ▼
┌──────────────────────────────────┐
│ Frontend: SearchPage             │
│ - Input validation               │
│ - Filter selection               │
└────────────┬─────────────────────┘
             │
             ▼
┌──────────────────────────────────┐
│ API: GET /api/search             │
│ - Parameter validation (Zod)     │
│ - Session check                  │
└────────────┬─────────────────────┘
             │
        ┌────┴────┐
        │          │
        ▼          ▼
    ┌────────┐  ┌────────────────┐
    │Database│  │Semantic Search │
    │Search  │  │(Embeddings)    │
    └────┬───┘  └────────┬───────┘
         │               │
         └───────┬───────┘
                 │
                 ▼
        ┌──────────────────────┐
        │ Relevance Scoring    │
        │ - Exact matches      │
        │ - Partial matches    │
        │ - Term frequency     │
        └────────┬─────────────┘
                 │
                 ▼
        ┌──────────────────────┐
        │ Sorting & Pagination │
        │ - Sort by relevance  │
        │ - Apply pagination   │
        └────────┬─────────────┘
                 │
                 ▼
        ┌──────────────────────┐
        │ Response Formatting  │
        │ - JSON serialization │
        │ - Metadata inclusion │
        └────────┬─────────────┘
                 │
                 ▼
        Frontend: Display Results
```

### Product Comparison Flow

```
User Selects Products (1-4)
        │
        ▼
┌──────────────────────────────────┐
│ Frontend: ComparePage            │
│ - Product selection              │
│ - Specification display          │
└────────────┬─────────────────────┘
             │
             ▼
┌──────────────────────────────────┐
│ API: GET /api/products/[id]      │
│ - Fetch product details          │
│ - Include specifications         │
│ - Include certifications         │
└────────────┬─────────────────────┘
             │
             ▼
┌──────────────────────────────────┐
│ Database: Product Details        │
│ - Specifications                 │
│ - Certifications                 │
│ - Regional variants              │
└────────────┬─────────────────────┘
             │
             ▼
┌──────────────────────────────────┐
│ AI: Generate Comparison Summary  │
│ - GPT-4o analysis                │
│ - Key differences                │
│ - Recommendations                │
└────────────┬─────────────────────┘
             │
             ▼
        Frontend: Display Comparison
        - Side-by-side table
        - AI summary
        - Specification highlights
```

---

## Security Architecture

### Authentication Flow

```
┌────────────────────────────────────┐
│ User Login Form                    │
│ - Username                         │
│ - Password                         │
└────────────┬───────────────────────┘
             │
             ▼
┌────────────────────────────────────┐
│ POST /api/auth/login               │
│ - Credentials validation           │
│ - Password hashing (bcryptjs)      │
└────────────┬───────────────────────┘
             │
             ▼
┌────────────────────────────────────┐
│ NextAuth.js Session Creation       │
│ - JWT token generation             │
│ - Session storage                  │
│ - Cookie setting (httpOnly)        │
└────────────┬───────────────────────┘
             │
             ▼
┌────────────────────────────────────┐
│ Redirect to Dashboard              │
│ - Session cookie included          │
│ - Authenticated requests enabled   │
└────────────────────────────────────┘
```

### Authorization Strategy

```
Session Validation
        │
        ▼
┌──────────────────────────┐
│ User Role Check          │
│ - ADMIN                  │
│ - USER                   │
│ - GUEST                  │
└────────────┬─────────────┘
             │
             ▼
┌──────────────────────────┐
│ Permission Check         │
│ - read:analytics         │
│ - manage:system          │
│ - write:products         │
│ - delete:products        │
└────────────┬─────────────┘
             │
        ┌────┴────┐
        │          │
        ▼          ▼
    ┌────────┐  ┌──────────┐
    │Allowed │  │Forbidden │
    │(200)   │  │(403)     │
    └────────┘  └──────────┘
```

### Data Protection

```
Sensitive Data:
├── User credentials (hashed with bcryptjs)
├── API keys (environment variables)
├── Session tokens (JWT, httpOnly cookies)
└── Database connections (encrypted)

Encryption:
├── HTTPS/TLS for all traffic
├── Database password hashing
├── Environment variable protection
└── Secure session storage
```

---

## Performance Considerations

### Caching Strategy

```
┌─────────────────────────────────────┐
│ Caching Layers                      │
├─────────────────────────────────────┤
│                                     │
│ 1. Browser Cache (Static Assets)    │
│    - Images, CSS, JS                │
│    - Cache-Control headers          │
│    - 1 week TTL                     │
│                                     │
│ 2. CDN Cache (Vercel Edge)          │
│    - HTML pages                     │
│    - API responses                  │
│    - 1 hour TTL                     │
│                                     │
│ 3. Redis Cache (Server)             │
│    - Database queries               │
│    - API responses                  │
│    - 5-15 minute TTL                │
│                                     │
│ 4. Database Query Cache             │
│    - Prisma result caching          │
│    - Connection pooling             │
│                                     │
└─────────────────────────────────────┘
```

### Database Optimization

```
Indexing Strategy:
├── Primary Keys
│   └── product.id, manufacturer.id
├── Foreign Keys
│   └── product.manufacturerId
├── Search Columns
│   ├── product.name
│   ├── product.series
│   └── product.model
├── Filter Columns
│   ├── product.status
│   ├── product.acPower
│   └── product.efficiency
└── Sort Columns
    ├── product.createdAt
    └── product.updatedAt

Query Optimization:
├── Pagination (limit/offset)
├── Selective field loading
├── Relationship eager loading
└── Query result caching
```

### Frontend Performance

```
Optimization Techniques:
├── Code Splitting
│   └── Route-based chunks
├── Image Optimization
│   ├── Next.js Image component
│   ├── WebP format
│   └── Lazy loading
├── Bundle Size
│   ├── Tree shaking
│   ├── Minification
│   └── Compression
├── Runtime Performance
│   ├── React.memo for components
│   ├── useCallback for functions
│   └── useMemo for computations
└── Monitoring
    ├── Core Web Vitals
    ├── Lighthouse scores
    └── Performance budgets
```

---

## Monitoring & Observability

### Logging Strategy

```
Log Levels:
├── ERROR: System failures, exceptions
├── WARN: Deprecated features, warnings
├── INFO: Important events, milestones
├── DEBUG: Detailed execution flow
└── TRACE: Very detailed debugging

Log Destinations:
├── Console (development)
├── File system (production)
├── Cloud logging (Vercel)
└── Error tracking (Sentry)
```

### Metrics & Alerts

```
Key Metrics:
├── API Response Time
├── Database Query Time
├── Cache Hit Rate
├── Error Rate
├── Active Users
├── Product Count
└── Crawl Job Status

Alert Thresholds:
├── Response time > 2s
├── Error rate > 1%
├── Database connection failure
├── Redis connection failure
└── API quota exceeded
```

---

## Future Enhancements

### Planned Improvements

```
Short Term (1-3 months):
├── Database query optimization
├── Advanced caching strategies
├── API rate limiting
└── Webhook integrations

Medium Term (3-6 months):
├── GraphQL API
├── Real-time updates (WebSockets)
├── Advanced analytics
└── Custom report generation

Long Term (6-12 months):
├── Machine learning models
├── Predictive analytics
├── Mobile app
└── Multi-tenancy support
```

---

**Last Updated**: October 15, 2026
**Architecture Version**: 1.0.0
**Status**: Stable
