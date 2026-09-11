import { EnphaseVideoScraper } from './scraper';
import { ExcelExporter } from './excel-exporter';
import { LOCALES } from './locale-config';
import { ScrapeResult, ScraperStats } from './types';

async function main() {
  const isTestMode = process.argv.includes('--test');
  
  console.log('🚀 Enphase Documentation Video Scraper');
  console.log('=====================================\n');

  const scraper = new EnphaseVideoScraper();
  const exporter = new ExcelExporter();
  
  const localesToScrape = isTestMode 
    ? LOCALES.slice(0, 3)
    : LOCALES;

  if (isTestMode) {
    console.log('🧪 TEST MODE: Scraping first 3 locales only\n');
  } else {
    console.log(`📋 Scraping ${localesToScrape.length} locales\n`);
  }

  const stats: ScraperStats = {
    totalLocales: localesToScrape.length,
    successfulScrapes: 0,
    failedScrapes: 0,
    totalVideos: 0,
    startTime: new Date()
  };

  const results: ScrapeResult[] = [];

  for (let i = 0; i < localesToScrape.length; i++) {
    const locale = localesToScrape[i];
    console.log(`\n[${i + 1}/${localesToScrape.length}] Processing ${locale.country}...`);
    
    const result = await scraper.scrapeWithRetry(
      locale.locale,
      locale.country,
      locale.url
    );
    
    results.push(result);
    
    if (result.success) {
      stats.successfulScrapes++;
      stats.totalVideos += result.videos.length;
    } else {
      stats.failedScrapes++;
    }

    if (i < localesToScrape.length - 1) {
      console.log('⏳ Waiting 2 seconds before next request...');
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }

  stats.endTime = new Date();
  const durationMs = stats.endTime.getTime() - stats.startTime.getTime();
  const durationMin = Math.floor(durationMs / 60000);
  const durationSec = Math.floor((durationMs % 60000) / 1000);
  stats.duration = `${durationMin}m ${durationSec}s`;

  console.log('\n\n📊 SCRAPING SUMMARY');
  console.log('==================');
  console.log(`Total Locales: ${stats.totalLocales}`);
  console.log(`✅ Successful: ${stats.successfulScrapes}`);
  console.log(`❌ Failed: ${stats.failedScrapes}`);
  console.log(`🎥 Total Videos Found: ${stats.totalVideos}`);
  console.log(`⏱️  Duration: ${stats.duration}`);

  if (stats.failedScrapes > 0) {
    console.log('\n⚠️  Failed Locales:');
    results
      .filter(r => !r.success)
      .forEach(r => {
        console.log(`   - ${r.country} (${r.locale}): ${r.error}`);
      });
  }

  console.log('\n\n📝 Generating Excel Report...');
  const outputPath = exporter.generateOutputPath();
  await exporter.exportToExcel(results, outputPath);
  
  console.log(`✅ Excel file created: ${outputPath}`);
  console.log('\n🎉 Scraping complete!\n');

  console.log('📈 Videos per Country:');
  results
    .sort((a, b) => b.videos.length - a.videos.length)
    .forEach(r => {
      const icon = r.videos.length > 0 ? '🎥' : '📭';
      console.log(`   ${icon} ${r.country}: ${r.videos.length} video(s)`);
    });
}

main().catch(error => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});
