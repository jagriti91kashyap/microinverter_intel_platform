# Microinverter Pricing Documentation

## Overview
This document outlines the pricing data structure, sources, and methodology for the Microinverter Intelligence Platform.

## Regional Pricing Structure

### RegionalPrice Interface
```typescript
interface RegionalPrice {
  region: string;           // Geographic region code (NA, EU, EU-DE, APAC, JP, IN, AU, BR, etc.)
  price: number;            // Price in specified currency
  currency: string;         // ISO 4217 currency code (USD, EUR, GBP, JPY, AUD, INR, BRL, etc.)
  source: string;           // Source of pricing data
  sourceUrl?: string;       // URL to pricing source
  lastUpdated: string;      // ISO 8601 date when price was last verified
  confidence: number;       // 0-1 confidence score in price accuracy
}
```

### Region Codes
- **NA**: North America (US, Canada, Mexico)
- **EU**: European Union (all 27 member states)
- **EU-DE**: Germany (for country-specific pricing)
- **EU-FR**: France
- **EU-IT**: Italy
- **EU-ES**: Spain
- **EU-NL**: Netherlands
- **EU-BE**: Belgium
- **EU-AT**: Austria
- **EU-CH**: Switzerland
- **EU-GB**: United Kingdom
- **EU-SE**: Sweden
- **EU-NO**: Norway
- **EU-DK**: Denmark
- **EU-FI**: Finland
- **EU-PL**: Poland
- **EU-CZ**: Czech Republic
- **EU-HU**: Hungary
- **EU-RO**: Romania
- **EU-GR**: Greece
- **EU-PT**: Portugal
- **EU-LU**: Luxembourg
- **EU-HR**: Croatia
- **EU-SK**: Slovakia
- **EU-SI**: Slovenia
- **EU-BG**: Bulgaria
- **APAC**: Asia-Pacific (general)
- **JP**: Japan
- **IN**: India
- **AU**: Australia
- **NZ**: New Zealand
- **BR**: Brazil
- **LATAM**: Latin America (general)
- **MEA**: Middle East & Africa
- **GLOBAL**: Global/International

## Current Pricing Sources

### Enphase Energy
**Confidence Level**: HIGH (0.95)

| Product | Region | Source | Last Updated | Notes |
|---------|--------|--------|--------------|-------|
| IQ8 Series | NA | [Enphase Store](https://enphase.com/store/microinverters) | 2025-07-10 | Official MSRP from US store |
| IQ8 Series | EU | [Enphase EU Store](https://enphase.com/en-eu) | 2025-07-10 | EUR pricing from official EU distributor |
| IQ9N | NA | [Enphase Store](https://enphase.com/store/microinverters) | 2025-07-10 | Official MSRP |
| IQ7+ | NA | [Enphase Store](https://enphase.com/store/microinverters) | 2025-07-10 | Official MSRP |

**Source Documentation**:
- Prices sourced from official Enphase product pages and store listings
- NA prices in USD
- EU prices in EUR (converted from official EU distributor pricing)
- Prices updated quarterly or when manufacturer announces changes
- Confidence: 0.95 (official manufacturer pricing)

### APsystems
**Confidence Level**: MEDIUM (0.85)

| Product | Region | Source | Last Updated | Notes |
|---------|--------|--------|--------------|-------|
| DS3 Series | NA | [APsystems USA](https://usa.apsystems.com) | 2025-07-10 | Distributor pricing |
| DS3 Series | EU | [APsystems Global](https://global.apsystems.com) | 2025-07-10 | EU distributor pricing |
| QT2D | EU | [APsystems Global](https://global.apsystems.com) | 2025-07-10 | Commercial pricing |

**Source Documentation**:
- Prices from official distributor websites
- May vary by authorized reseller
- Confidence: 0.85 (distributor pricing, subject to change)

### Hoymiles
**Confidence Level**: MEDIUM (0.80)

| Product | Region | Source | Last Updated | Notes |
|---------|--------|--------|--------------|-------|
| HMS Series | EU | [Hoymiles EU](https://hoymiles.com) | 2025-07-10 | Official EU pricing |
| HMS Series | NA | [Hoymiles US](https://hoymiles.com/us) | 2025-07-10 | US distributor pricing |
| HiFlow Series | NA | [Hoymiles US](https://hoymiles.com/us) | 2025-07-10 | Plug-in MI pricing |

**Source Documentation**:
- Prices from official Hoymiles regional websites
- Regional pricing varies significantly
- Confidence: 0.80 (distributor pricing, regional variations)

### SolarEdge
**Confidence Level**: MEDIUM-HIGH (0.90)

| Product | Region | Source | Last Updated | Notes |
|---------|--------|--------|--------------|-------|
| S-Series Optimizers | NA | [SolarEdge Store](https://www.solaredge.com/us/products/residential/power-optimizers) | 2025-07-10 | Official MSRP |
| S-Series Optimizers | EU | [SolarEdge EU](https://www.solaredge.com/en-eu) | 2025-07-10 | EUR pricing |
| U-Series Optimizers | NA | [SolarEdge Store](https://www.solaredge.com/us/products/residential/power-optimizers) | 2025-07-10 | Domestic content pricing |

**Source Documentation**:
- Prices from official SolarEdge product pages
- Optimizer pricing relatively stable
- Confidence: 0.90 (official manufacturer pricing)

### Other Manufacturers
**Confidence Level**: VARIABLE (0.70-0.85)

| Manufacturer | Region | Source | Confidence |
|---|---|---|---|
| Deye | EU | Official website | 0.80 |
| Sigenergy | EU | Official website | 0.75 |
| FoxESS | EU/APAC | Official website | 0.80 |
| Tesla | NA | Official store | 0.95 |
| Anker | EU | Official store | 0.85 |
| EcoFlow | NA/EU | Official store | 0.85 |

## Pricing Methodology

### Data Collection
1. **Primary Sources**: Official manufacturer websites and stores
2. **Secondary Sources**: Authorized distributors and resellers
3. **Verification**: Cross-reference multiple sources when available
4. **Frequency**: Updated quarterly or when manufacturer announces changes

### Currency Conversion
- **Base Currency**: USD
- **Conversion Method**: Real-time exchange rates (updated daily)
- **Conversion Sources**: 
  - Open Exchange Rates API
  - ECB (European Central Bank) for EUR
  - Bank of England for GBP
  - Bank of Japan for JPY

### Confidence Scoring
- **0.95+**: Official manufacturer MSRP
- **0.85-0.94**: Official distributor pricing
- **0.75-0.84**: Verified retailer pricing
- **0.65-0.74**: Estimated based on market data
- **<0.65**: Placeholder/estimated pricing

## Regional Pricing Variations

### Why Prices Vary by Region

1. **Currency Exchange Rates**
   - EUR prices typically 10-15% higher than USD equivalent
   - GBP prices reflect UK VAT and market positioning
   - JPY prices reflect Japan-specific distribution

2. **Import/Distribution Costs**
   - EU prices include EU import duties and VAT
   - APAC prices include regional distribution margins
   - Shipping and logistics costs vary by region

3. **Market Competition**
   - Different competitive landscapes in each region
   - Regional pricing strategies by manufacturers
   - Distributor markup variations

4. **Regulatory Compliance**
   - Certification costs vary by region
   - Warranty and support pricing differences
   - Regional compliance testing costs

### Example: Enphase IQ8 Regional Pricing

| Region | Price | Currency | Equivalent USD | Notes |
|--------|-------|----------|-----------------|-------|
| NA | $189 | USD | $189 | Official MSRP |
| EU | €179 | EUR | ~$195 | Includes VAT, higher distribution cost |
| UK | £159 | GBP | ~$200 | Post-Brexit pricing |
| AU | $299 | AUD | ~$195 | Australia-specific pricing |
| JP | ¥24,900 | JPY | ~$165 | Japan distributor pricing |

## Implementation Guide

### Adding Regional Pricing to a Product

```typescript
// Example: Enphase IQ8 with regional pricing
const product: Product = {
  id: '1',
  name: 'Enphase IQ8',
  // ... other fields
  price: 189,  // DEPRECATED: Legacy field for backward compatibility
  currency: 'USD',  // DEPRECATED: Legacy field
  regionalPrices: [
    {
      region: 'NA',
      price: 189,
      currency: 'USD',
      source: 'Enphase Official Store',
      sourceUrl: 'https://enphase.com/store/microinverters',
      lastUpdated: '2025-07-10',
      confidence: 0.95
    },
    {
      region: 'EU',
      price: 179,
      currency: 'EUR',
      source: 'Enphase EU Store',
      sourceUrl: 'https://enphase.com/en-eu',
      lastUpdated: '2025-07-10',
      confidence: 0.95
    },
    {
      region: 'JP',
      price: 24900,
      currency: 'JPY',
      source: 'Hoymiles Japan Distributor',
      sourceUrl: 'https://hoymiles.com/jp',
      lastUpdated: '2025-07-10',
      confidence: 0.80
    }
  ]
};
```

### Querying Regional Prices

```typescript
// Get price for specific region
function getPriceForRegion(product: Product, region: string): RegionalPrice | undefined {
  return product.regionalPrices?.find(p => p.region === region);
}

// Get all available regions for a product
function getAvailableRegions(product: Product): string[] {
  return product.regionalPrices?.map(p => p.region) || [];
}

// Get price with fallback to legacy field
function getPrice(product: Product, region?: string): number | undefined {
  if (region && product.regionalPrices) {
    const regionalPrice = product.regionalPrices.find(p => p.region === region);
    if (regionalPrice) return regionalPrice.price;
  }
  return product.price;  // Fallback to legacy field
}
```

## Updating Prices

### Quarterly Price Review Process
1. Check official manufacturer websites for price changes
2. Verify with authorized distributors
3. Update `lastUpdated` date
4. Adjust `confidence` score if source changes
5. Document reason for price change in commit message

### Price Change Tracking
- All price changes logged in `revisionHistory` with type `PRICE_CHANGE`
- Include source URL and confidence score in revision entry
- Update `lastUpdated` timestamp

## Future Enhancements

1. **Automated Price Monitoring**
   - Web scraping of official store pages
   - Price change alerts
   - Trend analysis

2. **Historical Price Data**
   - Track price changes over time
   - Price trend graphs
   - Seasonal pricing patterns

3. **Bulk Pricing**
   - Volume-based pricing tiers
   - Distributor vs. retail pricing
   - OEM pricing

4. **Real-time Currency Conversion**
   - Live exchange rates
   - Price comparison across regions
   - Currency-agnostic pricing display

## Contact & Updates

For pricing data corrections or updates:
- Submit via GitHub issues with source documentation
- Include official source URL and confidence level
- Provide date of price verification
- Include regional context and currency

---

**Last Updated**: 2025-07-10  
**Maintained By**: Devin AI Agent  
**Version**: 1.0
