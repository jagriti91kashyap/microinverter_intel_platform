import { WebSearchResult } from './index';

export interface SerpAPIConfig {
  apiKey: string;
  baseUrl?: string;
}

export interface SerpAPIResponse {
  organic_results: Array<{
    position: number;
    title: string;
    link: string;
    snippet: string;
    displayed_link: string;
  }>;
  search_information: {
    total_results?: number;
    time_taken_displayed?: number;
  };
}

/**
 * SerpAPI integration for real web search capabilities
 * This provides actual search results from Google/Bing
 */
export class SerpAPIService {
  private config: SerpAPIConfig;
  private baseUrl: string;

  constructor(config: SerpAPIConfig) {
    this.config = config;
    this.baseUrl = config.baseUrl || 'https://serpapi.com/search';
  }

  /**
   * Perform web search using SerpAPI
   */
  async search(query: string, options: {
    num?: number;
    engine?: string;
    country?: string;
    language?: string;
  } = {}): Promise<WebSearchResult[]> {
    try {
      const params = new URLSearchParams({
        api_key: this.config.apiKey,
        q: query,
        num: (options.num || 10).toString(),
        engine: options.engine || 'google',
        gl: options.country || 'us',
        hl: options.language || 'en'
      });

      const response = await fetch(`${this.baseUrl}?${params}`);
      
      if (!response.ok) {
        throw new Error(`SerpAPI request failed: ${response.status} ${response.statusText}`);
      }

      const data: SerpAPIResponse = await response.json();
      
      return data.organic_results.map(result => ({
        title: result.title,
        url: result.link,
        snippet: result.snippet,
        position: result.position
      }));

    } catch (error) {
      console.error('SerpAPI search error:', error);
      throw new Error(`Web search failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Search for microinverter products specifically
   */
  async searchMicroinverters(manufacturer?: string, country?: string): Promise<WebSearchResult[]> {
    const baseQuery = manufacturer ? 
      `${manufacturer} microinverter products specifications datasheet` :
      'microinverter products specifications datasheet';
    
    const countryQuery = country ? ` ${country}` : '';
    const fullQuery = baseQuery + countryQuery;

    return this.search(fullQuery, {
      num: 20,
      country: country?.toLowerCase() || 'us'
    });
  }

  /**
   * Search for market-specific information
   */
  async searchMarket(country: string, productType: string = 'microinverters'): Promise<WebSearchResult[]> {
    const query = `${productType} available in ${country} market distributors suppliers`;
    
    return this.search(query, {
      num: 15,
      country: country.toLowerCase()
    });
  }

  /**
   * Validate API key and connectivity
   */
  async validateConnection(): Promise<boolean> {
    try {
      await this.search('test query', { num: 1 });
      return true;
    } catch (error) {
      console.error('SerpAPI validation failed:', error);
      return false;
    }
  }
}

/**
 * Mock SerpAPI service for development/testing
 * Returns realistic mock data when no API key is available
 */
export class MockSerpAPIService {
  private mockResults: WebSearchResult[] = [
    {
      title: 'Enphase IQ Microinverters - Official Specifications',
      url: 'https://enphase.com/products/microinverters',
      snippet: 'Enphase IQ series microinverters with industry-leading efficiency and reliability.',
      position: 1
    },
    {
      title: 'SolarEdge Power Optimizers - Technical Documentation',
      url: 'https://solaredge.com/products/power-optimizers',
      snippet: 'SolarEdge power optimizers and inverters with advanced monitoring capabilities.',
      position: 2
    },
    {
      title: 'SMA Solar Technology - Microinverter Solutions',
      url: 'https://sma.de/en/products/microinverters',
      snippet: 'SMA Sunny Boy microinverters for residential and commercial applications.',
      position: 3
    }
  ];

  async search(query: string): Promise<WebSearchResult[]> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Filter mock results based on query
    const filtered = this.mockResults.filter(result => 
      result.title.toLowerCase().includes(query.toLowerCase()) ||
      result.snippet.toLowerCase().includes(query.toLowerCase())
    );
    
    return filtered.length > 0 ? filtered : this.mockResults;
  }

  async searchMicroinverters(manufacturer?: string): Promise<WebSearchResult[]> {
    return this.search(manufacturer || 'microinverter');
  }

  async searchMarket(country: string): Promise<WebSearchResult[]> {
    return this.search(`${country} microinverters`);
  }

  async validateConnection(): Promise<boolean> {
    return true;
  }
}

/**
 * Factory function to create appropriate search service
 */
export function createSearchService(config?: SerpAPIConfig) {
  if (config?.apiKey && config.apiKey !== 'mock') {
    return new SerpAPIService(config);
  } else {
    console.log('Using mock search service - set SERPAPI_KEY for real search results');
    return new MockSerpAPIService();
  }
}

// Default instance
export const searchService = createSearchService({
  apiKey: process.env.SERPAPI_KEY || 'mock'
});
