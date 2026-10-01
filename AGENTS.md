# Microinverter Intelligence Platform — Agent Knowledge Base

## Project Overview
AI-powered global microinverter product intelligence platform built for Enphase Energy.
- **Repo**: `jagriti91kashyap/microinverter_intel_platform` on GitHub
- **Deployed**: Vercel (auto-deploys from `main` branch)
- **Dev server**: `npm run dev` → http://localhost:3000
- **Portable Git**: `C:\Users\jkashyap\Downloads\PortableGit\cmd\git.exe` (system `git` not on PATH)

## Tech Stack
- **Framework**: Next.js 15 (App Router) + React 19
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS 4 + `tw-animate-css`
- **UI**: Radix UI primitives, shadcn/ui components, Lucide icons, Framer Motion
- **Charts**: Recharts 3
- **Auth**: NextAuth.js 4 (credentials provider)
- **ORM**: Prisma 5 (PostgreSQL)
- **AI**: OpenAI SDK + Anthropic SDK
- **Font**: Inter (14px base)

## Authentication
- **Demo login**: Username `Enphase`, Password anything → ADMIN role
- Sign-in page: `/auth/signin` with "Use Demo Account" quick-login button
- Auth pages render without sidebar/header (controlled by `AppShell`)
- Middleware protects: `/dashboard`, `/search`, `/compare`, `/products`, `/manufacturers`, `/market-search`, `/changes`, `/pipeline`

## Design System
- **Enphase Energy brand**: Orange primary `#F26322`
- **No dark mode**, no glassmorphism
- Desktop-optimized: `max-w-[1400px]` content container, desktop-first grids
- Main content area: `bg-gray-50/50` background

## Project Structure
```
src/
├── app/                    # Next.js App Router pages
│   ├── dashboard/          # KPI dashboard
│   ├── search/             # Product Library (was "Product Search")
│   ├── compare/            # Side-by-side product comparison
│   ├── changes/            # Latest News / change events
│   ├── manufacturers/      # Manufacturer directory + [id] detail
│   ├── pipeline/           # AI Pipeline with Multi-Lang tab
│   ├── market-search/      # Market search
│   ├── settings/           # Settings
│   ├── auth/               # signin, error
│   └── api/                # API routes (dashboard, search)
├── components/
│   ├── layout/             # AppShell, Sidebar (240px), Header (h-12)
│   ├── charts/             # Interactive charts (Recharts)
│   └── providers/          # Session provider
├── data/
│   ├── products-data.ts    # Product definitions via P() helper + buildProducts()
│   └── comprehensive-data.ts  # Types, manufacturers, exports
├── services/
│   └── crawling/           # Multi-language crawler service
├── lib/                    # Utilities (ai-extractor, data-processor, utils)
├── hooks/                  # Custom React hooks
├── jobs/                   # Background jobs
├── types/                  # TypeScript type definitions
└── utils/                  # Utility functions
```

## Data Architecture (CRITICAL)

### Product Creation: `products-data.ts`
All products are created via the `P()` helper function in `buildProducts()`:

```typescript
P(id, name, series, model, acPower, maxModuleSize, voltage, mppt, efficiency, warranty, weight,
  dimensions, monitoringPlatform, status, datasheetUrl, productUrl, manufacturer, countries, price,
  availability, launchDate, updated, description, pf, panelRange, connectivity, tempRange, ipRating,
  vRange, mpptRange, iMax, thd, nightP, startV, cecEff, voc, isc, extra, euroEff, maxEff, pptrRange)
```

**Key parameters (positional)**:
- `mpptRange`: MPPT voltage range string (e.g., `'16-60 VDC'`)
- `pptrRange`: Power point tracking range (default `'X'` if not applicable)
- `cecEff`, `euroEff`, `maxEff`: Efficiency strings, overridden by `efficiencyCorrections` map
- `extra`: `Record<string, string>` for additional specs like battery capacity

### Manufacturer Index (in buildProducts)
```
Enphase=0, APsystems=1, Hoymiles=2, Deye=3, Sigenergy=4, Envertech=5,
Chilicon=6, SMA=7, Fronius=8, SolarEdge=9, Tigo=10, TSUN=11, AEconversion=12, Atmoce=13,
Q CELLS=14, Huawei=15, FoxESS=16, Tesla=17, Anker=18, Marstek=19, EcoFlow=20
```

### Country Groups
Products use predefined country arrays:
- `NA`: US, Canada, Mexico
- `EU`: 25 European countries
- Per-manufacturer groups: `enphaseNA`, `hoy230V`, `hoyNA`, `hoyLATAM`, `apsGlobal`, `sigGlobal`, `foxGlobal`, `ankerEU`, `marstekEU`, `ecoflowEU`, `ecoflowNA`, etc.
- Enphase has per-product country lists (verified from regional stores): `enIQ8HC`, `enIQ8P`, `enIQ9N`, etc.

### Efficiency Corrections Map
After all products are created, `efficiencyCorrections` overrides CEC/Euro/Max efficiency per product ID. Always add new products here too.

### Product Type Derivation
`deriveProductType()` classifies products by series/name into:
- Microinverter, Power Optimizer, AC Module, Hybrid Inverter, String Inverter, AC-Coupled Inverter, Integrated Solar Inverter + Battery, Plug-in Battery Storage

### Regional Variants
`regionalVariantsMap` defines per-product regional SKUs (model numbers, voltage, certifications, datasheet URLs). `splitProductsByRegionalSKU()` creates separate product entries per region for products with multiple regional variants.

### Exports (comprehensive-data.ts)
```typescript
export const products = splitProductsByRegionalSKU(applyRegionalVariants(buildProducts(manufacturers)));
```

## Current Product Inventory (as of Oct 2026)

### 21 Manufacturers, ~167 product IDs

| Manufacturer | ID Range | Product Count | Key Series |
|---|---|---|---|
| Enphase | 1-21 | 16 | IQ8, IQ8+, IQ8M/A/H/HC/MC/AC/X/P, IQ9N, IQ7+/A |
| APsystems | 100-107, 133, 147-150 | 12 | DS3, EZ1, QT2, QT2D, DS3D |
| Hoymiles | 22-31, 108-119, 127-132, 154-163 | 38 | HM, HMS, HMT, MiT, HiFlow, HiFlow LV, MIS-W Pro |
| Deye | 32-41 | 10 | SUN-G3 EU/US |
| Sigenergy | 42-46, 139-141 | 8 | SigenMicro, SP2, TP2 |
| Envertech | 47-54 | 8 | EVT series |
| Chilicon | 55-56 | 2 | CP-250E, CP-720 |
| SMA | 57-59 | 3 | Sunny Boy |
| Fronius | 60-61 | 2 | Primo GEN24 |
| SolarEdge | 62-64, 98-99, 134-137, 151-153 | 12 | HD-Wave, S-Series, U-Series, C-Series |
| Tigo | 65-66 | 2 | TS4-A |
| TSUN | 67-70 | 4 | TSOL-MS |
| AEconversion | 71-73 | 3 | INV series |
| Atmoce | 74-81, 126 | 10 | MI series |
| Q CELLS | 84-87, 120-125, 146 | 11 | Q.VOLT MI, Q.HOME+, Q.PEAK AC |
| Huawei | 88-91 | 4 | SUN2000-M1 |
| FoxESS | 92-95, 142-145 | 8 | T-G3, H3, H1-G2, AC1-G2 |
| Tesla | 96-97, 138 | 3 | Solar Inverter, Powerwall 3 |
| Anker | 164 | 1 | SOLIX Solarbank 4 E5000 Pro |
| Marstek | 165 | 1 | Venus B |
| EcoFlow | 166-167 | 2 | STREAM 800, STREAM Ultra |

## Key Conventions & Rules

### Code Style
- Do NOT add or remove comments unless explicitly asked
- Imports always at top of file
- Use existing patterns (P() helper, country groups, efficiency corrections map)
- No emojis in code unless requested

### Data Integrity
- **mpptRange/pptrRange**: All manufacturers have been verified and corrected (see memory below)
- **Country mappings**: Verified from official regional stores (especially Enphase Japan = IQ8HC only)
- **Hoymiles**: Japan NOT included in 230V markets
- **Enphase IQ8P**: EU added based on active INT datasheet (IQ8P-72-2-INT)
- **SolarEdge**: P-Series replaced by S-Series (IDs 134-137 reused)
- **Efficiency corrections**: Always override via `efficiencyCorrections` map, not in P() call

### Adding New Products
1. Pick next available ID number
2. Add P() call in the appropriate manufacturer section
3. Add efficiency correction entry in `efficiencyCorrections`
4. Update manufacturer `totalProducts` in `comprehensive-data.ts`
5. If new product type, update `deriveProductType()`
6. If new manufacturer, add to manufacturer array, accessories map, and manufacturer index comment

### Known Pre-existing TS Errors (not bugs in our code)
These exist in unrelated API/lib files and do NOT affect the app:
- `src/app/api/search/route.ts` — type mismatches
- `src/app/api/dashboard/analytics/route.ts` — null type
- `src/components/charts/interactive-chart.tsx` — Recharts tooltip types
- `src/lib/ai-extractor.ts` — unknown type
- `src/lib/data-processor.ts` — Prisma type mismatch
- `src/middleware.ts` — NextRequest.ip

### Environment
- `.env.local` has: `NEXTAUTH_SECRET`, `NEXTAUTH_URL`, `DATABASE_URL`, `REDIS_URL`

## Session History Summary

### mpptRange/pptrRange Corrections (All Complete)
Every manufacturer's MPPT and PPTR ranges have been researched and corrected against official datasheets:
- Hoymiles HM/HMS/HMT/HiFlow → `16-60 VDC`
- APsystems DS3/EZ1/QT2 → `28-45 VDC`, QT2D → `52-118 VDC`
- Deye SUN-G3 → `25-55 VDC`
- Sigenergy SigenMicro → `16-60 VDC`, SP2 → `50-550 VDC`, TP2 → `160-1000 VDC`
- Envertech EVT300/400 → `22-50 VDC`, EVT560/720 → `24-45 VDC`
- TSUN → `16-60 VDC`
- Huawei → `140-980 VDC`, FoxESS T → `140-1000 VDC`, H1-G2 → `80-550 VDC`
- Tesla SI → `60-480 VDC`, Atmoce MI-600 → `16-60 VDC`

### UI Changes Applied
- Dashboard: Removed Distribution Analytics, Global Availability, Recent Change Events, Platform Status
- Dashboard: Sections renamed to "New Launches" and "Change in Product Details"
- "Change Events" KPI → "Global Product Updates" with "Since Jan 2023"
- "Product Search" → "Product Library" across all UI
- CommandPalette removed from AppShell (file exists but dead code)
- Changes page: Removed "Global" from country filter dropdown

### Multi-Language Crawler
- `src/services/crawling/multi-lang-crawler.ts`: 10-language support, AI translation via GPT-4o-mini
- Pipeline page has "Multi-Lang" tab with crawl simulation

### SolarEdge Optimizer Migration
- P-Series (P505/P600/P800/P1100) replaced by S-Series (S440/S500B/S650B/S650A)
- Added U-Series (U650/U650B) and C-Series (C651U) for US domestic content
