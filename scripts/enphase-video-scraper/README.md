# Enphase Documentation Video Scraper

Automated web scraper that extracts video links from Enphase country-specific documentation centers across 29 European locales.

## Features

- 🌍 Scrapes 29 country-specific documentation centers
- 🎥 Detects YouTube, Vimeo, and direct video links
- 📊 Exports to Excel with separate sheets per country
- 🔄 Automatic retry logic for failed requests
- ⏱️ Rate limiting to respect server resources
- 📝 Detailed progress logging and statistics

## Installation

```bash
npm install
```

This will install:
- `playwright` - Headless browser automation
- `exceljs` - Excel file generation
- `tsx` - TypeScript execution
- `typescript` - TypeScript compiler

After installation, install Playwright browsers:
```bash
npx playwright install chromium
```

## Usage

### Full Scrape (All 29 Locales)

```bash
npm run scrape
```

This will:
1. Scrape all 29 documentation centers
2. Extract video links with metadata
3. Generate Excel file in `output/` directory
4. Display summary statistics

### Test Mode (First 3 Locales Only)

```bash
npm run test
```

Use this to verify the scraper works before running the full scrape.

## Output

Excel file: `output/enphase-videos-YYYY-MM-DD.xlsx`

Each country gets its own sheet with columns:
- **Category** - Document category/section
- **Document Name** - Title of the document/video
- **Document Type** - Video format (YouTube, Vimeo, MP4, etc.)
- **URL** - Clickable hyperlink to the video

## Supported Locales

| Locale | Country |
|--------|---------|
| de-de | Germany |
| de-at | Austria |
| de-ch | Switzerland (DE) |
| fr-fr | France |
| fr-be | Belgium (FR) |
| fr-ch | Switzerland (FR) |
| nl-nl | Netherlands |
| nl-be | Belgium (NL) |
| it-it | Italy |
| es-es | Spain |
| pt-pt | Portugal |
| en-gb | United Kingdom |
| en-ie | Ireland |
| sv-se | Sweden |
| da-dk | Denmark |
| nb-no | Norway |
| pl-pl | Poland |
| el-gr | Greece |
| tr-tr | Turkey |
| ro-ro | Romania |
| hu-hu | Hungary |
| bg-bg | Bulgaria |
| hr-hr | Croatia |
| sk-sk | Slovakia |
| lt-lt | Lithuania |
| lv-lv | Latvia |
| et-ee | Estonia |
| sl-si | Slovenia |
| sr-rs | Serbia |

## How It Works

1. **Browser Automation**: Uses Playwright to load each documentation page
2. **Video Detection**: Scans for:
   - YouTube/Vimeo iframes
   - `<video>` tags with sources
   - Links to video files (.mp4, .webm, etc.)
   - Video platform URLs in anchor tags
3. **Metadata Extraction**: Captures category, title, and type for each video
4. **Excel Generation**: Creates formatted workbook with hyperlinks
5. **Error Handling**: Retries failed requests, continues on errors

## Estimated Runtime

- Test mode (3 locales): ~1-2 minutes
- Full scrape (29 locales): ~10-15 minutes

Runtime depends on:
- Page load times
- Number of videos per locale
- Network speed
- Server response times

## Troubleshooting

**Error: "Executable doesn't exist"**
```bash
npx playwright install chromium
```

**Error: "Cannot find module 'playwright'"**
```bash
npm install
```

**Slow scraping**
- Adjust wait times in `scraper.ts` (line with `waitForTimeout`)
- Check network connection
- Some locales may have slower servers

**No videos found**
- Some locales may not have video content
- Page structure may differ (check console logs)
- Videos may be behind authentication

## Technical Details

- **Language**: TypeScript
- **Browser**: Chromium (via Playwright)
- **Node Version**: 20+
- **Output Format**: Excel (.xlsx)

## Files

- `index.ts` - Main orchestrator
- `scraper.ts` - Web scraping logic
- `excel-exporter.ts` - Excel generation
- `locale-config.ts` - Country/URL mappings
- `types.ts` - TypeScript interfaces
- `package.json` - Dependencies
- `tsconfig.json` - TypeScript config
