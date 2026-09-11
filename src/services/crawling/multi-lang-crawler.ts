import { Page } from 'playwright';
import OpenAI from 'openai';
import { ProductData, DatasheetData } from './crawler';

// Supported languages
type SupportedLanguage = 'en' | 'de' | 'fr' | 'es' | 'it' | 'nl' | 'ja' | 'ko' | 'zh-CN' | 'pt-BR';

const LANGUAGE_CONFIG: Record<SupportedLanguage, { name: string; region: string; country: string }> = {
  'en': { name: 'English', region: 'Global', country: 'United States' },
  'de': { name: 'German', region: 'Europe', country: 'Germany' },
  'fr': { name: 'French', region: 'Europe', country: 'France' },
  'es': { name: 'Spanish', region: 'Europe', country: 'Spain' },
  'it': { name: 'Italian', region: 'Europe', country: 'Italy' },
  'nl': { name: 'Dutch', region: 'Europe', country: 'Netherlands' },
  'ja': { name: 'Japanese', region: 'Asia Pacific', country: 'Japan' },
  'ko': { name: 'Korean', region: 'Asia Pacific', country: 'South Korea' },
  'zh-CN': { name: 'Chinese', region: 'Asia Pacific', country: 'China' },
  'pt-BR': { name: 'Portuguese', region: 'Latin America', country: 'Brazil' },
};

// URL patterns for regional detection
const LANG_URL_PATTERNS: Record<string, SupportedLanguage> = {
  '/de/': 'de', '/de-de/': 'de', '/germany/': 'de', '.de/': 'de',
  '/fr/': 'fr', '/fr-fr/': 'fr', '/france/': 'fr', '.fr/': 'fr',
  '/es/': 'es', '/es-es/': 'es', '/spain/': 'es', '.es/': 'es',
  '/it/': 'it', '/it-it/': 'it', '/italy/': 'it', '.it/': 'it',
  '/nl/': 'nl', '/nl-nl/': 'nl', '.nl/': 'nl',
  '/ja/': 'ja', '/jp/': 'ja', '/japan/': 'ja', '.jp/': 'ja', '.co.jp/': 'ja',
  '/ko/': 'ko', '/kr/': 'ko', '/korea/': 'ko', '.kr/': 'ko',
  '/zh/': 'zh-CN', '/cn/': 'zh-CN', '/china/': 'zh-CN', '.cn/': 'zh-CN',
  '/pt/': 'pt-BR', '/br/': 'pt-BR', '/brazil/': 'pt-BR', '.br/': 'pt-BR',
};

export interface RegionalUrl {
  language: SupportedLanguage;
  url: string;
  region: string;
  country: string;
}

export interface LocalizedProductData extends ProductData {
  sourceLanguage: SupportedLanguage;
  sourceRegion: string;
  sourceCountry: string;
  translatedFrom?: SupportedLanguage;
  regionalVariants?: RegionalUrl[];
}

export interface MultiLangCrawlResult {
  products: LocalizedProductData[];
  regionalUrls: RegionalUrl[];
  errors: string[];
}

let _openai: OpenAI | null = null;
function getOpenAIClient(): OpenAI {
  if (!_openai) {
    if (!process.env.OPENAI_API_KEY) throw new Error('OPENAI_API_KEY environment variable is not set');
    _openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }
  return _openai;
}

export class MultiLangCrawlerService {
  /**
   * Discover regional URLs from a page by parsing hreflang tags and URL patterns
   */
  async discoverRegionalUrls(page: Page): Promise<RegionalUrl[]> {
    const urls: RegionalUrl[] = [];
    const baseUrl = new URL(page.url()).origin;

    try {
      // Method 1: Parse hreflang link tags
      const hreflangLinks = await page.$$eval('link[hreflang]', (links) =>
        links.map((link) => ({
          lang: link.getAttribute('hreflang') || '',
          href: link.getAttribute('href') || '',
        }))
      );

      for (const { lang, href } of hreflangLinks) {
        const normalizedLang = this.normalizeLanguageCode(lang);
        if (normalizedLang && LANGUAGE_CONFIG[normalizedLang]) {
          const fullUrl = href.startsWith('http') ? href : new URL(href, baseUrl).toString();
          const config = LANGUAGE_CONFIG[normalizedLang];
          urls.push({ language: normalizedLang, url: fullUrl, region: config.region, country: config.country });
        }
      }

      // Method 2: Find language selector links
      const langSelectorLinks = await page.$$eval(
        'a[href*="/de"], a[href*="/fr"], a[href*="/es"], a[href*="/ja"], a[href*="/ko"], a[href*="/zh"], a[href*="/pt"]',
        (links) => links.map((a) => a.getAttribute('href') || '').filter(Boolean)
      );

      for (const href of langSelectorLinks) {
        const lang = this.detectLanguageFromUrl(href);
        if (lang && !urls.find((u) => u.language === lang)) {
          const fullUrl = href.startsWith('http') ? href : new URL(href, baseUrl).toString();
          const config = LANGUAGE_CONFIG[lang];
          urls.push({ language: lang, url: fullUrl, region: config.region, country: config.country });
        }
      }
    } catch (error) {
      console.error('Error discovering regional URLs:', error);
    }

    return urls;
  }

  /**
   * Detect language from page HTML
   */
  async detectLanguage(page: Page): Promise<SupportedLanguage> {
    try {
      // Check html lang attribute
      const htmlLang = await page.$eval('html', (el) => el.getAttribute('lang') || '');
      const normalized = this.normalizeLanguageCode(htmlLang);
      if (normalized) return normalized;

      // Check URL pattern
      const urlLang = this.detectLanguageFromUrl(page.url());
      if (urlLang) return urlLang;

      // Default to English
      return 'en';
    } catch {
      return 'en';
    }
  }

  /**
   * Translate content to English using OpenAI
   */
  async translateContent(text: string, fromLang: SupportedLanguage): Promise<string> {
    if (fromLang === 'en' || !text.trim()) return text;

    try {
      const langName = LANGUAGE_CONFIG[fromLang]?.name || fromLang;
      const response = await getOpenAIClient().chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `Translate the following ${langName} text to English. Preserve technical terms, model numbers, and units exactly as they appear. Return only the translation.`,
          },
          { role: 'user', content: text },
        ],
        temperature: 0.1,
        max_tokens: 1000,
      });
      return response.choices[0]?.message?.content?.trim() || text;
    } catch (error) {
      console.error('Translation error:', error);
      return text;
    }
  }

  /**
   * Translate product specifications
   */
  async translateSpecifications(
    specs: Record<string, any>,
    fromLang: SupportedLanguage
  ): Promise<Record<string, any>> {
    if (fromLang === 'en') return specs;

    const translated: Record<string, any> = {};
    for (const [key, value] of Object.entries(specs)) {
      const translatedKey = await this.translateContent(key, fromLang);
      const translatedValue = typeof value === 'string' ? await this.translateContent(value, fromLang) : value;
      translated[translatedKey] = translatedValue;
    }
    return translated;
  }

  /**
   * Extract and translate product data from a page
   */
  async extractLocalizedProduct(page: Page, url: string): Promise<LocalizedProductData | null> {
    try {
      const language = await this.detectLanguage(page);
      const config = LANGUAGE_CONFIG[language];

      // Extract product name
      let name = '';
      for (const selector of ['h1', '.product-title', '.product-name', 'title']) {
        const el = await page.$(selector);
        if (el) {
          name = (await el.textContent()) || '';
          if (name.trim()) break;
        }
      }
      if (!name.trim()) return null;

      // Extract description
      let description = '';
      const descEl = await page.$('.product-description, .description, [data-description]');
      if (descEl) description = (await descEl.textContent()) || '';

      // Extract specifications from tables
      const specs: Record<string, any> = {};
      const tables = await page.$$('table');
      for (const table of tables.slice(0, 2)) {
        const rows = await table.$$('tr');
        for (const row of rows) {
          const cells = await row.$$('td, th');
          if (cells.length >= 2) {
            const label = ((await cells[0].textContent()) || '').trim().replace(/:/g, '');
            const value = ((await cells[1].textContent()) || '').trim();
            if (label && value) specs[label] = value;
          }
        }
      }

      // Translate if not English
      const translatedName = await this.translateContent(name, language);
      const translatedDesc = await this.translateContent(description, language);
      const translatedSpecs = await this.translateSpecifications(specs, language);

      // Discover regional variants
      const regionalVariants = await this.discoverRegionalUrls(page);

      return {
        name: translatedName,
        url,
        description: translatedDesc,
        specifications: translatedSpecs,
        sourceLanguage: language,
        sourceRegion: config.region,
        sourceCountry: config.country,
        translatedFrom: language !== 'en' ? language : undefined,
        regionalVariants,
      };
    } catch (error) {
      console.error('Error extracting localized product:', error);
      return null;
    }
  }

  // Helper: Normalize language codes (e.g., "de-DE" → "de")
  private normalizeLanguageCode(code: string): SupportedLanguage | null {
    if (!code) return null;
    const lower = code.toLowerCase().split('-')[0];
    const mapping: Record<string, SupportedLanguage> = {
      en: 'en', de: 'de', fr: 'fr', es: 'es', it: 'it', nl: 'nl',
      ja: 'ja', ko: 'ko', zh: 'zh-CN', pt: 'pt-BR',
    };
    return mapping[lower] || null;
  }

  // Helper: Detect language from URL pattern
  private detectLanguageFromUrl(url: string): SupportedLanguage | null {
    const lower = url.toLowerCase();
    for (const [pattern, lang] of Object.entries(LANG_URL_PATTERNS)) {
      if (lower.includes(pattern)) return lang;
    }
    return null;
  }
}

export const multiLangCrawler = new MultiLangCrawlerService();
