import { chromium } from 'playwright';
import ExcelJS from 'exceljs';

const LOCALES = [
  { locale: 'de-de', country: 'Germany', url: 'https://enphase.com/de-de/installers/resources/documentation' },
  { locale: 'de-at', country: 'Austria', url: 'https://enphase.com/de-at/installers/resources/documentation' },
  { locale: 'de-ch', country: 'Switzerland (DE)', url: 'https://enphase.com/de-ch/installers/resources/documentation' },
  { locale: 'fr-fr', country: 'France', url: 'https://enphase.com/fr-fr/installers/resources/documentation' },
  { locale: 'fr-be', country: 'Belgium (FR)', url: 'https://enphase.com/fr-be/installers/resources/documentation' },
  { locale: 'fr-ch', country: 'Switzerland (FR)', url: 'https://enphase.com/fr-ch/installers/resources/documentation' },
  { locale: 'nl-nl', country: 'Netherlands', url: 'https://enphase.com/nl-nl/installers/resources/documentation' },
  { locale: 'nl-be', country: 'Belgium (NL)', url: 'https://enphase.com/nl-be/installers/resources/documentation' },
  { locale: 'it-it', country: 'Italy', url: 'https://enphase.com/it-it/installers/resources/documentation' },
  { locale: 'es-es', country: 'Spain', url: 'https://enphase.com/es-es/installers/resources/documentation' },
  { locale: 'pt-pt', country: 'Portugal', url: 'https://enphase.com/pt-pt/installers/resources/documentation' },
  { locale: 'en-gb', country: 'United Kingdom', url: 'https://enphase.com/en-gb/installers/resources/documentation' },
  { locale: 'en-ie', country: 'Ireland', url: 'https://enphase.com/en-ie/installers/resources/documentation' },
  { locale: 'sv-se', country: 'Sweden', url: 'https://enphase.com/sv-se/installers/resources/documentation' },
  { locale: 'da-dk', country: 'Denmark', url: 'https://enphase.com/da-dk/installers/resources/documentation' },
  { locale: 'nb-no', country: 'Norway', url: 'https://enphase.com/nb-no/installers/resources/documentation' },
  { locale: 'pl-pl', country: 'Poland', url: 'https://enphase.com/pl-pl/installers/resources/documentation' },
  { locale: 'el-gr', country: 'Greece', url: 'https://enphase.com/el-gr/installers/resources/documentation' },
  { locale: 'tr-tr', country: 'Turkey', url: 'https://enphase.com/tr-tr/installers/resources/documentation' },
  { locale: 'ro-ro', country: 'Romania', url: 'https://enphase.com/ro-ro/installers/resources/documentation' },
  { locale: 'hu-hu', country: 'Hungary', url: 'https://enphase.com/hu-hu/installers/resources/documentation' },
  { locale: 'bg-bg', country: 'Bulgaria', url: 'https://enphase.com/bg-bg/installers/resources/documentation' },
  { locale: 'hr-hr', country: 'Croatia', url: 'https://enphase.com/hr-hr/installers/resources/documentation' },
  { locale: 'sk-sk', country: 'Slovakia', url: 'https://enphase.com/sk-sk/installers/resources/documentation' },
  { locale: 'lt-lt', country: 'Lithuania', url: 'https://enphase.com/lt-lt/installers/resources/documentation' },
  { locale: 'lv-lv', country: 'Latvia', url: 'https://enphase.com/lv-lv/installers/resources/documentation' },
  { locale: 'et-ee', country: 'Estonia', url: 'https://enphase.com/et-ee/installers/resources/documentation' },
  { locale: 'sl-si', country: 'Slovenia', url: 'https://enphase.com/sl-si/installers/resources/documentation' },
  { locale: 'sr-rs', country: 'Serbia', url: 'https://enphase.com/sr-rs/installers/resources/documentation' },
];

interface VideoData {
  country: string;
  locale: string;
  category: string;
  documentName: string;
  documentType: string;
  url: string;
}

async function findYouTubeVideos() {
  console.log('🎥 Enphase YouTube Video Link Finder');
  console.log('====================================\n');
  
  const allVideos: VideoData[] = [];
  const browser = await chromium.launch({ headless: true });

  for (let i = 0; i < LOCALES.length; i++) {
    const locale = LOCALES[i];
    console.log(`[${i + 1}/${LOCALES.length}] ${locale.country}...`);
    
    try {
      const page = await browser.newPage();
      await page.goto(locale.url, { waitUntil: 'domcontentloaded', timeout: 30000 });
      await page.waitForTimeout(1500);

      const videos = await page.evaluate(() => {
        const results: any[] = [];
        const links = document.querySelectorAll('a[href]');
        
        links.forEach((link: any) => {
          const href = link.href;
          if (href && (href.includes('youtube.com/watch') || href.includes('youtu.be/'))) {
            results.push({
              text: link.textContent?.trim() || 'YouTube Video',
              url: href
            });
          }
        });
        
        return results;
      });

      videos.forEach(v => {
        allVideos.push({
          country: locale.country,
          locale: locale.locale,
          category: 'General',
          documentName: v.text,
          documentType: 'YouTube',
          url: v.url
        });
      });

      console.log(`  ✅ Found ${videos.length} video(s)`);
      await page.close();
      
    } catch (error) {
      console.log(`  ❌ Error`);
    }
  }

  await browser.close();

  console.log(`\n📊 Total: ${allVideos.length} YouTube videos found\n`);

  const workbook = new ExcelJS.Workbook();
  
  const countriesWithVideos = [...new Set(allVideos.map(v => v.country))];
  
  LOCALES.forEach(locale => {
    const sheetName = `${locale.country} (${locale.locale})`.substring(0, 31);
    const worksheet = workbook.addWorksheet(sheetName);

    worksheet.columns = [
      { header: 'Category', key: 'category', width: 20 },
      { header: 'Document Name', key: 'documentName', width: 50 },
      { header: 'Document Type', key: 'documentType', width: 15 },
      { header: 'URL', key: 'url', width: 80 }
    ];

    const headerRow = worksheet.getRow(1);
    headerRow.font = { bold: true };
    headerRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFD9D9D9' } };

    const countryVideos = allVideos.filter(v => v.country === locale.country);
    countryVideos.forEach(video => {
      const row = worksheet.addRow({
        category: video.category,
        documentName: video.documentName,
        documentType: video.documentType,
        url: video.url
      });
      
      const urlCell = row.getCell(4);
      urlCell.value = { text: video.url, hyperlink: video.url };
      urlCell.font = { color: { argb: 'FF0563C1' }, underline: true };
    });

    worksheet.autoFilter = { from: 'A1', to: 'D1' };
  });

  const outputPath = `output/enphase-youtube-videos-${new Date().toISOString().split('T')[0]}.xlsx`;
  await workbook.xlsx.writeFile(outputPath);
  
  console.log(`✅ Excel saved: ${outputPath}\n`);
  
  if (allVideos.length > 0) {
    console.log('📋 Summary by Country:');
    LOCALES.forEach(locale => {
      const count = allVideos.filter(v => v.country === locale.country).length;
      if (count > 0) {
        console.log(`  🎥 ${locale.country}: ${count} video(s)`);
      }
    });
  }
}

findYouTubeVideos().catch(console.error);
