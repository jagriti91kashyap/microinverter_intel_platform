# Microinverter Intelligence Platform - Rollback Guide

**Version:** 0.1.0  
**Last Updated:** January 2025  
**Scope:** Emergency rollback procedures for production incidents

---

## TABLE OF CONTENTS

1. [Quick Reference](#quick-reference)
2. [Rollback Scenarios](#rollback-scenarios)
3. [Step-by-Step Procedures](#step-by-step-procedures)
4. [Data Recovery](#data-recovery)
5. [Verification Checklist](#verification-checklist)
6. [Post-Rollback Actions](#post-rollback-actions)

---

## QUICK REFERENCE

### Emergency Rollback (Production Down)
```bash
# Immediate rollback to last known good version
git checkout main
git reset --hard <last-stable-commit-hash>
npm install
npm run build
npm run start
```

### Rollback to Specific Version
```bash
# List available versions
git tag -l

# Rollback to specific version
git checkout v0.1.0
npm install
npm run build
npm run start
```

### Rollback Specific File
```bash
# Restore single file from previous commit
git checkout <commit-hash> -- src/data/products-data.ts
npm run build
```

---

## ROLLBACK SCENARIOS

### Scenario 1: Product Data Corruption
**Symptoms:**
- Dashboard shows incorrect product counts
- Search returns wrong results
- Product specifications are missing or incorrect

**Severity:** HIGH  
**RTO:** 15 minutes  
**Root Cause:** Corrupted `products-data.ts` or `comprehensive-data.ts`

**Rollback Steps:**
```bash
# 1. Identify last good commit
git log --oneline src/data/products-data.ts | head -5

# 2. Restore from previous commit
git checkout <last-good-commit> -- src/data/products-data.ts
git checkout <last-good-commit> -- src/data/comprehensive-data.ts

# 3. Rebuild and test
npm run build
npm run lint

# 4. Verify data integrity
# Check dashboard loads correctly
# Verify product count matches expected
# Test search functionality

# 5. Commit rollback
git commit -m "fix(products-data): rollback to last known good state due to data corruption"
```

### Scenario 2: Breaking API Change
**Symptoms:**
- API endpoints return 500 errors
- Frontend cannot fetch data
- Search/compare pages fail to load

**Severity:** CRITICAL  
**RTO:** 5 minutes  
**Root Cause:** Breaking change in API route or response format

**Rollback Steps:**
```bash
# 1. Identify breaking commit
git log --oneline src/app/api/ | head -10

# 2. Revert breaking commit
git revert <breaking-commit-hash>

# 3. Or reset to previous state
git reset --hard <last-good-commit>

# 4. Rebuild and test
npm run build
npm run lint

# 5. Test API endpoints
curl http://localhost:3000/api/products
curl http://localhost:3000/api/search?q=enphase

# 6. Verify frontend works
# Test dashboard, search, compare pages

# 7. Commit rollback
git commit -m "fix(api): revert breaking change in product API response format"
```

### Scenario 3: Dependency Conflict
**Symptoms:**
- Build fails with TypeScript errors
- Runtime errors about missing modules
- Package installation fails

**Severity:** HIGH  
**RTO:** 20 minutes  
**Root Cause:** Incompatible dependency version update

**Rollback Steps:**
```bash
# 1. Restore package.json and package-lock.json
git checkout <last-good-commit> -- package.json package-lock.json

# 2. Clear node_modules and reinstall
rm -rf node_modules
npm install

# 3. Rebuild
npm run build

# 4. Test application
npm run dev

# 5. Commit rollback
git commit -m "chore(deps): revert dependency update that caused build failure"
```

### Scenario 4: UI/Component Regression
**Symptoms:**
- Dashboard layout broken
- Buttons/forms not responding
- Styling issues (missing colors, fonts)

**Severity:** MEDIUM  
**RTO:** 30 minutes  
**Root Cause:** Component or styling change introduced regression

**Rollback Steps:**
```bash
# 1. Identify component change
git log --oneline src/components/ | head -10

# 2. Revert component changes
git revert <regression-commit>

# 3. Rebuild
npm run build

# 4. Test UI in browser
# Verify dashboard displays correctly
# Test all navigation
# Check responsive design

# 5. Commit rollback
git commit -m "fix(ui): revert component changes that caused layout regression"
```

### Scenario 5: Authentication Failure
**Symptoms:**
- Login page not loading
- Cannot authenticate users
- Session management broken

**Severity:** CRITICAL  
**RTO:** 5 minutes  
**Root Cause:** Authentication configuration or NextAuth.js change

**Rollback Steps:**
```bash
# 1. Check authentication files
git log --oneline src/auth.ts src/lib/auth.ts | head -5

# 2. Restore auth configuration
git checkout <last-good-commit> -- src/auth.ts src/lib/auth.ts

# 3. Verify .env.local has correct secrets
cat .env.local | grep NEXTAUTH

# 4. Rebuild
npm run build

# 5. Test login
# Navigate to /auth/signin
# Test demo login (Enphase / any password)
# Verify session is created

# 6. Commit rollback
git commit -m "fix(auth): revert authentication changes that broke login"
```

### Scenario 6: Database Schema Mismatch
**Symptoms:**
- Database queries fail
- Prisma client generation errors
- Data cannot be fetched from database

**Severity:** HIGH  
**RTO:** 30 minutes  
**Root Cause:** Schema change without migration

**Rollback Steps:**
```bash
# 1. Restore schema files
git checkout <last-good-commit> -- prisma/schema.prisma

# 2. Regenerate Prisma client
npx prisma generate

# 3. Rollback database (if using PostgreSQL)
# Get migration history
npx prisma migrate status

# Rollback to previous migration
npx prisma migrate resolve --rolled-back <migration-name>

# 4. Rebuild application
npm run build

# 5. Test database connectivity
npm run dev

# 6. Commit rollback
git commit -m "fix(db): revert schema change and rollback migration"
```

### Scenario 7: Performance Degradation
**Symptoms:**
- Dashboard loads slowly (>5 seconds)
- Search takes >2 seconds
- High CPU/memory usage

**Severity:** MEDIUM  
**RTO:** 1 hour  
**Root Cause:** Inefficient code, large data load, or missing optimization

**Rollback Steps:**
```bash
# 1. Identify performance regression
git log --oneline --all | head -20

# 2. Bisect to find breaking commit
git bisect start
git bisect bad HEAD
git bisect good <known-good-commit>
# Test each commit until found

# 3. Revert performance regression
git revert <regression-commit>

# 4. Rebuild and benchmark
npm run build
npm run dev

# 5. Verify performance improvement
# Measure dashboard load time
# Measure search response time
# Monitor CPU/memory usage

# 6. Commit rollback
git commit -m "perf: revert code change that caused performance degradation"
```

---

## STEP-BY-STEP PROCEDURES

### Procedure A: Full Application Rollback

**When to use:** Critical production incident, multiple systems affected

**Time estimate:** 10-15 minutes

```bash
# Step 1: Identify last stable version
git tag -l
# Output: v0.1.0, v0.2.0, etc.

# Step 2: Create rollback branch
git checkout -b rollback/emergency-$(date +%Y%m%d-%H%M%S)

# Step 3: Reset to last stable version
git reset --hard v0.1.0

# Step 4: Verify changes
git status
git log --oneline -5

# Step 5: Rebuild application
npm install
npm run build

# Step 6: Test critical functionality
npm run dev
# Test in browser:
# - Dashboard loads
# - Can login with demo account
# - Product search works
# - Product comparison works

# Step 7: Push rollback branch
git push origin rollback/emergency-$(date +%Y%m%d-%H%M%S)

# Step 8: Merge to main
git checkout main
git merge --no-ff rollback/emergency-$(date +%Y%m%d-%H%M%S)

# Step 9: Deploy
npm run build
npm run start

# Step 10: Verify in production
curl https://microinverterintelplatform.vercel.app/api/products
# Should return product list

# Step 11: Document incident
# Create incident report with:
# - What went wrong
# - When it was detected
# - How it was fixed
# - What was rolled back
# - Root cause analysis
```

### Procedure B: Selective File Rollback

**When to use:** Single file corruption, isolated issue

**Time estimate:** 5-10 minutes

```bash
# Step 1: Identify problematic file
# Example: src/data/products-data.ts

# Step 2: Find last good commit
git log --oneline src/data/products-data.ts | head -5

# Step 3: View file at that commit
git show <commit-hash>:src/data/products-data.ts | head -50

# Step 4: Restore file
git checkout <commit-hash> -- src/data/products-data.ts

# Step 5: Verify restoration
git diff src/data/products-data.ts

# Step 6: Test
npm run build
npm run lint

# Step 7: Commit
git commit -m "fix(products-data): restore from commit <hash> due to corruption"

# Step 8: Deploy
npm run build
npm run start
```

### Procedure C: Revert Specific Commit

**When to use:** Single bad commit, clean revert possible

**Time estimate:** 5-10 minutes

```bash
# Step 1: Identify bad commit
git log --oneline | head -10

# Step 2: Create revert commit
git revert <bad-commit-hash>

# Step 3: Resolve any conflicts (if needed)
# Edit files to resolve conflicts
git add .
git commit

# Step 4: Test
npm run build
npm run lint

# Step 5: Push
git push origin main

# Step 6: Deploy
npm run build
npm run start
```

### Procedure D: Database Rollback

**When to use:** Data corruption, schema mismatch

**Time estimate:** 30-60 minutes

```bash
# Step 1: Check migration status
npx prisma migrate status

# Step 2: Identify last good migration
npx prisma migrate history

# Step 3: Rollback to previous migration
npx prisma migrate resolve --rolled-back <migration-name>

# Step 4: Restore database backup (if available)
psql -h localhost -U postgres microinverter_platform < backup_2025-01-15.sql

# Step 5: Regenerate Prisma client
npx prisma generate

# Step 6: Rebuild application
npm run build

# Step 7: Test database connectivity
npm run dev
# Verify data loads correctly

# Step 8: Commit schema rollback
git commit -m "fix(db): rollback migration <name> due to data corruption"
```

---

## DATA RECOVERY

### Product Data Recovery

**Scenario:** Product specifications were accidentally deleted or corrupted

```bash
# Step 1: Identify when data was lost
git log --oneline --all -- src/data/products-data.ts | head -10

# Step 2: Check file at specific commit
git show <commit-hash>:src/data/products-data.ts | grep "Enphase" | head -5

# Step 3: Restore entire file
git checkout <commit-hash> -- src/data/products-data.ts

# Step 4: Or restore specific product
# Edit products-data.ts to restore specific product definition
# Use git show to view original definition

# Step 5: Verify data integrity
npm run build
npm run lint

# Step 6: Test in application
npm run dev
# Verify product appears in search
# Verify product details are correct

# Step 7: Commit recovery
git commit -m "fix(data): recover deleted product data from commit <hash>"
```

### Configuration Recovery

**Scenario:** Environment variables or configuration was lost

```bash
# Step 1: Check git history for .env files
git log --all --diff-filter=D --summary | grep ".env"

# Step 2: Restore .env.local from backup
# Note: .env files should NOT be in git
# Restore from secure backup location

# Step 3: Verify configuration
cat .env.local | grep NEXTAUTH_SECRET

# Step 4: Test application
npm run dev
# Verify authentication works
```

### Dependency Recovery

**Scenario:** Corrupted node_modules or package-lock.json

```bash
# Step 1: Restore package-lock.json
git checkout HEAD -- package-lock.json

# Step 2: Clear node_modules
rm -rf node_modules

# Step 3: Reinstall dependencies
npm ci

# Step 4: Verify installation
npm list | head -20

# Step 5: Rebuild
npm run build

# Step 6: Test
npm run dev
```

---

## VERIFICATION CHECKLIST

### Post-Rollback Verification

After any rollback, verify the following:

#### Application Startup
- [ ] Application builds without errors: `npm run build`
- [ ] No TypeScript errors: `npm run lint`
- [ ] Development server starts: `npm run dev`
- [ ] No console errors in browser

#### Core Functionality
- [ ] Dashboard page loads
- [ ] Dashboard KPI cards display correct data
- [ ] Product Library page loads
- [ ] Product search works
- [ ] Product comparison works
- [ ] Changes/News page loads
- [ ] Manufacturers page loads
- [ ] Pipeline page loads

#### Authentication
- [ ] Sign-in page loads
- [ ] Demo login works (Enphase / any password)
- [ ] Session is created
- [ ] Protected routes are accessible
- [ ] Logout works

#### Data Integrity
- [ ] Product count matches expected (167+)
- [ ] Manufacturer count matches expected (21)
- [ ] All product specifications load
- [ ] Regional variants display correctly
- [ ] Change events display correctly

#### API Endpoints
- [ ] GET /api/products returns product list
- [ ] GET /api/products/[id] returns product details
- [ ] GET /api/search?q=enphase returns results
- [ ] GET /api/manufacturers returns manufacturer list
- [ ] GET /api/dashboard/kpi returns KPI data

#### Performance
- [ ] Dashboard loads in <3 seconds
- [ ] Product search completes in <1 second
- [ ] No memory leaks (check browser DevTools)
- [ ] CPU usage is normal

#### Database (if applicable)
- [ ] Database connection successful
- [ ] Can query products table
- [ ] Can query manufacturers table
- [ ] No schema mismatches

### Rollback Verification Script

```bash
#!/bin/bash
# save as verify-rollback.sh

echo "=== Rollback Verification ==="

echo "1. Checking build..."
npm run build || exit 1

echo "2. Checking lint..."
npm run lint || exit 1

echo "3. Starting dev server..."
npm run dev &
DEV_PID=$!
sleep 5

echo "4. Testing API endpoints..."
curl -s http://localhost:3000/api/products | jq '.length' || exit 1
curl -s http://localhost:3000/api/manufacturers | jq '.length' || exit 1

echo "5. Checking dashboard..."
curl -s http://localhost:3000/dashboard | grep -q "Dashboard" || exit 1

echo "6. Stopping dev server..."
kill $DEV_PID

echo "=== Verification Complete ==="
```

---

## POST-ROLLBACK ACTIONS

### Immediate Actions (0-1 hour)

1. **Notify stakeholders**
   ```
   Subject: Production Rollback - [Service Name]
   
   A production incident required rollback to version [X.Y.Z].
   
   Impact: [Describe what was affected]
   Duration: [How long service was degraded]
   Status: [Service is now stable]
   
   Root cause analysis will follow.
   ```

2. **Document incident**
   - Create incident report
   - Record timeline of events
   - Note what was rolled back
   - Identify root cause

3. **Monitor application**
   - Watch error logs
   - Monitor performance metrics
   - Check user reports
   - Verify data integrity

### Short-term Actions (1-24 hours)

1. **Root cause analysis**
   - Identify what caused the issue
   - Review code changes
   - Check configuration changes
   - Analyze logs

2. **Create fix**
   - Develop proper fix for root cause
   - Test thoroughly
   - Get code review
   - Plan deployment

3. **Update documentation**
   - Document incident in KNOWN_ISSUES.md
   - Update runbooks
   - Add test cases to prevent recurrence

### Long-term Actions (1-7 days)

1. **Implement preventive measures**
   - Add automated tests
   - Improve CI/CD checks
   - Add monitoring/alerting
   - Update deployment procedures

2. **Post-mortem meeting**
   - Review incident with team
   - Discuss what went well
   - Discuss what could be improved
   - Assign action items

3. **Update processes**
   - Improve code review process
   - Enhance testing procedures
   - Update deployment checklist
   - Improve monitoring

---

## EMERGENCY CONTACTS

| Role | Contact | Availability |
|------|---------|--------------|
| On-call Engineer | [Name] | 24/7 |
| Engineering Manager | [Name] | Business hours |
| Product Manager | [Name] | Business hours |
| DevOps Lead | [Name] | 24/7 |

---

## APPENDIX: COMMON ROLLBACK COMMANDS

```bash
# List all tags (versions)
git tag -l

# List recent commits
git log --oneline -20

# Show specific commit
git show <commit-hash>

# Revert commit (creates new commit)
git revert <commit-hash>

# Reset to commit (destructive)
git reset --hard <commit-hash>

# Reset specific file
git checkout <commit-hash> -- <file-path>

# Create rollback branch
git checkout -b rollback/<reason> <commit-hash>

# View file at specific commit
git show <commit-hash>:<file-path>

# Find commit that deleted file
git log --diff-filter=D --summary | grep delete

# Restore deleted file
git checkout <commit-hash>^ -- <file-path>

# Squash commits before rollback
git rebase -i HEAD~5

# Force push (use with caution!)
git push -f origin main
```

---

**Last Updated:** January 2025  
**Next Review:** April 2025  
**Maintained By:** Engineering Team
