# Quick Fix Guide - Critical Issues

## 🔴 CRITICAL ISSUES (Fix These First!)

### Issue #1: CORS Allows All Origins (30 minutes)
**File**: `src/middleware.ts` line 66

**Current**:
```typescript
response.headers.set('Access-Control-Allow-Origin', '*')
```

**Fix**:
```typescript
const allowedOrigins = [
  'https://microinverterintelplatform-git-main-mbu1.vercel.app',
  'https://yourdomain.com'
];
const origin = request.headers.get('origin');
if (allowedOrigins.includes(origin)) {
  response.headers.set('Access-Control-Allow-Origin', origin);
}
```

---

### Issue #2: TypeScript Errors Ignored (2-4 hours)
**File**: `next.config.js` line 9

**Current**:
```javascript
typescript: {
  ignoreBuildErrors: true,
},
```

**Fix**:
```javascript
typescript: {
  ignoreBuildErrors: false,
},
```

Then fix these files:
1. `src/app/api/search/route.ts`
2. `src/app/api/dashboard/analytics/route.ts`
3. `src/components/charts/interactive-chart.tsx`
4. `src/lib/ai-extractor.ts`
5. `src/lib/data-processor.ts`
6. `src/middleware.ts`

---

### Issue #3: Fallback JWT Secrets (1 hour)
**Files**: 
- `src/lib/azure-ad.ts` line 242, 257
- `src/lib/simple-auth.ts` line 4
- `src/lib/auth.ts` line 12, 18

**Current**:
```typescript
const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret';
```

**Fix**:
```typescript
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is required');
}
```

---

## 🟠 HIGH PRIORITY ISSUES

### Issue #4: ESLint Disabled (2-4 hours)
**File**: `next.config.js` line 5

**Current**:
```javascript
eslint: {
  ignoreDuringBuilds: true,
},
```

**Fix**:
```javascript
eslint: {
  ignoreDuringBuilds: false,
  dirs: ['src', 'pages', 'app'],
},
```

---

### Issue #5: CSP Too Permissive (1-2 hours)
**File**: `next.config.js` line 38-39

**Current**:
```javascript
"script-src 'self' 'unsafe-eval' 'unsafe-inline'",
"style-src 'self' 'unsafe-inline'",
```

**Fix**:
```javascript
"script-src 'self'",
"style-src 'self'",
```

---

### Issue #6: Remove Console.log (3-4 hours)
**Install logging library**:
```bash
npm install winston
```

**Create logger** at `src/lib/logger.ts`:
```typescript
import winston from 'winston';

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.Console({
      format: winston.format.simple(),
    }),
  ],
});

export default logger;
```

**Replace all console.log**:
```typescript
// Before
console.log('Dashboard data received:', data);

// After
import logger from '@/lib/logger';
logger.info('Dashboard data received', { data });
```

---

### Issue #7: Add Test Suite (2-3 days)
**Install dependencies**:
```bash
npm install --save-dev jest @testing-library/react @testing-library/jest-dom ts-jest @types/jest
```

**Create jest.config.js**:
```javascript
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  roots: ['<rootDir>/src'],
  testMatch: ['**/__tests__/**/*.ts?(x)', '**/?(*.)+(spec|test).ts?(x)'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
};
```

**Add to package.json**:
```json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage"
  }
}
```

**Create first test** at `src/data/__tests__/products-data.test.ts`:
```typescript
import { products } from '@/data/comprehensive-data';

describe('Products Data', () => {
  it('should have 167 products', () => {
    expect(products.length).toBe(167);
  });

  it('should have unique product IDs', () => {
    const ids = products.map(p => p.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(ids.length);
  });

  it('should have required fields', () => {
    products.forEach(product => {
      expect(product.id).toBeDefined();
      expect(product.name).toBeDefined();
      expect(product.manufacturer).toBeDefined();
    });
  });
});
```

---

## 🟡 MEDIUM PRIORITY ISSUES

### Issue #8: Fix Datasheet URLs (2-3 hours)
**File**: `src/data/products-data.ts`

Search for generic URLs like:
```typescript
'https://enphase.com/store/microinverters'  // ❌ Generic
```

Replace with specific datasheet URLs:
```typescript
'https://enphase.com/download/iq8mc-microinverter-data-sheet'  // ✅ Specific
```

---

### Issue #9: Add Regional Pricing (4-6 hours)
**File**: `src/data/products-data.ts`

Add to each product:
```typescript
regionalPrices: [
  {
    region: 'NA',
    price: 189,
    currency: 'USD',
    source: 'Enphase Official Store',
    sourceUrl: 'https://enphase.com/store',
    lastUpdated: '2025-07-16',
    confidence: 0.95
  },
  {
    region: 'EU',
    price: 169,
    currency: 'EUR',
    source: 'Enphase EU Store',
    sourceUrl: 'https://enphase.com/en-eu/store',
    lastUpdated: '2025-07-16',
    confidence: 0.95
  }
]
```

---

### Issue #10: Fix Demo Auth (30 minutes)
**File**: `src/auth.ts` line 60

**Current**:
```typescript
if (username === "Enphase") {
  // Allow with any password
}
```

**Fix**:
```typescript
const DEMO_USERNAME = process.env.DEMO_USERNAME;
const DEMO_PASSWORD = process.env.DEMO_PASSWORD;

if (DEMO_USERNAME && username === DEMO_USERNAME && password === DEMO_PASSWORD) {
  // Allow demo login
}
```

**Add to .env.local**:
```
DEMO_USERNAME=Enphase
DEMO_PASSWORD=demo123
```

---

### Issue #11: Add Rate Limiting (2-3 hours)
**Install**:
```bash
npm install @vercel/kv
```

**Create middleware** at `src/lib/rate-limit.ts`:
```typescript
import { Ratelimit } from '@vercel/kv';

export const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(100, '1 h'),
});
```

**Use in API routes**:
```typescript
import { ratelimit } from '@/lib/rate-limit';

export async function GET(request: NextRequest) {
  const { success } = await ratelimit.limit(request.ip || 'anonymous');
  if (!success) {
    return new Response('Rate limited', { status: 429 });
  }
  // ... rest of handler
}
```

---

### Issue #12: Add Caching (4-6 hours)
**Create cache helper** at `src/lib/cache.ts`:
```typescript
import { redisCache } from '@/lib/redis';

export async function getCachedData<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttl: number = 3600
): Promise<T> {
  const cached = await redisCache.get(key);
  if (cached) return JSON.parse(cached);
  
  const data = await fetcher();
  await redisCache.setex(key, ttl, JSON.stringify(data));
  return data;
}
```

**Use in API routes**:
```typescript
import { getCachedData } from '@/lib/cache';

export async function GET(request: NextRequest) {
  const products = await getCachedData(
    'products:list',
    () => prisma.product.findMany(),
    3600  // 1 hour
  );
  return NextResponse.json(products);
}
```

---

## 🟢 LOW PRIORITY ISSUES

### Issue #13: Add Performance Monitoring
**Install Sentry**:
```bash
npm install @sentry/nextjs
```

**Initialize in** `src/instrumentation.ts`:
```typescript
import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 1.0,
});
```

---

### Issue #14: Add Component Memoization
**Before**:
```typescript
export default function Dashboard() {
  return <DashboardContent />;
}
```

**After**:
```typescript
import { memo } from 'react';

const DashboardContent = memo(() => {
  // Component code
});

export default function Dashboard() {
  return <DashboardContent />;
}
```

---

## DEPLOYMENT CHECKLIST

### Before Production
- [ ] Fix CORS (30m)
- [ ] Fix TypeScript errors (2-4h)
- [ ] Fix JWT secrets (1h)
- [ ] Enable ESLint (2-4h)
- [ ] Fix CSP (1-2h)
- [ ] Replace console.log (3-4h)
- [ ] Add tests (2-3 days)
- [ ] Fix datasheet URLs (2-3h)
- [ ] Add regional pricing (4-6h)
- [ ] Fix demo auth (30m)
- [ ] Add rate limiting (2-3h)
- [ ] Add caching (4-6h)
- [ ] Add monitoring (4-6h)

### Environment Variables Required
```
NEXTAUTH_SECRET=<random-string>
NEXTAUTH_URL=https://yourdomain.com
DATABASE_URL=postgresql://...
REDIS_URL=redis://...
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...
JWT_SECRET=<random-string>
DEMO_USERNAME=Enphase
DEMO_PASSWORD=demo123
SENTRY_DSN=https://...
```

---

## ESTIMATED TIMELINE

| Phase | Duration | Issues |
|-------|----------|--------|
| Critical Fixes | 3-5 hours | 3 issues |
| High Priority | 10-14 hours | 4 issues |
| Test Suite | 2-3 days | 1 issue |
| Medium Priority | 2-3 days | 8 issues |
| Low Priority | 1 week | 4 issues |
| **Total** | **2-3 weeks** | **19 issues** |

---

## QUICK COMMANDS

```bash
# Install dependencies
npm install

# Run tests
npm test

# Run linting
npm run lint

# Build for production
npm run build

# Start production server
npm start

# Check TypeScript
npx tsc --noEmit

# Format code
npx prettier --write "src/**/*.{ts,tsx}"
```

---

## SUPPORT

For detailed information on each issue, see:
- `QA_AUDIT_REPORT.md` - Full audit report
- `AUDIT_FINDINGS_DETAILED.md` - Detailed findings with code examples

---

**Last Updated**: 2025-07-16  
**Status**: Ready for implementation  
**Estimated Completion**: 2-3 weeks
