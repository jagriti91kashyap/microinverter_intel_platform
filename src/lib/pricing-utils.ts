/**
 * Pricing Utilities
 * 
 * Helper functions for working with regional pricing data
 * Supports both legacy single-price format and new regional pricing format
 */

import type { Product, RegionalPrice } from '@/data/comprehensive-data';

// Currency exchange rates (base: USD)
// Updated daily in production
const EXCHANGE_RATES: Record<string, number> = {
  'USD': 1.0,
  'EUR': 0.92,      // 1 EUR = 0.92 USD (approximate)
  'GBP': 1.27,      // 1 GBP = 1.27 USD
  'JPY': 0.0067,    // 1 JPY = 0.0067 USD
  'AUD': 0.66,      // 1 AUD = 0.66 USD
  'INR': 0.012,     // 1 INR = 0.012 USD
  'BRL': 0.20,      // 1 BRL = 0.20 USD
  'CAD': 0.73,      // 1 CAD = 0.73 USD
  'CHF': 1.13,      // 1 CHF = 1.13 USD
  'SEK': 0.095,     // 1 SEK = 0.095 USD
  'NOK': 0.095,     // 1 NOK = 0.095 USD
  'DKK': 0.135,     // 1 DKK = 0.135 USD
  'ZAR': 0.055,     // 1 ZAR = 0.055 USD
};

// Region to currency mapping
const REGION_CURRENCY_MAP: Record<string, string> = {
  'NA': 'USD',
  'US': 'USD',
  'CA': 'CAD',
  'MX': 'USD',
  'EU': 'EUR',
  'EU-DE': 'EUR',
  'EU-FR': 'EUR',
  'EU-IT': 'EUR',
  'EU-ES': 'EUR',
  'EU-NL': 'EUR',
  'EU-BE': 'EUR',
  'EU-AT': 'EUR',
  'EU-CH': 'CHF',
  'EU-GB': 'GBP',
  'EU-IE': 'EUR',
  'EU-SE': 'SEK',
  'EU-NO': 'NOK',
  'EU-DK': 'DKK',
  'EU-FI': 'EUR',
  'EU-PL': 'EUR',
  'EU-CZ': 'EUR',
  'EU-HU': 'EUR',
  'EU-RO': 'EUR',
  'EU-GR': 'EUR',
  'EU-PT': 'EUR',
  'EU-LU': 'EUR',
  'EU-HR': 'EUR',
  'EU-SK': 'EUR',
  'EU-SI': 'EUR',
  'EU-BG': 'EUR',
  'APAC': 'USD',
  'JP': 'JPY',
  'IN': 'INR',
  'AU': 'AUD',
  'NZ': 'AUD',
  'BR': 'BRL',
  'LATAM': 'USD',
  'MEA': 'USD',
  'GLOBAL': 'USD',
};

/**
 * Get regional price for a product
 * @param product - Product object
 * @param region - Region code (e.g., 'NA', 'EU', 'JP')
 * @returns RegionalPrice object or undefined
 */
export function getPriceForRegion(product: Product, region: string): RegionalPrice | undefined {
  if (!product.regionalPrices || product.regionalPrices.length === 0) {
    return undefined;
  }
  return product.regionalPrices.find(p => p.region === region);
}

/**
 * Get all available regions for a product
 * @param product - Product object
 * @returns Array of region codes
 */
export function getAvailableRegions(product: Product): string[] {
  return product.regionalPrices?.map(p => p.region) || [];
}

/**
 * Get price with fallback to legacy field
 * @param product - Product object
 * @param region - Optional region code
 * @returns Price as number or undefined
 */
export function getPrice(product: Product, region?: string): number | undefined {
  if (region && product.regionalPrices) {
    const regionalPrice = product.regionalPrices.find(p => p.region === region);
    if (regionalPrice) return regionalPrice.price;
  }
  return product.price;
}

/**
 * Get currency for a region
 * @param region - Region code
 * @returns Currency code (e.g., 'USD', 'EUR')
 */
export function getCurrencyForRegion(region: string): string {
  return REGION_CURRENCY_MAP[region] || 'USD';
}

/**
 * Convert price from one currency to another
 * @param amount - Price amount
 * @param fromCurrency - Source currency code
 * @param toCurrency - Target currency code
 * @returns Converted price
 */
export function convertCurrency(amount: number, fromCurrency: string, toCurrency: string): number {
  if (fromCurrency === toCurrency) return amount;
  
  const fromRate = EXCHANGE_RATES[fromCurrency] || 1;
  const toRate = EXCHANGE_RATES[toCurrency] || 1;
  
  // Convert to USD first, then to target currency
  const usdAmount = amount / fromRate;
  return usdAmount * toRate;
}

/**
 * Get price in USD (converted from any currency)
 * @param regionalPrice - RegionalPrice object
 * @returns Price in USD
 */
export function getPriceInUSD(regionalPrice: RegionalPrice): number {
  return convertCurrency(regionalPrice.price, regionalPrice.currency, 'USD');
}

/**
 * Format price for display
 * @param price - Price amount
 * @param currency - Currency code
 * @param locale - Locale for formatting (default: 'en-US')
 * @returns Formatted price string
 */
export function formatPrice(price: number, currency: string, locale: string = 'en-US'): string {
  try {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(price);
  } catch {
    return `${currency} ${price.toFixed(2)}`;
  }
}

/**
 * Get price comparison across regions
 * @param product - Product object
 * @returns Array of regional prices with USD conversion
 */
export function getPriceComparison(product: Product): Array<{
  region: string;
  price: number;
  currency: string;
  priceUSD: number;
  source: string;
  confidence: number;
  lastUpdated: string;
}> {
  if (!product.regionalPrices) return [];
  
  return product.regionalPrices.map(rp => ({
    region: rp.region,
    price: rp.price,
    currency: rp.currency,
    priceUSD: getPriceInUSD(rp),
    source: rp.source,
    confidence: rp.confidence,
    lastUpdated: rp.lastUpdated,
  }));
}

/**
 * Get lowest price across all regions
 * @param product - Product object
 * @returns Lowest price in USD or undefined
 */
export function getLowestPrice(product: Product): number | undefined {
  if (!product.regionalPrices || product.regionalPrices.length === 0) {
    return product.price;
  }
  
  const prices = product.regionalPrices.map(rp => getPriceInUSD(rp));
  return Math.min(...prices);
}

/**
 * Get highest price across all regions
 * @param product - Product object
 * @returns Highest price in USD or undefined
 */
export function getHighestPrice(product: Product): number | undefined {
  if (!product.regionalPrices || product.regionalPrices.length === 0) {
    return product.price;
  }
  
  const prices = product.regionalPrices.map(rp => getPriceInUSD(rp));
  return Math.max(...prices);
}

/**
 * Get average price across all regions
 * @param product - Product object
 * @returns Average price in USD or undefined
 */
export function getAveragePrice(product: Product): number | undefined {
  if (!product.regionalPrices || product.regionalPrices.length === 0) {
    return product.price;
  }
  
  const prices = product.regionalPrices.map(rp => getPriceInUSD(rp));
  const sum = prices.reduce((a, b) => a + b, 0);
  return sum / prices.length;
}

/**
 * Get price variance across regions (as percentage)
 * @param product - Product object
 * @returns Price variance percentage or undefined
 */
export function getPriceVariance(product: Product): number | undefined {
  const lowest = getLowestPrice(product);
  const highest = getHighestPrice(product);
  
  if (!lowest || !highest) return undefined;
  
  return ((highest - lowest) / lowest) * 100;
}

/**
 * Check if price data is recent (updated within N days)
 * @param regionalPrice - RegionalPrice object
 * @param days - Number of days (default: 90)
 * @returns True if price is recent
 */
export function isPriceRecent(regionalPrice: RegionalPrice, days: number = 90): boolean {
  const lastUpdated = new Date(regionalPrice.lastUpdated);
  const now = new Date();
  const daysDiff = (now.getTime() - lastUpdated.getTime()) / (1000 * 60 * 60 * 24);
  return daysDiff <= days;
}

/**
 * Get price confidence badge
 * @param confidence - Confidence score (0-1)
 * @returns Badge label
 */
export function getConfidenceBadge(confidence: number): string {
  if (confidence >= 0.95) return 'Official';
  if (confidence >= 0.85) return 'Verified';
  if (confidence >= 0.75) return 'Reliable';
  if (confidence >= 0.65) return 'Estimated';
  return 'Placeholder';
}

/**
 * Get price confidence color
 * @param confidence - Confidence score (0-1)
 * @returns Tailwind color class
 */
export function getConfidenceColor(confidence: number): string {
  if (confidence >= 0.95) return 'bg-green-100 text-green-800';
  if (confidence >= 0.85) return 'bg-blue-100 text-blue-800';
  if (confidence >= 0.75) return 'bg-yellow-100 text-yellow-800';
  if (confidence >= 0.65) return 'bg-orange-100 text-orange-800';
  return 'bg-gray-100 text-gray-800';
}
