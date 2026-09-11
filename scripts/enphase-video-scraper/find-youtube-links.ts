import { chromium } from 'playwright';
import { LOCALES } from './locale-config';

interface YouTubeLink {
  locale: string;
  country: string;
  url: string;
  linkText: string;
  linkUrl: string;
}

async function findYouTubeLinks() {
  console.log('🔍 Finding YouTube Channel Links\n');
  
  const results: YouTubeLink[] = [];
  
  const browser = await chromium.launch({ 
    headless: true,
    args: ['--disable-dev-shm-usage', '--no-sandbox']
  });

  for (let i = 0; i < LOCALES.length; i++) {
    const locale = LOCALES[i];
    console.log(`[${i + 1}/${LOCALES.length}] Checking ${locale.country} (${locale.locale})...`);
    
    try {
      const page = await browser.newPage();
      await page.goto(locale.url, { 
        waitUntil: 'domcontentloaded',
        timeout: 30000 
      });

      const youtubeLinks = await page.evaluate(() => {
        const links: Array<{ text: string; url: string }> = [];
        const allLinks = document.querySelectorAll('a[href]');
        
        allLinks.forEach((link: any) => {
          const href = link.href;
          if (href && (
            href.includes('youtube.com/channel') ||
            href.includes('youtube.com/c/') ||
            href.includes('youtube.com/@') ||
            href.includes('youtube.com/user')
          )) {
            links.push({
              text: link.textContent?.trim() || 'YouTube Link',
              url: href
            });
          }
        });
        
        return links;
      });

      if (youtubeLinks.length > 0) {
        youtubeLinks.forEach(yt => {
          results.push({
            locale: locale.locale,
            country: locale.country,
            url: locale.url,
            linkText: yt.text,
            linkUrl: yt.url
          });
        });
        console.log(`  ✅ Found ${youtubeLinks.length} YouTube link(s)`);
      } else {
        console.log(`  ⚪ No YouTube links found`);
      }

      await page.close();
      
      if (i < LOCALES.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
      
    } catch (error) {
      console.log(`  ❌ Error: ${error instanceof Error ? error.message : 'Unknown'}`);
    }
  }

  await browser.close();

  console.log('\n\n📊 RESULTS');
  console.log('==========\n');
  
  if (results.length === 0) {
    console.log('No YouTube channel links found on any documentation pages.');
  } else {
    console.log(`Found ${results.length} YouTube link(s):\n`);
    
    const uniqueUrls = new Set<string>();
    results.forEach(r => {
      if (!uniqueUrls.has(r.linkUrl)) {
        uniqueUrls.add(r.linkUrl);
        console.log(`🎥 ${r.linkUrl}`);
        console.log(`   Countries: ${results.filter(x => x.linkUrl === r.linkUrl).map(x => x.country).join(', ')}`);
        console.log('');
      }
    });
  }
}

findYouTubeLinks().catch(console.error);
