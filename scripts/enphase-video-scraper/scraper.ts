import { chromium, Page } from 'playwright';
import { VideoLink, ScrapeResult } from './types';

export class EnphaseVideoScraper {
  private async extractVideosFromPage(page: Page): Promise<VideoLink[]> {
    const videos: VideoLink[] = [];

    const videoElements = await page.evaluate(function() {
      const results: Array<{
        url: string;
        title: string;
        category: string;
        type: string;
      }> = [];

      const iframes = document.querySelectorAll('iframe');
      iframes.forEach((iframe: any) => {
        const src = iframe.src;
        if (src && (src.includes('youtube.com') || src.includes('youtu.be') || src.includes('vimeo.com'))) {
          let type = 'Video';
          if (src.includes('youtube.com') || src.includes('youtu.be')) type = 'YouTube';
          if (src.includes('vimeo.com')) type = 'Vimeo';
          
          let title = 'Untitled';
          const parent = iframe.closest('div, article, section');
          if (parent) {
            const heading = parent.querySelector('h1, h2, h3, h4, h5, h6');
            if (heading && heading.textContent) {
              title = heading.textContent.trim();
            }
          }
          
          let category = 'General';
          const section = iframe.closest('section, article');
          if (section) {
            const sectionHeading = section.querySelector('h1, h2, h3, h4');
            if (sectionHeading && sectionHeading.textContent) {
              category = sectionHeading.textContent.trim();
            }
          }
          
          results.push({
            url: src,
            title: title,
            category: category,
            type: type
          });
        }
      });

      const videoTags = document.querySelectorAll('video');
      videoTags.forEach((video: any) => {
        const src = video.src || (video.querySelector('source') as any)?.src;
        if (src) {
          let title = 'Untitled';
          const parent = video.closest('div, article, section');
          if (parent) {
            const heading = parent.querySelector('h1, h2, h3, h4, h5, h6');
            if (heading && heading.textContent) {
              title = heading.textContent.trim();
            }
          }
          
          let category = 'General';
          const section = video.closest('section, article');
          if (section) {
            const sectionHeading = section.querySelector('h1, h2, h3, h4');
            if (sectionHeading && sectionHeading.textContent) {
              category = sectionHeading.textContent.trim();
            }
          }
          
          results.push({
            url: src,
            title: title,
            category: category,
            type: 'Video (MP4/WebM)'
          });
        }
      });

      const links = document.querySelectorAll('a[href]');
      links.forEach((link: any) => {
        const href = link.href;
        if (href && (
          href.includes('youtube.com/watch') ||
          href.includes('youtu.be/') ||
          href.includes('vimeo.com/') ||
          href.match(/\.(mp4|webm|mov|avi)$/i)
        )) {
          let type = 'Video Link';
          if (href.includes('youtube.com') || href.includes('youtu.be')) type = 'YouTube';
          if (href.includes('vimeo.com')) type = 'Vimeo';
          if (href.match(/\.(mp4|webm|mov|avi)$/i)) type = 'Video File';
          
          let title = link.textContent?.trim() || 'Untitled';
          
          let category = 'General';
          const section = link.closest('section, article');
          if (section) {
            const sectionHeading = section.querySelector('h1, h2, h3, h4');
            if (sectionHeading && sectionHeading.textContent) {
              category = sectionHeading.textContent.trim();
            }
          }
          
          results.push({
            url: href,
            title: title,
            category: category,
            type: type
          });
        }
      });

      const uniqueResults = Array.from(
        new Map(results.map((item: any) => [item.url, item])).values()
      );

      return uniqueResults;
    });

    videoElements.forEach(video => {
      videos.push({
        category: video.category,
        documentName: video.title,
        documentType: video.type,
        url: video.url
      });
    });

    return videos;
  }

  async scrapeLocale(locale: string, country: string, url: string): Promise<ScrapeResult> {
    console.log(`🔍 Scraping ${country} (${locale})...`);
    
    let browser = null;
    try {
      browser = await chromium.launch({ 
        headless: true,
        args: ['--disable-dev-shm-usage', '--no-sandbox']
      });
      const context = await browser.newContext({
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      });
      const page = await context.newPage();

      await page.goto(url, { 
        waitUntil: 'domcontentloaded',
        timeout: 45000 
      });

      await page.waitForTimeout(2000);

      const videos = await this.extractVideosFromPage(page);

      await browser.close();

      console.log(`✅ ${country}: Found ${videos.length} video(s)`);

      return {
        locale,
        country,
        videos,
        success: true
      };

    } catch (error) {
      if (browser) {
        try {
          await browser.close();
        } catch (closeError) {
        }
      }
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error(`❌ ${country}: Failed - ${errorMessage}`);
      
      return {
        locale,
        country,
        videos: [],
        success: false,
        error: errorMessage
      };
    }
  }

  async scrapeWithRetry(
    locale: string, 
    country: string, 
    url: string, 
    maxRetries: number = 2
  ): Promise<ScrapeResult> {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      const result = await this.scrapeLocale(locale, country, url);
      
      if (result.success) {
        return result;
      }
      
      if (attempt < maxRetries) {
        console.log(`🔄 Retrying ${country} (attempt ${attempt + 1}/${maxRetries})...`);
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }

    return await this.scrapeLocale(locale, country, url);
  }
}
