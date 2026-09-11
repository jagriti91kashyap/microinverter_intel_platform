export interface WebSearchResult {
  title: string;
  url: string;
  snippet: string;
  position: number;
}

export interface MarketSearchResult {
  manufacturer: string;
  productName: string;
  powerOutput: number;
  mpptCount: number;
  warranty: number;
  monitoringPlatform: string;
  productUrl: string;
  sourceUrl: string;
  availability: 'Available' | 'Limited' | 'Not Available';
  certifications: string[];
  lastUpdated: Date;
}

import { createSearchService } from './serpapi';

// Initialize search service
const searchService = createSearchService();

/**
 * Web search service for market research
 * This service integrates with real web search APIs to find microinverter products
 * available in specific markets/countries
 */
export async function searchWeb(query: string): Promise<WebSearchResult[]> {
  try {
    const results = await searchService.search(query);
    console.log(`Web search query: "${query}" - Found ${results.length} results`);
    return results;
  } catch (error) {
    console.error('Web search failed:', error);
    return [];
  }
}

/**
 * Search for microinverter products in a specific market
 */
export async function searchMarketProducts(
  country: string, 
  region?: string
): Promise<MarketSearchResult[]> {
  const queries = [
    `microinverter products available in ${country}`,
    `solar microinverters ${region ? region + ' ' : ''}${country}`,
    `microinverter manufacturers ${country}`,
    `${country} solar microinverter distributors`
  ];

  const results: MarketSearchResult[] = [];
  
  for (const query of queries) {
    try {
      const searchResults = await searchWeb(query);
      
      // Process search results to extract product information
      for (const searchResult of searchResults) {
        if (isOfficialSource(searchResult.url)) {
          // Extract basic product info from search result
          const marketResult: MarketSearchResult = {
            manufacturer: extractManufacturerFromTitle(searchResult.title),
            productName: extractProductNameFromTitle(searchResult.title),
            powerOutput: 0, // Would be extracted from actual content
            mpptCount: 0, // Would be extracted from actual content
            warranty: 0, // Would be extracted from actual content
            monitoringPlatform: 'Unknown', // Would be extracted from actual content
            productUrl: searchResult.url,
            sourceUrl: searchResult.url,
            availability: 'Available', // Default assumption
            certifications: [], // Would be extracted from actual content
            lastUpdated: new Date()
          };
          
          results.push(marketResult);
        }
      }
    } catch (error) {
      console.error(`Failed to search for "${query}":`, error);
    }
  }
  
  // Remove duplicates based on product URL
  const uniqueResults = results.filter((result, index, self) =>
    index === self.findIndex(r => r.productUrl === result.productUrl)
  );
  
  return uniqueResults.slice(0, 10); // Limit to 10 results
}

/**
 * Extract manufacturer name from search result title
 */
function extractManufacturerFromTitle(title: string): string {
  const manufacturers = [
    'Enphase', 'SolarEdge', 'SMA', 'Huawei', 'Fronius', 'Growatt',
    'Canadian Solar', 'APsystems', 'Chint', 'GoodWe', 'Sungrow',
    'Tigo', 'Hoymiles', 'Solaria', 'Solectria', 'Kaco', 'Delta',
    'Schneider', 'ABB', 'Omron'
  ];
  
  for (const manufacturer of manufacturers) {
    if (title.toLowerCase().includes(manufacturer.toLowerCase())) {
      return manufacturer;
    }
  }
  
  return 'Unknown';
}

/**
 * Extract product name from search result title
 */
function extractProductNameFromTitle(title: string): string {
  // Remove manufacturer prefix and common words
  const manufacturer = extractManufacturerFromTitle(title);
  const cleanTitle = title.replace(manufacturer, '').trim();
  
  // Remove common suffixes
  const suffixes = ['Microinverter', 'Inverter', 'System', 'Solutions', 'Products'];
  let productName = cleanTitle;
  
  for (const suffix of suffixes) {
    productName = productName.replace(new RegExp(suffix, 'gi'), '').trim();
  }
  
  return productName || title; // Fallback to full title if extraction fails
}

/**
 * Verify if a URL is from an official manufacturer source
 */
export function isOfficialSource(url: string): boolean {
  const officialDomains = [
    'enphase.com',
    'solaredge.com',
    'sma.de',
    'solar.huawei.com',
    'fronius.com',
    'growatt.com',
    'canadiansolar.com',
    'apsystems.com',
    'chint.com',
    'goodwe.com',
    'sungrowpower.com',
    'tigoenergy.com',
    'hoymiles.com',
    'solaria-energia.com',
    'solectria.com',
    'kaco-newenergy.com',
    'delta.com',
    'se.com',
    'new.abb.com',
    'omron.com'
  ];
  
  try {
    const urlObj = new URL(url);
    return officialDomains.some(domain => 
      urlObj.hostname === domain || 
      urlObj.hostname.endsWith(`.${domain}`)
    );
  } catch {
    return false;
  }
}

/**
 * Extract product information from a webpage using AI
 */
export async function extractProductFromWebpage(
  url: string
): Promise<Partial<MarketSearchResult> | null> {
  // TODO: Implement webpage content extraction
  // This would:
  // 1. Fetch the webpage content
  // 2. Use AI to extract product information
  // 3. Validate the extracted data
  // 4. Return structured product data
  
  return null;
}
