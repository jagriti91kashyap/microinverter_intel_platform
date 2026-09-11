# Enphase Microinverter Intelligence Platform

AI-powered product intelligence platform for tracking, comparing, and analyzing microinverters across 14 manufacturers, 81+ products, and 54 countries.

## Quick Start

```bash
# 1. Install dependencies
npm install --legacy-peer-deps

# 2. Create environment file
cp env.example .env.local

# 3. Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) — login with **Username:** `Enphase` / **Password:** `Enphase@123`

> No database or API keys required for demo. The app runs on static TypeScript data modules.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 15 (App Router), React 19, TypeScript 5 |
| Styling | Tailwind CSS 4, shadcn/ui, Radix UI |
| Charts | Recharts |
| Maps | react-simple-maps (interactive world map) |
| Animation | Framer Motion |
| Auth | NextAuth.js 4 (Credentials provider, JWT) |
| AI Pipeline | OpenAI GPT-4o, Anthropic Claude, text-embedding-3 |
| Crawling | Playwright, pdf-parse, SerpAPI |
| Database | PostgreSQL + pgvector (Prisma ORM) — optional for demo |
| Queue | Redis + BullMQ — optional for demo |

## Pages

| Route | Description |
|-------|------------|
| `/dashboard` | KPI cards, trend charts, recent product launches |
| `/search` | Product Library — filterable grid of 81+ products |
| `/compare` | Side-by-side comparison (up to 4 products) with AI summary |
| `/changes` | Latest news & change events timeline (91 events, 2023–2026) |
| `/manufacturers` | Manufacturer grid → detail page with interactive world map |
| `/pipeline` | AI crawl pipeline status, multi-language crawl tab |

## Project Structure

```
src/
├── app/                        # Next.js App Router pages
│   ├── api/                    # 13 API route groups
│   ├── auth/signin/            # Sign-in page
│   ├── dashboard/              # Dashboard
│   ├── search/                 # Product Library
│   ├── compare/                # Product comparison + AI summary
│   ├── changes/                # News & change events
│   ├── manufacturers/          # Manufacturer list + [id] detail
│   └── pipeline/               # AI pipeline status
├── components/
│   ├── layout/                 # AppShell, Sidebar (240px), Header (48px)
│   ├── maps/                   # Interactive world map component
│   ├── charts/                 # Recharts wrappers
│   ├── ui/                     # shadcn/ui components
│   └── providers/              # NextAuth SessionProvider
├── data/
│   ├── products-data.ts        # 81+ product specs (244KB)
│   └── comprehensive-data.ts   # Manufacturers, changeEvents, crawlJobs
├── services/
│   ├── ai/                     # Extraction (Claude), Summarization (GPT-4o), Embeddings
│   ├── crawling/               # Playwright crawler, multi-lang (10 languages)
│   ├── pdf/                    # PDF datasheet processor
│   └── web-search/             # SerpAPI integration
├── lib/                        # Auth, DB, utilities
├── hooks/                      # useAuth hook
├── jobs/                       # BullMQ crawl workers
└── types/                      # TypeScript interfaces
```

## Data Coverage

- **14 manufacturers**: Enphase, APsystems, Hoymiles, Deye, SolarEdge, SMA, Fronius, Tigo, TSUN, AEconversion, Atmoce, Sigenergy, and more
- **81+ products**: Microinverters, power optimizers, hybrid inverters, batteries
- **54 countries** across 5 regions (NA, EU, APAC, LATAM, Global)
- **91 change events**: Product launches, spec changes, price changes, firmware updates (2023–2026)
- **70+ regional website URLs** for multi-language crawling (10 languages)

## Environment Variables

Copy `env.example` to `.env.local`. Only `NEXTAUTH_SECRET` is required for demo:

```bash
NEXTAUTH_SECRET="any-random-string"    # Required
NEXTAUTH_URL="http://localhost:3000"   # Required

# Optional — for AI pipeline features
OPENAI_API_KEY=""
ANTHROPIC_API_KEY=""
SERPAPI_KEY=""

# Optional — for database persistence
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/microinverter_platform"
REDIS_URL="redis://localhost:6379"
```

## Docker

```bash
docker-compose up -d
```

This starts PostgreSQL (pgvector), Redis, the Next.js app, and background workers.

## Architecture

See `docs/architecture-diagram.html` for interactive Mermaid diagrams covering:
1. High-level system overview
2. Application layer (pages + API routes)
3. Data model (ER diagram)
4. AI/ML pipeline detail
5. Frontend component architecture
6. Deployment topology
7. Technology stack legend

## Design Language

- **Enphase Orange** (#F26322) primary color throughout
- **Inter** font, 14px base
- Light-only enterprise design (no dark mode)
- Clean white cards, subtle borders, no glassmorphism
- Desktop-optimized layout (1400px max-width)

## License

Proprietary — Enphase Energy, Inc.
