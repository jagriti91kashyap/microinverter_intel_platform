# Microinverter Research Platform - Deployment Guide

## Overview

This guide provides comprehensive instructions for deploying the AI-powered Microinverter Research Platform for Enphase employees. The platform enables discovery, research, and comparison of microinverters available in global markets.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Environment Setup](#environment-setup)
3. [Database Configuration](#database-configuration)
4. [Application Configuration](#application-configuration)
5. [Deployment Options](#deployment-options)
6. [Monitoring and Maintenance](#monitoring-and-maintenance)
7. [Troubleshooting](#troubleshooting)
8. [Security Considerations](#security-considerations)

## Prerequisites

### System Requirements

- **Node.js**: 18.x or higher
- **PostgreSQL**: 14.x or higher
- **Redis**: 6.x or higher (for caching)
- **Memory**: Minimum 4GB RAM, 8GB recommended
- **Storage**: Minimum 20GB free space
- **Network**: Stable internet connection for web search APIs

### External Services

- **OpenAI API Key**: For AI-powered data extraction
- **SerpAPI Key**: For web search integration (optional, mock service available)
- **SMTP Server**: For email notifications (optional)

### Development Tools

- **Git**: Version control
- **Docker**: Containerization (optional)
- **PM2**: Process management (recommended for production)

## Environment Setup

### 1. Clone the Repository

```bash
git clone https://github.com/enphase/microinverter-platform.git
cd microinverter-platform
```

### 2. Install Dependencies

```bash
# Install Node.js dependencies
npm install

# Or using yarn
yarn install
```

### 3. Environment Variables

Create a `.env.local` file in the root directory:

```bash
# Database Configuration
DATABASE_URL="postgresql://username:password@localhost:5432/microinverter_platform"
REDIS_URL="redis://localhost:6379"

# OpenAI Configuration
OPENAI_API_KEY="your-openai-api-key"

# Web Search Configuration
SERPAPI_KEY="your-serpapi-key" # Optional

# Application Configuration
NEXTAUTH_SECRET="your-nextauth-secret"
NEXTAUTH_URL="http://localhost:3000"

# File Storage
UPLOAD_DIR="./uploads"
PDF_STORAGE_DIR="./downloads/datasheets"

# Email Configuration (Optional)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-password"

# Logging
LOG_LEVEL="info"
LOG_FILE="./logs/application.log"

# Security
CORS_ORIGIN="http://localhost:3000"
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

## Database Configuration

### 1. PostgreSQL Setup

```bash
# Create database
createdb microinverter_platform

# Create user (optional)
createuser microinverter_user
psql -c "ALTER USER microinverter_user WITH PASSWORD 'your_password';"
psql -c "GRANT ALL PRIVILEGES ON DATABASE microinverter_platform TO microinverter_user;"
```

### 2. Run Database Migrations

```bash
# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma migrate dev

# Or for production
npx prisma migrate deploy
```

### 3. Seed Database with Sample Data

```bash
# Run the seed script
npm run seed

# Or manually seed with enhanced data
npm run seed:enhanced
```

### 4. Enhanced Schema Migration

If upgrading from an existing installation, run the enhanced schema migration:

```bash
# Apply enhanced schema
psql -d microinverter_platform -f scripts/migrate-enhanced-schema.sql
```

## Application Configuration

### 1. Build the Application

```bash
# Development build
npm run build

# Production build
npm run build:prod
```

### 2. Configuration Files

#### `next.config.js`

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ['pdf-parse']
  },
  images: {
    domains: ['enphase.com', 'solaredge.com', 'sma.de', 'solar.huawei.com', 'apsystems.com']
  },
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  }
}

module.exports = nextConfig
```

#### `prisma/schema.prisma`

Ensure the enhanced schema is properly configured:

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// Include the enhanced schema from prisma/schema-enhanced.prisma
```

## Deployment Options

### Option 1: Development Deployment

```bash
# Start development server
npm run dev

# Access the application
http://localhost:3000
```

### Option 2: Production Deployment with PM2

```bash
# Install PM2 globally
npm install -g pm2

# Create PM2 ecosystem file
cat > ecosystem.config.js << EOF
module.exports = {
  apps: [{
    name: 'microinverter-platform',
    script: 'npm',
    args: 'start',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true
  }]
}
EOF

# Start the application
pm2 start ecosystem.config.js

# Save PM2 configuration
pm2 save

# Setup PM2 startup script
pm2 startup
```

### Option 3: Docker Deployment

#### `Dockerfile`

```dockerfile
FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci --only=production

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

RUN npm run build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public

# Set the correct permission for prerender cache
RUN mkdir .next
RUN chown nextjs:nodejs .next

# Automatically leverage output traces to reduce image size
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

CMD ["node", "server.js"]
```

#### `docker-compose.yml`

```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=postgresql://postgres:password@db:5432/microinverter_platform
      - REDIS_URL=redis://redis:6379
      - OPENAI_API_KEY=${OPENAI_API_KEY}
    depends_on:
      - db
      - redis
    volumes:
      - ./uploads:/app/uploads
      - ./downloads:/app/downloads
      - ./logs:/app/logs

  db:
    image: postgres:14
    environment:
      - POSTGRES_DB=microinverter_platform
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=password
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./scripts/migrate-enhanced-schema.sql:/docker-entrypoint-initdb.d/01-migrate.sql
    ports:
      - "5432:5432"

  redis:
    image: redis:6-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data

volumes:
  postgres_data:
  redis_data:
```

#### Deploy with Docker

```bash
# Build and start containers
docker-compose up -d

# Run database migrations
docker-compose exec app npx prisma migrate deploy

# Seed database
docker-compose exec app npm run seed

# View logs
docker-compose logs -f app
```

### Option 4: Cloud Deployment

#### Vercel Deployment

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy to Vercel
vercel --prod

# Set environment variables in Vercel dashboard
vercel env add OPENAI_API_KEY
vercel env add DATABASE_URL
vercel env add SERPAPI_KEY
```

#### AWS Deployment

```bash
# Install AWS CLI and configure
aws configure

# Use AWS Amplify or Elastic Beanstalk
# For Elastic Beanstalk:
eb init microinverter-platform
eb create production-environment
eb deploy
```

## Monitoring and Maintenance

### 1. Application Monitoring

#### Health Check Endpoint

```bash
# Check application health
curl http://localhost:3000/api/health
```

#### Monitoring Setup

```bash
# Install monitoring tools
npm install @sentry/nextjs @sentry/tracing

# Configure Sentry in next.config.js
const { withSentryConfig } = require('@sentry/nextjs');

module.exports = withSentryConfig({
  // Your existing config
});
```

### 2. Database Monitoring

```bash
# Check database connections
psql -d microinverter_platform -c "SELECT count(*) FROM pg_stat_activity;"

# Monitor slow queries
psql -d microinverter_platform -c "SELECT query, mean_time, calls FROM pg_stat_statements ORDER BY mean_time DESC LIMIT 10;"
```

### 3. Log Management

```bash
# Set up log rotation
sudo nano /etc/logrotate.d/microinverter-platform

# Log rotation configuration
/var/log/microinverter-platform/*.log {
    daily
    missingok
    rotate 52
    compress
    delaycompress
    notifempty
    create 644 nextjs nextjs
    postrotate
        pm2 reloadLogs
    endscript
}
```

### 4. Backup Strategy

```bash
# Database backup script
#!/bin/bash
BACKUP_DIR="/backups/microinverter-platform"
DATE=$(date +%Y%m%d_%H%M%S)

# Create backup
pg_dump -h localhost -U postgres microinverter_platform > "$BACKUP_DIR/backup_$DATE.sql"

# Compress old backups
find $BACKUP_DIR -name "backup_*.sql" -mtime +7 -exec gzip {} \;

# Remove backups older than 30 days
find $BACKUP_DIR -name "backup_*.sql.gz" -mtime +30 -delete
```

## Troubleshooting

### Common Issues

#### 1. Database Connection Errors

```bash
# Check PostgreSQL status
sudo systemctl status postgresql

# Check connection
psql -h localhost -U postgres -d microinverter_platform

# Reset connection pool
npx prisma migrate reset
```

#### 2. OpenAI API Issues

```bash
# Test API key
curl -H "Authorization: Bearer $OPENAI_API_KEY" https://api.openai.com/v1/models

# Check rate limits
grep "rate limit" logs/application.log
```

#### 3. PDF Processing Issues

```bash
# Check PDF dependencies
npm list pdf-parse

# Verify file permissions
ls -la downloads/datasheets/

# Test PDF processing
node -e "const pdf = require('pdf-parse'); console.log('PDF parsing works');"
```

#### 4. Memory Issues

```bash
# Check memory usage
free -h

# Monitor Node.js process
ps aux | grep node

# Increase Node.js memory limit
export NODE_OPTIONS="--max-old-space-size=4096"
```

### Performance Optimization

#### 1. Database Indexing

```sql
-- Create missing indexes
CREATE INDEX CONCURRENTLY idx_products_manufacturer_status ON products(manufacturer_id, status);
CREATE INDEX CONCURRENTLY idx_specifications_product_category ON product_specifications(product_id, category);
CREATE INDEX CONCURRENTLY idx_crawl_jobs_status_created ON crawl_jobs(status, created_at);
```

#### 2. Caching Strategy

```bash
# Configure Redis caching
redis-cli CONFIG SET maxmemory 256mb
redis-cli CONFIG SET maxmemory-policy allkeys-lru
```

#### 3. CDN Configuration

```javascript
// next.config.js - CDN setup
module.exports = {
  assetPrefix: process.env.NODE_ENV === 'production' ? 'https://cdn.yourdomain.com' : '',
  images: {
    loader: 'custom',
    loaderFile: './my-loader.ts',
  },
}
```

## Security Considerations

### 1. Environment Security

```bash
# Secure environment variables
chmod 600 .env.local

# Use secrets management
kubectl create secret generic app-secrets --from-env-file=.env.local
```

### 2. Database Security

```sql
-- Restrict database access
REVOKE ALL ON SCHEMA public FROM PUBLIC;
GRANT USAGE ON SCHEMA public TO microinverter_user;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO microinverter_user;

-- Enable row level security
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
```

### 3. API Security

```javascript
// Rate limiting middleware
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP'
});

app.use('/api/', limiter);
```

### 4. SSL/TLS Configuration

```bash
# Generate SSL certificate
sudo certbot --nginx -d yourdomain.com

# Configure HTTPS in next.config.js
module.exports = {
  forceSsl: true,
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains',
          },
        ],
      },
    ];
  },
};
```

## Support and Maintenance

### Regular Maintenance Tasks

1. **Weekly**:
   - Check application logs for errors
   - Monitor database performance
   - Update security patches

2. **Monthly**:
   - Review and optimize database queries
   - Update dependencies
   - Clean up old backup files

3. **Quarterly**:
   - Perform security audit
   - Review and update documentation
   - Plan feature updates

### Contact Information

- **Technical Support**: tech-support@enphase.com
- **Documentation**: https://docs.enphase.com/microinverter-platform
- **GitHub Issues**: https://github.com/enphase/microinverter-platform/issues

### Version History

- **v1.0.0**: Initial release with core functionality
- **v1.1.0**: Enhanced AI extraction and web search
- **v1.2.0**: Advanced UI with dark mode and enterprise design
- **v1.3.0**: Comprehensive sample data and deployment automation

---

**Note**: This deployment guide is maintained alongside the application. For the most up-to-date information, always refer to the latest version in the repository.
