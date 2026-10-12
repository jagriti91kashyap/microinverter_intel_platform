# Git Initialization & Setup Guide

**Project:** Microinverter Intelligence Platform  
**Version:** 0.1.0  
**Date:** January 2025  
**Estimated Time:** 2-3 hours

---

## QUICK START

```bash
# 1. Navigate to project directory
cd C:\Users\jkashyap\CascadeProjects\microinverter-platform

# 2. Initialize git repository
git init

# 3. Configure git user
git config user.name "Your Name"
git config user.email "your.email@enphase.com"

# 4. Add all files
git add .

# 5. Create initial commit
git commit -m "chore(init): initialize microinverter platform repository

- 167 products across 21 manufacturers
- 54+ countries supported
- 91 change events documented
- Comprehensive product specifications and certifications
- Multi-language crawler support
- Interactive manufacturer map feature
- NextAuth.js authentication with demo credentials
- Tailwind CSS + shadcn/ui component library
- Recharts data visualization
- Prisma ORM with PostgreSQL support (optional)
- Redis queue support (optional)
- OpenAI and Anthropic AI integrations

Technology Stack:
- Next.js 15.1.0
- React 19.0.0
- TypeScript 5
- Tailwind CSS 4.3.2
- Prisma 5.19.1
- NextAuth.js 4.24.7

See AGENTS.md for comprehensive project documentation."

# 6. Create version tag
git tag -a v0.1.0 -m "Initial release with core functionality"

# 7. Create develop branch
git checkout -b develop

# 8. Verify setup
git branch -a
git tag -l
git log --oneline -5
```

---

## DETAILED SETUP STEPS

### Step 1: Initialize Repository

```bash
# Navigate to project directory
cd C:\Users\jkashyap\CascadeProjects\microinverter-platform

# Initialize git
git init

# Verify initialization
ls -la .git
```

**Expected output:**
```
.git/
├── HEAD
├── config
├── description
├── hooks/
├── info/
├── objects/
└── refs/
```

### Step 2: Configure Git User

```bash
# Set user name (local to this repository)
git config user.name "Your Name"

# Set user email
git config user.email "your.email@enphase.com"

# Verify configuration
git config --list | grep user
```

**Optional: Set globally (for all repositories)**
```bash
git config --global user.name "Your Name"
git config --global user.email "your.email@enphase.com"
```

### Step 3: Review .gitignore

The `.gitignore` file is already configured. Verify it includes:

```bash
# View .gitignore
cat .gitignore

# Should include:
# - /node_modules
# - /.next/
# - /build
# - .env*
# - .DS_Store
# - *.pem
# - /logs/
# - /uploads/
# - /downloads/
```

### Step 4: Stage Files

```bash
# Stage all files
git add .

# Verify staged files
git status

# Or stage selectively
git add src/
git add package.json
git add README.md
```

### Step 5: Create Initial Commit

```bash
# Create commit with detailed message
git commit -m "chore(init): initialize microinverter platform repository

- 167 products across 21 manufacturers
- 54+ countries supported
- 91 change events documented
- Comprehensive product specifications and certifications
- Multi-language crawler support
- Interactive manufacturer map feature
- NextAuth.js authentication with demo credentials
- Tailwind CSS + shadcn/ui component library
- Recharts data visualization
- Prisma ORM with PostgreSQL support (optional)
- Redis queue support (optional)
- OpenAI and Anthropic AI integrations

Technology Stack:
- Next.js 15.1.0
- React 19.0.0
- TypeScript 5
- Tailwind CSS 4.3.2
- Prisma 5.19.1
- NextAuth.js 4.24.7

See AGENTS.md for comprehensive project documentation."

# Verify commit
git log --oneline -1
```

### Step 6: Create Version Tag

```bash
# Create annotated tag
git tag -a v0.1.0 -m "Initial release with core functionality

Features:
- Dashboard with KPI cards and trend charts
- Product Library with advanced filtering
- Product comparison (up to 4 products)
- Change events timeline (91 events, 2023-2026)
- Manufacturer directory with interactive map
- AI pipeline for data extraction
- Multi-language crawler (10 languages)

Data:
- 167 verified products
- 21 manufacturers
- 54+ countries
- 91 change events

See AGENTS.md for full documentation."

# List tags
git tag -l

# Show tag details
git show v0.1.0
```

### Step 7: Create Develop Branch

```bash
# Create and switch to develop branch
git checkout -b develop

# Verify branch creation
git branch -a

# Expected output:
# * develop
#   main (or master)
```

### Step 8: Create Feature Branch Template

```bash
# Create example feature branches (don't commit to these yet)
git checkout -b feature/example-feature
git checkout develop

# These branches are just for reference
# Delete them after reviewing
git branch -d feature/example-feature
```

---

## GITHUB SETUP (Optional)

If you want to push to GitHub:

### Step 1: Create GitHub Repository

1. Go to https://github.com/new
2. Repository name: `microinverter-platform`
3. Description: "AI-powered global microinverter product intelligence platform"
4. Visibility: Private (or Public if approved)
5. Do NOT initialize with README, .gitignore, or license
6. Click "Create repository"

### Step 2: Add Remote

```bash
# Add remote (replace USERNAME with your GitHub username)
git remote add origin https://github.com/USERNAME/microinverter-platform.git

# Verify remote
git remote -v

# Expected output:
# origin  https://github.com/USERNAME/microinverter-platform.git (fetch)
# origin  https://github.com/USERNAME/microinverter-platform.git (push)
```

### Step 3: Push to GitHub

```bash
# Push main branch
git push -u origin main

# Push develop branch
git push -u origin develop

# Push tags
git push origin --tags

# Verify
git branch -a
git tag -l
```

---

## COMMIT CONVENTIONS SETUP

### Create CONTRIBUTING.md

```bash
# Create file
cat > CONTRIBUTING.md << 'EOF'
# Contributing to Microinverter Intelligence Platform

## Commit Message Convention

We follow a structured commit message format to maintain clear history and enable automated changelog generation.

### Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, missing semicolons, etc.)
- `refactor`: Code refactoring without feature changes
- `perf`: Performance improvements
- `test`: Test additions or modifications
- `chore`: Build, dependency, or tooling changes
- `data`: Data model or product data changes

### Scope

- `dashboard` - Dashboard page
- `search` - Product search/library
- `compare` - Product comparison
- `products-data` - Product data
- `auth` - Authentication
- `api` - API routes
- `ui` - UI components
- `deps` - Dependencies
- `db` - Database/Prisma
- `docs` - Documentation

### Subject

- Use imperative mood ("add" not "added")
- Don't capitalize first letter
- No period at end
- 50 characters or less

### Body

- Explain WHY, not WHAT
- Wrap at 72 characters
- Separate from subject with blank line
- Include context and motivation

### Footer

- Reference issues: `Closes #123` or `Refs #456`
- Note breaking changes: `BREAKING CHANGE: description`

### Examples

```
feat(products-data): add Anker SOLIX Solarbank 4 E5000 Pro

- Added new product with 5kWh capacity
- Updated efficiency corrections map
- Added regional variants for NA and EU
- Verified specs against official datasheet

Closes #123
```

```
fix(dashboard): correct KPI calculation for global product updates

- Fixed date range filter for "Since Jan 2023"
- Updated change event count from 87 to 91
- Verified against comprehensive-data.ts

Refs #456
```

```
data(products-data): update Enphase IQ8P regional variants

- Added EU per-country variants (EU-DE, EU-FR, etc.)
- Updated regional variants map with 2-letter country codes
- Verified against Enphase INT datasheet

Refs #789
```

## Branch Naming Convention

- `feature/<feature-name>` - New features
- `bugfix/<bug-name>` - Bug fixes
- `hotfix/<issue>` - Critical production fixes
- `chore/<task>` - Maintenance tasks
- `docs/<topic>` - Documentation updates

## Pull Request Process

1. Create feature branch from `develop`
2. Make changes and commit with proper messages
3. Push to remote
4. Create Pull Request with description
5. Ensure CI/CD checks pass
6. Request code review
7. Address review comments
8. Merge when approved

## Code Style

- Use TypeScript strict mode
- Run `npm run lint` before committing
- Run `npm run build` to verify build
- Follow existing code patterns

## Testing

- Add tests for new features
- Ensure all tests pass: `npm run test`
- Maintain >80% code coverage

## Documentation

- Update README.md for user-facing changes
- Update AGENTS.md for architecture changes
- Update CHANGELOG.md for releases
- Add inline comments for complex logic

EOF

git add CONTRIBUTING.md
git commit -m "docs: add contributing guidelines with commit conventions"
```

### Create .github/PULL_REQUEST_TEMPLATE.md

```bash
# Create directory
mkdir -p .github

# Create template
cat > .github/PULL_REQUEST_TEMPLATE.md << 'EOF'
## Description

Brief description of changes.

## Type of Change

- [ ] Bug fix (non-breaking change that fixes an issue)
- [ ] New feature (non-breaking change that adds functionality)
- [ ] Breaking change (fix or feature that would cause existing functionality to change)
- [ ] Documentation update

## Related Issues

Closes #(issue number)

## Testing

Describe how you tested these changes.

- [ ] Unit tests added/updated
- [ ] Integration tests added/updated
- [ ] Manual testing completed

## Checklist

- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Comments added for complex logic
- [ ] Documentation updated
- [ ] No new warnings generated
- [ ] Tests pass locally
- [ ] Build succeeds

## Screenshots (if applicable)

Add screenshots for UI changes.

EOF

git add .github/PULL_REQUEST_TEMPLATE.md
git commit -m "docs: add pull request template"
```

---

## BRANCH PROTECTION SETUP (GitHub)

If using GitHub, set up branch protection:

1. Go to repository Settings
2. Click "Branches" in left sidebar
3. Click "Add rule" under "Branch protection rules"
4. Branch name pattern: `main`
5. Enable:
   - ✅ Require pull request reviews before merging
   - ✅ Require status checks to pass before merging
   - ✅ Require branches to be up to date before merging
   - ✅ Include administrators
6. Click "Create"

Repeat for `develop` branch with less strict settings.

---

## VERIFICATION CHECKLIST

After setup, verify everything is working:

```bash
# Check git status
git status
# Expected: "On branch main" or "On branch develop"

# Check commits
git log --oneline -5
# Expected: Initial commit visible

# Check tags
git tag -l
# Expected: v0.1.0 visible

# Check branches
git branch -a
# Expected: main (or master) and develop visible

# Check remote (if GitHub)
git remote -v
# Expected: origin URLs visible

# Verify build
npm install
npm run build
# Expected: Build succeeds

# Verify lint
npm run lint
# Expected: No errors
```

---

## NEXT STEPS

After initialization:

### Week 1
- [ ] Initialize git repository ✓
- [ ] Create initial commit ✓
- [ ] Create version tag ✓
- [ ] Create develop branch ✓
- [ ] Create CONTRIBUTING.md ✓
- [ ] Create PR template ✓

### Week 2-3
- [ ] Set up GitHub Actions CI/CD
- [ ] Create automated linting
- [ ] Create automated build checks
- [ ] Create automated testing

### Week 4-6
- [ ] Implement semantic versioning
- [ ] Create CHANGELOG.md
- [ ] Set up error tracking
- [ ] Create deployment checklist

---

## TROUBLESHOOTING

### Issue: "fatal: not a git repository"

**Solution:**
```bash
# Make sure you're in the correct directory
cd C:\Users\jkashyap\CascadeProjects\microinverter-platform

# Verify .git directory exists
ls -la .git

# If not, reinitialize
git init
```

### Issue: "Please tell me who you are"

**Solution:**
```bash
# Configure git user
git config user.name "Your Name"
git config user.email "your.email@enphase.com"
```

### Issue: "fatal: pathspec 'src/' did not match any files"

**Solution:**
```bash
# Make sure you're in the project root
pwd
# Should show: /c/Users/jkashyap/CascadeProjects/microinverter-platform

# List files to verify
ls -la
# Should show: src/, package.json, README.md, etc.
```

### Issue: "Everything up-to-date" when pushing

**Solution:**
```bash
# Make sure you have commits
git log --oneline
# Should show at least one commit

# If no commits, create one
git add .
git commit -m "Initial commit"

# Then push
git push -u origin main
```

---

## USEFUL GIT COMMANDS

```bash
# View commit history
git log --oneline -10

# View changes since last commit
git diff

# View changes in staged files
git diff --staged

# Create new branch
git checkout -b feature/new-feature

# Switch branch
git checkout develop

# Merge branch
git merge feature/new-feature

# Delete branch
git branch -d feature/new-feature

# View all branches
git branch -a

# View remote branches
git branch -r

# Push branch to remote
git push -u origin feature/new-feature

# Pull latest changes
git pull origin develop

# Create tag
git tag -a v0.2.0 -m "Release notes"

# Push tags
git push origin --tags

# View tag details
git show v0.1.0

# Revert commit
git revert <commit-hash>

# Reset to previous commit
git reset --hard <commit-hash>

# Stash changes
git stash

# Apply stashed changes
git stash pop
```

---

## RESOURCES

- [Git Documentation](https://git-scm.com/doc)
- [GitHub Guides](https://guides.github.com/)
- [Conventional Commits](https://www.conventionalcommits.org/)
- [Semantic Versioning](https://semver.org/)
- [Keep a Changelog](https://keepachangelog.com/)

---

**Setup Time:** 2-3 hours  
**Maintenance:** 5 minutes per commit  
**Review Date:** April 2025
