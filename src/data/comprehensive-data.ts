// Comprehensive microinverter product data with specs, certs, accessories, revisions

export interface Specification {
  category: string;
  name: string;
  value: string;
  unit: string;
  confidence: number;
  sourceUrl: string;
  sourcePage?: number;
  extractionDate: string;
}

export interface Certification {
  country: string;
  standard: string;
  certified: boolean;
  certNumber?: string;
  expiryDate?: string;
}

export interface Accessory {
  id: string;
  name: string;
  type: string;
  compatible: boolean;
  price?: number;
  url?: string;
}

export interface RevisionEntry {
  id: string;
  date: string;
  type: 'NEW_PRODUCT' | 'SPEC_CHANGE' | 'DATASHEET_REVISION' | 'WARRANTY_UPDATE' | 'DISCONTINUATION' | 'PRICE_CHANGE';
  field?: string;
  oldValue?: string;
  newValue?: string;
  description: string;
  source: string;
}

export interface Datasheet {
  id: string;
  name: string;
  url: string;
  language: string;
  version: string;
  uploadDate: string;
  pages: number;
  fileSize: string;
  region?: string;
}

export interface RegionalVariant {
  region: string;  // e.g. 'NA', 'EU', 'EU-DE', 'EU-FR', 'APAC', 'JP', 'IN', 'AU', 'UK', 'BR', 'LATAM', 'MEA', 'GLOBAL'
  sku: string;
  voltage: number;
  frequency: number;
  certifications: string[];
  datasheetUrl: string;
  productUrl?: string;
  countries: string[];
  notes?: string;
}

export interface RegionalWebsite {
  language: string;
  url: string;
  region: string;
  country: string;
}

export interface Manufacturer {
  id: string;
  name: string;
  country: string;
  website: string;
  isActive: boolean;
  foundedYear: number;
  description: string;
  logo?: string;
  headquarters: string;
  totalProducts: number;
  regionalWebsites?: RegionalWebsite[];
}

export interface Product {
  id: string;
  name: string;
  series: string;
  model: string;
  acPower: number;
  maxModuleSize: number;
  voltage: number;
  mppt: number;
  efficiency: number;
  warranty: number;
  weight: number;
  dimensions: string;
  monitoringPlatform: string;
  status: 'ACTIVE' | 'DISCONTINUED' | 'ANNOUNCED' | 'COMING_SOON';
  imageUrl?: string;
  datasheetUrl?: string;
  productUrl?: string;
  manufacturerId: string;
  manufacturer: Manufacturer;
  countries: string[];
  price?: number;
  availability: 'IN_STOCK' | 'OUT_OF_STOCK' | 'LIMITED';
  launchDate: string;
  lastUpdated: string;
  specifications: Specification[];
  certifications: Certification[];
  accessories: Accessory[];
  revisionHistory: RevisionEntry[];
  datasheets: Datasheet[];
  aiSummary: string;
  confidenceScore: number;
  powerClass: string;
  communicationType: string;
  operatingTempRange: string;
  ipRating: string;
  inputVoltageRange: string;
  mpptVoltageRange: string;
  peakPowerTrackingRange: string;
  maxInputCurrent: string;
  thd: string;
  nightConsumption: string;
  startVoltage: string;
  cecEfficiency: string;
  euroEfficiency: string;
  maxEfficiency: string;
  voc: string;
  isc: string;
  sourceUrl?: string;
  extractionDate?: string;
  sourceLanguage?: string;
  sourceRegion?: string;
  translatedFrom?: string;
  regionalVariants?: RegionalVariant[];
  productType: string;
}

export const manufacturers: Manufacturer[] = [
  { id: '1', name: 'Enphase Energy', country: 'United States', website: 'https://enphase.com', isActive: true, foundedYear: 2006, description: 'World leader in microinverter technology with approximately 87.8 million microinverters shipped across 165+ countries. Pioneer of GaN-based IQ9 series. Also offers IQ Batteries, EV chargers, IQ Air smart thermostat, and VPP solutions.', headquarters: 'Fremont, CA, USA', totalProducts: 14, regionalWebsites: [
    { language: 'en', url: 'https://enphase.com', region: 'North America', country: 'United States' },
    { language: 'de', url: 'https://enphase.com/de-de', region: 'Europe', country: 'Germany' },
    { language: 'fr', url: 'https://enphase.com/fr-fr', region: 'Europe', country: 'France' },
    { language: 'nl', url: 'https://enphase.com/nl-nl', region: 'Europe', country: 'Netherlands' },
    { language: 'it', url: 'https://enphase.com/it-it', region: 'Europe', country: 'Italy' },
    { language: 'es', url: 'https://enphase.com/es-es', region: 'Europe', country: 'Spain' },
    { language: 'en', url: 'https://enphase.com/en-au', region: 'Asia Pacific', country: 'Australia' },
    { language: 'en', url: 'https://enphase.com/en-in', region: 'Asia Pacific', country: 'India' },
    { language: 'ja', url: 'https://enphase.com/ja-jp', region: 'Asia Pacific', country: 'Japan' },
  ]},
  { id: '2', name: 'APsystems', country: 'United States', website: 'https://apsystems.com', isActive: true, foundedYear: 2010, description: 'Multi-module microinverter specialist known for the DS3 and QT2 platforms. Operations in 80+ countries.', headquarters: 'Seattle, WA, USA', totalProducts: 7, regionalWebsites: [
    { language: 'en', url: 'https://apsystems.com', region: 'North America', country: 'United States' },
    { language: 'de', url: 'https://emea.apsystems.com/de', region: 'Europe', country: 'Germany' },
    { language: 'fr', url: 'https://emea.apsystems.com/fr', region: 'Europe', country: 'France' },
    { language: 'nl', url: 'https://emea.apsystems.com/nl', region: 'Europe', country: 'Netherlands' },
    { language: 'ja', url: 'https://apsystems.com/jp', region: 'Asia Pacific', country: 'Japan' },
    { language: 'pt-BR', url: 'https://latam.apsystems.com/br', region: 'Latin America', country: 'Brazil' },
  ]},
  { id: '3', name: 'Hoymiles', country: 'China', website: 'https://hoymiles.com', isActive: true, foundedYear: 2012, description: 'Fast-growing Chinese microinverter manufacturer with 17.4% global shipment share (2025, S&P Global). #1 MI manufacturer by volume outside the US. Product lines span HiFlow/HiFlow Pro (plug-in DIY), HMS (residential), HMT/MiT (C&I), and energy storage. Over 1 million units operating in Brazil alone.', headquarters: 'Hangzhou, China', totalProducts: 10, regionalWebsites: [
    { language: 'en', url: 'https://hoymiles.com', region: 'Global', country: 'Global' },
    { language: 'de', url: 'https://hoymiles.com/de', region: 'Europe', country: 'Germany' },
    { language: 'fr', url: 'https://hoymiles.com/fr', region: 'Europe', country: 'France' },
    { language: 'nl', url: 'https://hoymiles.com/nl', region: 'Europe', country: 'Netherlands' },
    { language: 'pl', url: 'https://hoymiles.com/pl', region: 'Europe', country: 'Poland' },
    { language: 'ja', url: 'https://hoymiles.com/jp', region: 'Asia Pacific', country: 'Japan' },
    { language: 'pt-BR', url: 'https://hoymiles.com/br', region: 'Latin America', country: 'Brazil' },
  ]},
  { id: '4', name: 'Deye', country: 'China', website: 'https://www.deyeinverter.com', isActive: true, foundedYear: 2007, description: 'Major Chinese inverter manufacturer producing microinverters, hybrid inverters, and string inverters. One of the fastest-growing solar brands globally.', headquarters: 'Ningbo, China', totalProducts: 10, regionalWebsites: [
    { language: 'en', url: 'https://www.deyeinverter.com', region: 'Global', country: 'Global' },
    { language: 'de', url: 'https://www.deyeinverter.com/de', region: 'Europe', country: 'Germany' },
    { language: 'zh-CN', url: 'https://www.deyeinverter.com/cn', region: 'Asia Pacific', country: 'China' },
  ]},
  { id: '5', name: 'Sigenergy', country: 'China', website: 'https://www.sigenergy.com', isActive: true, foundedYear: 2022, description: 'Innovative energy technology company introducing the first microinverter with built-in EMS and DAB topology. Focus on balcony and rooftop solar.', headquarters: 'Shenzhen, China', totalProducts: 5, regionalWebsites: [
    { language: 'en', url: 'https://www.sigenergy.com', region: 'Global', country: 'Global' },
    { language: 'de', url: 'https://www.sigenergy.com/de', region: 'Europe', country: 'Germany' },
    { language: 'ja', url: 'https://www.sigenergy.com/jp', region: 'Asia Pacific', country: 'Japan' },
  ]},
  { id: '6', name: 'Envertech', country: 'China', website: 'https://www.envertec.com', isActive: true, foundedYear: 2011, description: 'Established microinverter manufacturer with a wide range from 300W to 2000W+. Known for competitive pricing and global certifications.', headquarters: 'Yongkang, Zhejiang, China', totalProducts: 8, regionalWebsites: [
    { language: 'en', url: 'https://www.envertec.com', region: 'Global', country: 'Global' },
    { language: 'de', url: 'https://www.envertec.com/de', region: 'Europe', country: 'Germany' },
    { language: 'nl', url: 'https://www.envertec.com/nl', region: 'Europe', country: 'Netherlands' },
  ]},
  { id: '7', name: 'Chilicon Power', country: 'United States', website: 'https://chiliconpower.com', isActive: true, foundedYear: 2010, description: 'US-based microinverter company focused on high-reliability grid-tied solutions for residential solar.', headquarters: 'Los Angeles, CA, USA', totalProducts: 2, regionalWebsites: [
    { language: 'en', url: 'https://chiliconpower.com', region: 'North America', country: 'United States' },
  ]},
  { id: '8', name: 'SMA Solar Technology', country: 'Germany', website: 'https://sma.de', isActive: true, foundedYear: 1981, description: 'German engineering leader in solar inverter technology. One of the oldest and most respected manufacturers globally.', headquarters: 'Niestetal, Germany', totalProducts: 3, regionalWebsites: [
    { language: 'de', url: 'https://www.sma.de/de', region: 'Europe', country: 'Germany' },
    { language: 'en', url: 'https://www.sma.de/en', region: 'Global', country: 'Global' },
    { language: 'fr', url: 'https://www.sma.de/fr', region: 'Europe', country: 'France' },
    { language: 'it', url: 'https://www.sma.de/it', region: 'Europe', country: 'Italy' },
    { language: 'es', url: 'https://www.sma.de/es', region: 'Europe', country: 'Spain' },
  ]},
  { id: '9', name: 'Fronius International', country: 'Austria', website: 'https://fronius.com', isActive: true, foundedYear: 1945, description: 'Austrian technology company specializing in welding and solar energy systems. Known for premium build quality and active cooling.', headquarters: 'Wels, Austria', totalProducts: 2, regionalWebsites: [
    { language: 'de', url: 'https://www.fronius.com/de-at', region: 'Europe', country: 'Austria' },
    { language: 'en', url: 'https://www.fronius.com/en', region: 'Global', country: 'Global' },
    { language: 'fr', url: 'https://www.fronius.com/fr-fr', region: 'Europe', country: 'France' },
    { language: 'it', url: 'https://www.fronius.com/it-it', region: 'Europe', country: 'Italy' },
  ]},
  { id: '10', name: 'SolarEdge Technologies', country: 'Israel', website: 'https://solaredge.com', isActive: true, foundedYear: 2006, description: 'Inventor of the DC optimized inverter solution with module-level MPPT and monitoring. Launching Nexis next-gen residential solar+storage platform (2026). Revenue $346M in Q2 2026, returning to operating profitability. Also advancing solid-state transformer (SST) technology for AI data centers.', headquarters: 'Herzliya, Israel', totalProducts: 12, regionalWebsites: [
    { language: 'en', url: 'https://www.solaredge.com', region: 'Global', country: 'Global' },
    { language: 'de', url: 'https://www.solaredge.com/de', region: 'Europe', country: 'Germany' },
    { language: 'fr', url: 'https://www.solaredge.com/fr', region: 'Europe', country: 'France' },
    { language: 'it', url: 'https://www.solaredge.com/it', region: 'Europe', country: 'Italy' },
    { language: 'ja', url: 'https://www.solaredge.com/jp', region: 'Asia Pacific', country: 'Japan' },
  ]},
  { id: '11', name: 'Tigo Energy', country: 'United States', website: 'https://tigoenergy.com', isActive: true, foundedYear: 2007, description: 'Flex MLPE platform provider offering module-level optimization, monitoring, and safety solutions.', headquarters: 'Campbell, CA, USA', totalProducts: 2, regionalWebsites: [
    { language: 'en', url: 'https://www.tigoenergy.com', region: 'North America', country: 'United States' },
    { language: 'de', url: 'https://www.tigoenergy.com/de', region: 'Europe', country: 'Germany' },
  ]},
  { id: '12', name: 'TSUN', country: 'China', website: 'https://www.tsun-ess.com', isActive: true, foundedYear: 2017, description: 'Chinese microinverter manufacturer specializing in balcony solar and residential systems. 300W-3300W product range with Gen 3 Plus series. Growing European presence via Benelux partnership with Boschrijk Power Academy. EN 18031 cybersecurity compliance, WiFi Mesh communication.', headquarters: 'Hangzhou, China', totalProducts: 4, regionalWebsites: [
    { language: 'en', url: 'https://www.tsun-ess.com', region: 'Global', country: 'Global' },
    { language: 'de', url: 'https://www.tsun-ess.com/de', region: 'Europe', country: 'Germany' },
  ]},
  { id: '13', name: 'AEconversion', country: 'Germany', website: 'https://www.aeconversion.de', isActive: true, foundedYear: 2010, description: 'German microinverter manufacturer focused on single-phase grid-tied solutions for the European market. Known for VDE compliance.', headquarters: 'Hameln, Germany', totalProducts: 3, regionalWebsites: [
    { language: 'de', url: 'https://www.aeconversion.de', region: 'Europe', country: 'Germany' },
  ]},
  { id: '14', name: 'Atmoce', country: 'Netherlands', website: 'https://www.atmoce.com', isActive: true, foundedYear: 2020, description: 'Amsterdam-based household renewables company. World\'s first 1250W 2-in-1 microinverter. MI series from 400W to 1250W. PLC communication, 25-year warranty.', headquarters: 'Amsterdam, Netherlands', totalProducts: 8, regionalWebsites: [
    { language: 'en', url: 'https://www.atmoce.com', region: 'Europe', country: 'Netherlands' },
    { language: 'nl', url: 'https://www.atmoce.com/nl', region: 'Europe', country: 'Netherlands' },
    { language: 'de', url: 'https://www.atmoce.com/de', region: 'Europe', country: 'Germany' },
  ]},
  { id: '15', name: 'Q CELLS', country: 'South Korea', website: 'https://www.q-cells.com', isActive: true, foundedYear: 1999, description: 'Global solar leader offering panels, inverters, and complete energy solutions. Part of Hanwha Group. Q.VOLT microinverter series.', headquarters: 'Seoul, South Korea', totalProducts: 4, regionalWebsites: [
    { language: 'en', url: 'https://www.q-cells.com/en', region: 'Global', country: 'Global' },
    { language: 'de', url: 'https://www.q-cells.com/de', region: 'Europe', country: 'Germany' },
    { language: 'ko', url: 'https://www.q-cells.com/kr', region: 'Asia Pacific', country: 'South Korea' },
    { language: 'ja', url: 'https://www.q-cells.com/jp', region: 'Asia Pacific', country: 'Japan' },
  ]},
  { id: '16', name: 'Huawei', country: 'China', website: 'https://solar.huawei.com', isActive: true, foundedYear: 1987, description: 'World\'s largest inverter manufacturer by shipment. FusionSolar smart PV solutions with SUN2000 residential string inverters and optimizers.', headquarters: 'Shenzhen, China', totalProducts: 4, regionalWebsites: [
    { language: 'en', url: 'https://solar.huawei.com/en', region: 'Global', country: 'Global' },
    { language: 'de', url: 'https://solar.huawei.com/de', region: 'Europe', country: 'Germany' },
    { language: 'zh-CN', url: 'https://solar.huawei.com/cn', region: 'Asia Pacific', country: 'China' },
    { language: 'ja', url: 'https://solar.huawei.com/jp', region: 'Asia Pacific', country: 'Japan' },
  ]},
  { id: '17', name: 'FoxESS', country: 'China', website: 'https://www.fox-ess.com', isActive: true, foundedYear: 2019, description: 'Fast-growing inverter and energy storage manufacturer. Known for H series hybrid inverters and T series grid-tied solutions.', headquarters: 'Nanjing, China', totalProducts: 4, regionalWebsites: [
    { language: 'en', url: 'https://www.fox-ess.com', region: 'Global', country: 'Global' },
    { language: 'de', url: 'https://www.fox-ess.com/de', region: 'Europe', country: 'Germany' },
    { language: 'pl', url: 'https://www.fox-ess.com/pl', region: 'Europe', country: 'Poland' },
  ]},
  { id: '18', name: 'Tesla', country: 'United States', website: 'https://www.tesla.com/solarpanels', isActive: true, foundedYear: 2003, description: 'Tesla Energy offers integrated solar + storage solutions with Solar Inverter, Powerwall, and Powerwall 3 with built-in inverter.', headquarters: 'Austin, TX, USA', totalProducts: 2, regionalWebsites: [
    { language: 'en', url: 'https://www.tesla.com/solarpanels', region: 'North America', country: 'United States' },
    { language: 'de', url: 'https://www.tesla.com/de_de/solarpanels', region: 'Europe', country: 'Germany' },
    { language: 'fr', url: 'https://www.tesla.com/fr_fr/solarpanels', region: 'Europe', country: 'France' },
    { language: 'ja', url: 'https://www.tesla.com/ja_jp/solarpanels', region: 'Asia Pacific', country: 'Japan' },
  ]},
];

import { buildProducts, applyRegionalVariants, splitProductsByRegionalSKU } from './products-data';

export const products: Product[] = splitProductsByRegionalSKU(applyRegionalVariants(buildProducts(manufacturers)));

// Change Detection Data
export interface ChangeEvent {
  id: string;
  date: string;
  type: 'NEW_PRODUCT' | 'SPEC_CHANGE' | 'DATASHEET_REVISION' | 'WARRANTY_UPDATE' | 'DISCONTINUATION' | 'PRICE_CHANGE';
  productId: string;
  productName: string;
  manufacturer: string;
  field?: string;
  oldValue?: string;
  newValue?: string;
  description: string;
  source: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  region?: string;
  country?: string;
  sourceLanguage?: string;
  translatedFrom?: string;
}

export const changeEvents: ChangeEvent[] = [
  // 2026 Events (Jan-Aug) — sourced from verified press releases, PV Magazine, GlobeNewsWire, manufacturer announcements

  // August 2026
  { id: 'ce130', date: '2026-08-28', type: 'SPEC_CHANGE', productId: '23', productName: 'Hoymiles MiS Series (Brazil)', manufacturer: 'Hoymiles', field: 'Product Portfolio', oldValue: 'HMS/HMT only', newValue: 'MiS 1875/2500 VA + HIS/HIT hybrid inverters', description: 'Hoymiles showcases expanded Brazil portfolio at Intersolar South America 2026: MiS Series (Wi-Fi Mesh, 70% faster commissioning), HIS-6L-G3 residential hybrid, HIT-20L-G3, and HoyUltra 261A C&I storage. Over 1 million Hoymiles microinverters now operating in Brazil.', source: 'https://www.prnewswire.com/news-releases/hoymiles-marks-a-decade-milestone-in-brazil-with-expanded-energy-solutions-at-intersolar-south-america-2026-302862682.html', severity: 'high', region: 'Latin America', country: 'Brazil' },
  { id: 'ce131', date: '2026-08-25', type: 'NEW_PRODUCT', productId: '210', productName: 'Deye SUN-M G4 Series', manufacturer: 'Deye', description: 'Deye launches new SUN-M60/80/100G4-EU-Q0 4th-gen microinverter series (600/800/1000W). 2 MPPTs, integrated Wi-Fi, rapid shutdown, IP67, 15-year warranty, 25-year design life. Targets EU balcony and small residential solar.', source: 'https://blog.deyeinverter.com/tan-meiling-key-account-sales-executive-hybrid-inverter-ess/600-1000w-singlephase-microinverter-for-highperformance-residential-solar-systems.html', severity: 'high', region: 'Europe', country: 'Germany' },
  { id: 'ce132', date: '2026-08-24', type: 'NEW_PRODUCT', productId: '211', productName: 'Enphase IQ Battery C80', manufacturer: 'Enphase Energy', description: 'Enphase opens US pre-orders for IQ Battery C80, its first commercial & industrial energy storage system. AC-coupled, scales to multi-MWh. 15-year / 7,000-cycle warranty. Targets schools, retail, offices, warehouses. Shipments expected Q1 2027.', source: 'https://pv-magazine-usa.com/2026/08/24/enphase-enters-commercial-battery-storage-market-announces-iq-battery-c80/', severity: 'critical', region: 'North America', country: 'United States' },
  { id: 'ce133', date: '2026-08-10', type: 'SPEC_CHANGE', productId: '23', productName: 'Hoymiles Global Market Share', manufacturer: 'Hoymiles', field: 'Market Position', oldValue: 'Growing competitor', newValue: '17.4% global MI shipment share (2025)', description: 'Hoymiles achieves 17.4% global microinverter shipment share in 2025 per S&P Global Energy data. #1 microinverter manufacturer by volume outside the US. Product lines: HiFlow/HiFlow Pro (plug-in), HMS (residential), HMT/MiT (C&I).', source: 'https://www.prnewswire.com/news-releases/hoymiles-achieves-17-4-global-microinverter-shipment-share-reinforcing-its-leadership-in-the-global-market-302847053.html', severity: 'critical', region: 'Global', country: 'Global' },
  { id: 'ce134', date: '2026-08-05', type: 'SPEC_CHANGE', productId: '62', productName: 'SolarEdge Q2 2026 Results', manufacturer: 'SolarEdge Technologies', field: 'Financial Performance', oldValue: 'Operating loss', newValue: 'Non-GAAP operating profit ($10.2M)', description: 'SolarEdge returns to non-GAAP operating profitability for first time since Q2 2023. Revenue $346.2M (+20% YoY), GAAP gross margin 27.5%. Nexis platform expected at 90% of residential sales by early 2027. Also advancing SST for AI data centers.', source: 'https://pv-magazine-usa.com/2026/08/05/solaredge-swings-back-to-operating-profit-in-q2-as-margins-hit-27-5/', severity: 'high', region: 'Global', country: 'Global' },
  { id: 'ce135', date: '2026-08-04', type: 'SPEC_CHANGE', productId: '67', productName: 'TSUN Cybersecurity & WiFi Mesh', manufacturer: 'TSUN', field: 'Communication Security', oldValue: 'Standard Wi-Fi', newValue: 'WiFi Mesh + EN 18031 cybersecurity compliance', description: 'TSUN emphasizes security-by-design across 300W-3300W microinverter portfolio. Wired-bus communication, encrypted data, mutual authentication, signed firmware updates. EN 18031 conformity assessment completed. WiFi Mesh reduces offline issues.', source: 'https://www.tsun-ess.com/news/security-starts-with-design-how-tsun-microinverters-approach-communication-security.html', severity: 'medium', region: 'Europe', country: 'Germany' },

  // July 2026
  { id: 'ce100', date: '2026-07-15', type: 'NEW_PRODUCT', productId: '200', productName: 'Hoymiles HiFlow Pro', manufacturer: 'Hoymiles', description: 'Hoymiles launches HiFlow Pro, the first UL 3700-compliant plug-in microinverter in the US for DIY balcony/patio solar. Supports up to 1200W via 4 parallel units.', source: 'https://www.prnewswire.com/news-releases/hoymiles-introduces-hiflow-pro-the-first-ul-3700-compliant-plug-in-microinverter-in-the-us-to-boost-diy-solar-302826258.html', severity: 'critical', region: 'North America', country: 'United States' },
  { id: 'ce101', date: '2026-07-17', type: 'NEW_PRODUCT', productId: '201', productName: 'APsystems EZ1-LV', manufacturer: 'APsystems', description: 'APsystems launches EZ1-LV dual-module plug-in microinverter (900VA) for US DIY/balcony solar. CSA C/US listed, UL 1741 compliant. Plug-and-play 120V.', source: 'https://pv-magazine-usa.com/2026/07/17/apsystems-introduces-plug-in-microinverter-for-u-s-balcony-and-diy-solar-markets/', severity: 'critical', region: 'North America', country: 'United States' },
  { id: 'ce102', date: '2026-07-21', type: 'SPEC_CHANGE', productId: '10', productName: 'Enphase IQ Battery 3T/10T', manufacturer: 'Enphase Energy', field: 'Backup Capability', oldValue: 'Grid-tied only', newValue: 'Backup enabled', description: 'Enphase unlocks backup power and expandable storage for existing IQ Battery 3T/10T customers across Europe via IQ Gateway software update.', source: 'https://www.globenewswire.com/news-release/2026/07/21/3330403/20176/en/Enphase-Energy-Unlocks-Backup-and-Expandable-Storage-for-Existing-IQ-Battery-Customers-Across-Europe.html', severity: 'high', region: 'Europe', country: 'Germany' },
  { id: 'ce103', date: '2026-07-16', type: 'NEW_PRODUCT', productId: '202', productName: 'Sigenergy SigenMate 2700 Ultra', manufacturer: 'Sigenergy', description: 'Sigenergy unveils AI-driven SigenMate 2700 Ultra plug-and-play home storage (2.68-56.4 kWh, LiFePO4). 0ms backup. Pre-order €999 in Germany.', source: 'https://www.pv-magazine.com/2026/07/16/sigenergy-unveils-ai-driven-plug-and-play-home-storage-system-for-pv-retrofits/', severity: 'high', region: 'Europe', country: 'Germany' },
  { id: 'ce104', date: '2026-07-13', type: 'NEW_PRODUCT', productId: '62', productName: 'SolarEdge Nexis', manufacturer: 'SolarEdge Technologies', description: 'SolarEdge opens US orders for Nexis residential solar+storage platform. Simple-Click modular battery (5-80 kWh), 13kW inverter. Install under 30 min.', source: 'https://corporate.solaredge.com/en/news-and-media/local-announcements/SolarEdge-Launches-Nexis-Orders-Across-the-U.S', severity: 'critical', region: 'North America', country: 'United States' },
  { id: 'ce105', date: '2026-07-13', type: 'NEW_PRODUCT', productId: '10', productName: 'Enphase IQ9N (Australia/NZ)', manufacturer: 'Enphase Energy', description: 'Enphase expands IQ9N microinverter availability to Australia and New Zealand. GaN-based, 427VA, 97.5% CEC efficiency.', source: 'https://investor.enphase.com/news-releases/news-release-details/enphase-energy-launches-iq9n-microinverters-gan-technology', severity: 'high', region: 'Asia Pacific', country: 'Australia' },
  { id: 'ce106', date: '2026-06-25', type: 'NEW_PRODUCT', productId: '203', productName: 'Deye SG06 Series', manufacturer: 'Deye', description: 'Deye debuts SG06 6th-gen SiC hybrid inverter at Intersolar Europe 2026. 42.9% higher bypass current, 41.8% lighter. TÜV Rheinland certified on-site.', source: 'https://deye.com/deye-unveils-multiple-innovative-pv-storage-solutions-at-the-smarter-e-europe-2026/', severity: 'high', region: 'Europe', country: 'Germany' },
  { id: 'ce107', date: '2026-06-25', type: 'SPEC_CHANGE', productId: '35', productName: 'Deye Micro Hybrid ESS', manufacturer: 'Deye', field: 'Product Category', oldValue: 'Microinverter only', newValue: 'Micro Hybrid ESS (MI + battery)', description: 'Deye introduces 2.56/5.12 kWh Micro Hybrid ESS all-in-one units integrating micro hybrid inverter with battery for balcony/apartment plug-and-play.', source: 'https://deye.com/deye-unveils-multiple-innovative-pv-storage-solutions-at-the-smarter-e-europe-2026/', severity: 'high', region: 'Europe', country: 'Germany' },
  { id: 'ce108', date: '2026-06-23', type: 'NEW_PRODUCT', productId: '10', productName: 'Enphase IQ9N (US launch)', manufacturer: 'Enphase Energy', description: 'Enphase launches IQ9N microinverter for US residential solar. GaN technology, 427VA, 97.5% CEC efficiency, 25yr warranty. Backward compatible with IQ7/IQ8.', source: 'https://apnews.com/press-release/globenewswire-mobile/press-release-af895ccaf80c19396710987730f25cc0', severity: 'critical', region: 'North America', country: 'United States' },
  { id: 'ce109', date: '2026-06-23', type: 'NEW_PRODUCT', productId: '204', productName: 'SolarEdge CSS-OD 107kWh', manufacturer: 'SolarEdge Technologies', description: 'SolarEdge launches CSS-OD 107kWh commercial storage at Intersolar Europe 2026. Backup-ready, <20ms switchover, scalable to 2.1 MWh.', source: 'https://pes.eu.com/press-releases/intersolar-2026-solaredge-launches-new-backup-ready-commercial-battery-and-expands-multirange-concept-across-entire-ci-pv-inverter-portfolio', severity: 'high', region: 'Europe', country: 'Germany' },
  { id: 'ce110', date: '2026-06-23', type: 'SPEC_CHANGE', productId: '62', productName: 'SolarEdge C&I Inverters', manufacturer: 'SolarEdge Technologies', field: 'MultiRange Concept', oldValue: 'Residential only', newValue: 'Full C&I portfolio', description: 'SolarEdge expands MultiRange Concept to entire C&I PV inverter portfolio. Installers can set inverter power rating on-site via SolarEdge Go app.', source: 'https://pes.eu.com/press-releases/intersolar-2026-solaredge-launches-new-backup-ready-commercial-battery-and-expands-multirange-concept-across-entire-ci-pv-inverter-portfolio', severity: 'medium', region: 'Europe', country: 'Germany' },
  { id: 'ce111', date: '2026-06-23', type: 'NEW_PRODUCT', productId: '205', productName: 'Atmoce MS-8K-U PRO Battery', manufacturer: 'Atmoce', description: 'Atmoce unveils MS-8K-U PRO 8kWh residential battery at Intersolar 2026, co-developed with E.ON. Part of industry-first 25-year residential solar+storage system.', source: 'https://www.pv-magazine.com/press-releases/leading-the-ac-revolution-atmoce-celebrates-innovation-partnership-and-the-next-generation-of-energy-at-intersolar-europe-2026/', severity: 'high', region: 'Europe', country: 'Germany' },
  { id: 'ce112', date: '2026-06-23', type: 'SPEC_CHANGE', productId: '81', productName: 'Atmoce MI-1200-2M', manufacturer: 'Atmoce', field: 'Feature', oldValue: 'Standard MI', newValue: 'Bidirectional DAB cyclo-inversion + snow removal', description: 'Atmoce demonstrates bidirectional DAB cyclo-inversion MI with Grid-to-Module active snow removal at Intersolar 2026. Shortlisted for smarter E AWARD 2026.', source: 'https://taiyangnews.info/technology/atmoce-presents-bidirectional-microinverter-and-ac-coupled-battery-systems', severity: 'high', region: 'Europe', country: 'Germany' },
  { id: 'ce113', date: '2026-06-23', type: 'NEW_PRODUCT', productId: '206', productName: 'Atmoce BattBank C&I Battery', manufacturer: 'Atmoce', description: 'Atmoce launches BattBank, world\'s first Extra-Low Voltage AC stackable C&I battery. Up to 112 kWh per stack. Independent white paper by KiloWattsol.', source: 'https://www.pv-magazine.com/press-releases/atmoce-to-showcase-the-next-gen-ac-solar-storage-innovations-at-intersolar-europe-2026/', severity: 'high', region: 'Europe', country: 'Germany' },
  { id: 'ce114', date: '2026-06-18', type: 'NEW_PRODUCT', productId: '102', productName: 'Enphase IQ9S-3P (US shipping)', manufacturer: 'Enphase Energy', description: 'Enphase begins production shipments of IQ9S-3P commercial microinverter in the US. 548VA, GaN, supports 770W panels, native 480Y/277V 3-phase. 25yr warranty.', source: 'https://www.globenewswire.com/news-release/2026/06/18/3314099/20176/en/Enphase-Energy-Begins-Shipments-of-GaN-Based-548-VA-IQ9S-Commercial-Microinverters-in-the-United-States.html', severity: 'critical', region: 'North America', country: 'United States' },
  { id: 'ce115', date: '2026-06-17', type: 'NEW_PRODUCT', productId: '207', productName: 'Enphase IQ Battery G5', manufacturer: 'Enphase Energy', description: 'Enphase previews IQ Battery G5 at Intersolar Europe 2026. 5th-gen, 1.9x energy density, stackable 5-30 kWh, IQ9N MI per module. Expected Q1 2027.', source: 'https://www.globenewswire.com/news-release/2026/06/17/3313359/20176/en/Enphase-Energy-to-Showcase-Product-Innovations-at-Intersolar-Europe.html', severity: 'high', region: 'Europe', country: 'Germany' },
  { id: 'ce116', date: '2026-06-11', type: 'NEW_PRODUCT', productId: '10', productName: 'Enphase IQ9N (Europe launch)', manufacturer: 'Enphase Energy', description: 'Enphase launches IQ9N microinverter across Europe (FR, BE, NL, IT, ES, CH, UK, DE, LU). 97.44% EU weighted efficiency. Shipments began June 5, 2026.', source: 'https://investor.enphase.com/news-releases/news-release-details/enphase-energy-launches-iq9n-microinverters-gan-technology', severity: 'critical', region: 'Europe', country: 'Germany' },
  { id: 'ce117', date: '2026-05-27', type: 'NEW_PRODUCT', productId: '208', productName: 'APsystems APmeter', manufacturer: 'APsystems', description: 'APsystems launches APmeter zero-export smart meter for EZ1 plug-in solar. Cloud-based controls via AP EasyPower app. Pre-orders open.', source: 'https://usa.apsystems.com/new-zero-export-solution-for-ez1/', severity: 'medium', region: 'North America', country: 'United States' },
  { id: 'ce118', date: '2026-04-01', type: 'DATASHEET_REVISION', productId: '57', productName: 'SMA Sunny Boy Smart Energy', manufacturer: 'SMA Solar Technology', field: 'Firmware', oldValue: 'v03.12.xx.R', newValue: 'v03.16.xx.R', description: 'SMA releases firmware v03.16 for Sunny Boy Smart Energy: improved grid anomaly handling (battery charges during overvoltage), stability fixes, CVE-2025-58057 patched.', source: 'https://www.sma.de/en/products/hybrid-inverters/sunny-boy-smart-energy', severity: 'medium', region: 'Europe', country: 'Germany' },
  { id: 'ce119', date: '2026-03-15', type: 'NEW_PRODUCT', productId: '57', productName: 'SMA Sunny Boy Smart Energy 9.6/11.5', manufacturer: 'SMA Solar Technology', description: 'SMA America launches Sunny Boy Smart Energy 9.6kW and 11.5kW models. 4 MPPTs, up to 5700W backup (Backup Select), UL 1741 SB certified.', source: 'https://www.sma-sunny.com/us/new-sunny-boy-smart-energy-hybrid-inverter-meets-key-safety-standards/', severity: 'high', region: 'North America', country: 'United States' },
  { id: 'ce120', date: '2026-02-10', type: 'NEW_PRODUCT', productId: '18', productName: 'APsystems EZ1 Plug-In (US launch)', manufacturer: 'APsystems', description: 'APsystems officially launches EZ1 plug-in microinverter in the US. 97.3% peak efficiency, dual MPPT, WiFi+BT, direct-to-consumer via APsystems online store.', source: 'https://usa.apsystems.com/apsystems-officially-launches-ez1-plug-in-microinverter/', severity: 'high', region: 'North America', country: 'United States' },
  { id: 'ce121', date: '2026-07-24', type: 'NEW_PRODUCT', productId: '95', productName: 'FoxESS Power Beast (H3 Plus + CQ7)', manufacturer: 'FoxESS', description: 'FoxESS launches Power Beast C&I storage: H3 Plus hybrid inverter (50-125kW) + CQ7 modular battery (up to 292 kWh per inverter). 98.5% max efficiency.', source: 'https://now.solar/2026/07/24/fox-ess-launches-high-voltage-battery-inverter-solution-for-ci-solar-pv-magazine-global/', severity: 'high', region: 'Global', country: 'Global' },
  { id: 'ce122', date: '2026-06-25', type: 'PRICE_CHANGE', productId: '32', productName: 'Deye SUN300G3-EU-230', manufacturer: 'Deye', field: 'Brand Recognition', oldValue: 'N/A', newValue: 'EUPD Top Brand PV 2026', description: 'Deye wins EUPD Research Top Brand PV 2026 for Inverters & Storage at Intersolar Europe. Validates growing EU market presence.', source: 'https://deye.com/deye-unveils-multiple-innovative-pv-storage-solutions-at-the-smarter-e-europe-2026/', severity: 'medium', region: 'Europe', country: 'Germany' },

  // 2025 Events (Jan-Jul)
  { id: 'ce1', date: '2025-07-15', type: 'NEW_PRODUCT', productId: '56', productName: 'CP-720 Microinverter', manufacturer: 'Chilicon Power', description: 'New dual-module microinverter announced at RE+ 2025', source: 'https://www.chiliconpower.com', severity: 'high', region: 'North America', country: 'United States' },
  { id: 'ce2', date: '2025-07-10', type: 'SPEC_CHANGE', productId: '17', productName: 'APsystems DS3', manufacturer: 'APsystems', field: 'Maximum Power', oldValue: '720W', newValue: '730W', description: 'AC power rating increased following firmware update v2.1', source: 'https://usa.apsystems.com/now-with-a-little-more-flex-appeal/', severity: 'medium', region: 'Global', country: 'Global' },
  { id: 'ce3', date: '2025-07-08', type: 'DATASHEET_REVISION', productId: '1', productName: 'IQ8 Microinverter', manufacturer: 'Enphase Energy', field: 'Datasheet', oldValue: 'Rev 10', newValue: 'Rev 11', description: 'Updated efficiency curves and added new grid profiles for Japan', source: 'https://enphase.com/download/iq8-and-iq8-microinverters-data-sheet', severity: 'low', region: 'Asia Pacific', country: 'Japan' },
  { id: 'ce4', date: '2025-07-05', type: 'WARRANTY_UPDATE', productId: '24', productName: 'Hoymiles HM-800', manufacturer: 'Hoymiles', field: 'Warranty', oldValue: '10 years', newValue: '12 years', description: 'Extended warranty from 10 to 12 years for all new purchases', source: 'https://open-energy.hoymiles.com/en/about-us/news/hoymiles-unveils-the-lightest-and-most-efficient-mis-series-microinverter-at-intersolar-north-america-2025/', severity: 'medium', region: 'Europe', country: 'Germany' },
  { id: 'ce5', date: '2025-06-28', type: 'PRICE_CHANGE', productId: '26', productName: 'Hoymiles HMS-800-2T', manufacturer: 'Hoymiles', field: 'Price', oldValue: '€179', newValue: '€159', description: 'Price reduced by 11% for European market competitiveness', source: 'https://open-energy.hoymiles.com/en/about-us/news/hoymiles-unveils-the-lightest-and-most-efficient-mis-series-microinverter-at-intersolar-north-america-2025/', severity: 'low', region: 'Europe', country: 'Germany' },
  { id: 'ce6', date: '2025-06-20', type: 'DISCONTINUATION', productId: '99', productName: 'HM-600 Microinverter', manufacturer: 'Hoymiles', description: 'HM-600 discontinued, replaced by HMS-800-2T series', source: 'https://open-energy.hoymiles.com/en/about-us/news/hoymiles-unveils-the-lightest-and-most-efficient-mis-series-microinverter-at-intersolar-north-america-2025/', severity: 'critical', region: 'Global', country: 'Global' },
  { id: 'ce7', date: '2025-06-15', type: 'SPEC_CHANGE', productId: '18', productName: 'APsystems EZ1-M', manufacturer: 'APsystems', field: 'Firmware', oldValue: 'v1.5', newValue: 'v2.0', description: 'Added dynamic power limiting and Shelly integration', source: 'https://global.apsystems.com/wp-content/uploads/2025/04/APsystems_brochure_EZ1_210x297_A4_2024_06_WEB.pdf', severity: 'medium', region: 'Europe', country: 'Netherlands' },
  { id: 'ce8', date: '2025-06-10', type: 'NEW_PRODUCT', productId: '5', productName: 'IQ8H Microinverter', manufacturer: 'Enphase Energy', description: 'IQ8H launched for high-wattage panels up to 540Wp', source: 'https://enphase.com/download/iq8hc-microinverter-data-sheet', severity: 'high', region: 'North America', country: 'United States' },
  { id: 'ce9', date: '2025-06-01', type: 'DATASHEET_REVISION', productId: '62', productName: 'SolarEdge SE3000H', manufacturer: 'SolarEdge Technologies', field: 'Datasheet', oldValue: 'Rev 5.1', newValue: 'Rev 5.2', description: 'Added EV charger integration specifications', source: 'https://knowledge-center.solaredge.com/sites/kc/files/se-home-hub-single-phase-inverter-datasheet-eu.pdf', severity: 'low', region: 'Global', country: 'Global' },
  { id: 'ce10', date: '2025-05-25', type: 'SPEC_CHANGE', productId: '60', productName: 'Fronius Primo GEN24 3.0 Plus', manufacturer: 'Fronius International', field: 'Supported Batteries', oldValue: 'BYD only', newValue: 'BYD, LG RESU, Fronius Solar Battery', description: 'Extended battery compatibility list', source: 'https://www.fronius.com/en-gb/uk/solar-energy/installers-partners/technical-data/all-products/inverters/fronius-primo-gen24-plus/fronius-primo-gen24-3-0-plus', severity: 'high', region: 'Europe', country: 'Austria' },
  { id: 'ce11', date: '2025-05-15', type: 'WARRANTY_UPDATE', productId: '57', productName: 'SMA Sunny Boy 3.0', manufacturer: 'SMA Solar Technology', field: 'Extended Warranty', oldValue: 'N/A', newValue: '20 years available', description: 'New extended warranty option up to 20 years available for purchase', source: 'https://www.sma.de/en/products/services-warranty/warranty-cover-home', severity: 'low', region: 'Europe', country: 'Germany' },
  { id: 'ce12', date: '2025-05-01', type: 'PRICE_CHANGE', productId: '65', productName: 'TS4-A-O Optimizer', manufacturer: 'Tigo Energy', field: 'Price', oldValue: '$55', newValue: '$45', description: 'Global price reduction to improve market competitiveness', source: 'https://www.tigoenergy.com/post/update-software-may-2025-with-real-time-active-commissioning', severity: 'low', region: 'North America', country: 'United States' },
  { id: 'ce13', date: '2025-07-12', type: 'NEW_PRODUCT', productId: '10', productName: 'Enphase IQ9N', manufacturer: 'Enphase Energy', description: 'Next-gen IQ9N with 427VA max output launched globally. GaN-based topology, 97.5% CEC efficiency.', source: 'https://newsroom.enphase.com/news-releases/news-release-details/enphase-energy-opens-us-pre-orders-iq9-commercial-microinverters', severity: 'critical', region: 'Global', country: 'Global' },
  { id: 'ce14', date: '2025-07-01', type: 'NEW_PRODUCT', productId: '42', productName: 'SigenMicro 400', manufacturer: 'Sigenergy', description: 'Sigenergy enters microinverter market with DAB topology and built-in EMS', source: 'https://www.sigenergy.com/en/news/info/1700.html', severity: 'high', region: 'Europe', country: 'Germany' },
  { id: 'ce15', date: '2025-06-25', type: 'SPEC_CHANGE', productId: '35', productName: 'Deye SUN800G3-EU-230', manufacturer: 'Deye', field: 'Firmware', oldValue: 'v2.1', newValue: 'v3.0', description: 'Added dynamic power curtailment for VDE AR-N 4105 compliance', source: 'https://www.deyeinverter.com/deyeinverter/2022/03/16/deyemicroinverter300-2000wg3-eu230-datasheet-2022.pdf', severity: 'medium', region: 'Europe', country: 'Germany' },
  { id: 'ce17', date: '2025-06-12', type: 'PRICE_CHANGE', productId: '32', productName: 'Deye SUN300G3-EU-230', manufacturer: 'Deye', field: 'Price', oldValue: '€89', newValue: '€69', description: 'Aggressive price reduction to gain EU market share', source: 'https://www.deyeinverter.com/deyeinverter/2022/03/16/deyemicroinverter300-2000wg3-eu230-datasheet-2022.pdf', severity: 'high', region: 'Europe', country: 'Germany' },
  { id: 'ce18', date: '2025-05-30', type: 'DATASHEET_REVISION', productId: '51', productName: 'Envertech EVT800', manufacturer: 'Envertech', field: 'Datasheet', oldValue: 'v2.0', newValue: 'v2.1', description: 'Updated grounding requirements and added wiring diagrams', source: 'https://www.envertec.com/products/microinverter/66.html', severity: 'low', region: 'Europe', country: 'Netherlands' },
  { id: 'ce19', date: '2025-05-20', type: 'NEW_PRODUCT', productId: '73', productName: 'AEconversion INV800-90', manufacturer: 'AEconversion', description: 'German-made 800W dual microinverter for EU balcony solar', source: 'https://aeconversion.de/en/solar/micro-inverters/', severity: 'medium', region: 'Europe', country: 'Germany' },
  { id: 'ce20', date: '2025-04-14', type: 'NEW_PRODUCT', productId: '81', productName: 'Atmoce MI-1200-2M', manufacturer: 'Atmoce', description: 'World\'s first 1200W 2-in-1 microinverter debuts at Intersolar Europe', source: 'https://www.pv-magazine.com', severity: 'critical', region: 'Europe', country: 'Netherlands' },
  { id: 'ce21', date: '2025-04-01', type: 'SPEC_CHANGE', productId: '88', productName: 'Huawei SUN2000-3KTL-M1', manufacturer: 'Huawei', field: 'Firmware', oldValue: 'v3.2', newValue: 'v4.0', description: 'AI-powered MPPT optimization and battery scheduling improvements', source: 'https://solar.huawei.com/en/download?p=%2F-%2Fmedia%2FSolar%2Fattachment%2Fpdf%2Feu%2Fdatasheet%2FSUN2000-2-6KTL-M1.pdf', severity: 'medium', region: 'Europe', country: 'Germany' },
  { id: 'ce22', date: '2025-03-15', type: 'NEW_PRODUCT', productId: '92', productName: 'FoxESS T3.0', manufacturer: 'FoxESS', description: 'FoxESS launches T-series grid-tied inverters for European residential market', source: 'https://www.fox-ess.com/Public/Uploads/uploadfile/files/Download/EN-T(G3)-datasheet-V2.5-20250711.pdf', severity: 'high', region: 'Europe', country: 'United Kingdom' },
  { id: 'ce23', date: '2025-03-01', type: 'PRICE_CHANGE', productId: '22', productName: 'Hoymiles HM-300', manufacturer: 'Hoymiles', field: 'Price', oldValue: '€99', newValue: '€79', description: 'Entry-level microinverter price reduced for balcony solar adoption', source: 'https://open-energy.hoymiles.com/en/about-us/news/hoymiles-unveils-the-lightest-and-most-efficient-mis-series-microinverter-at-intersolar-north-america-2025/', severity: 'medium', region: 'Europe', country: 'Germany' },
  { id: 'ce24', date: '2025-02-20', type: 'WARRANTY_UPDATE', productId: '74', productName: 'Atmoce MI-400', manufacturer: 'Atmoce', field: 'Warranty', oldValue: '20 years', newValue: '25 years', description: 'Atmoce extends warranty to industry-leading 25 years', source: 'https://atmoce.com/en', severity: 'high', region: 'Europe', country: 'Netherlands' },
  { id: 'ce25', date: '2025-02-10', type: 'DATASHEET_REVISION', productId: '17', productName: 'APsystems DS3', manufacturer: 'APsystems', field: 'Datasheet', oldValue: 'Rev 3.0', newValue: 'Rev 3.1', description: 'Added installation guidelines for bifacial modules', source: 'https://global.apsystems.com/wp-content/uploads/2025/04/4303019112_APsystems-Microinverter-DS3-series-for-APAC-User-manual_-Rev1.5_2025-03-04.pdf', severity: 'low', region: 'Global', country: 'Global' },
  { id: 'ce26', date: '2025-01-25', type: 'NEW_PRODUCT', productId: '96', productName: 'Tesla Solar Inverter 3.8', manufacturer: 'Tesla', description: 'Tesla launches residential solar inverter with Powerwall integration', source: 'https://energylibrary.tesla.com/docs/Public/Solar/Inverter/Datasheet/SolarShutdownDevice/en-us/SolarInverter-Datasheet-SolarShutdownDevice.pdf', severity: 'critical', region: 'North America', country: 'United States' },
  { id: 'ce27', date: '2025-01-15', type: 'SPEC_CHANGE', productId: '62', productName: 'SolarEdge SE3000H', manufacturer: 'SolarEdge Technologies', field: 'EV Charger Support', oldValue: 'Optional', newValue: 'Integrated', description: 'Built-in EV charger support now standard on all SE-H series', source: 'https://www.solaredge.com/warranty', severity: 'high', region: 'Global', country: 'Global' },

  // 2024 Events
  { id: 'ce28', date: '2024-12-15', type: 'NEW_PRODUCT', productId: '18', productName: 'APsystems EZ1-M', manufacturer: 'APsystems', description: 'EZ1-M balcony solar microinverter launched for EU 800W limit', source: 'apsystems.com/products/ez1-m', severity: 'high', region: 'Europe', country: 'Germany' },
  { id: 'ce29', date: '2024-12-01', type: 'DISCONTINUATION', productId: '100', productName: 'Enphase IQ7', manufacturer: 'Enphase Energy', description: 'IQ7 series discontinued, replaced by IQ8 series globally', source: 'enphase.com/support/eol-products', severity: 'critical', region: 'Global', country: 'Global' },
  { id: 'ce30', date: '2024-11-20', type: 'PRICE_CHANGE', productId: '1', productName: 'Enphase IQ8', manufacturer: 'Enphase Energy', field: 'Price', oldValue: '$215', newValue: '$189', description: 'IQ8 price reduced to compete with Chinese manufacturers', source: '', severity: 'high', region: 'North America', country: 'United States' },
  { id: 'ce31', date: '2024-11-10', type: 'SPEC_CHANGE', productId: '24', productName: 'Hoymiles HM-800', manufacturer: 'Hoymiles', field: 'Max Input Current', oldValue: '12A', newValue: '12.5A', description: 'Input current increased to support higher wattage panels', source: '', severity: 'medium', region: 'Europe', country: 'Germany' },
  { id: 'ce32', date: '2024-10-25', type: 'NEW_PRODUCT', productId: '26', productName: 'Hoymiles HMS-800-2T', manufacturer: 'Hoymiles', description: 'Gen3 HMS series with Sub-1G RF communication launched', source: '', severity: 'high', region: 'Global', country: 'Global' },
  { id: 'ce33', date: '2024-10-15', type: 'WARRANTY_UPDATE', productId: '57', productName: 'SMA Sunny Boy 3.0', manufacturer: 'SMA Solar Technology', field: 'Standard Warranty', oldValue: '5 years', newValue: '10 years', description: 'SMA doubles standard warranty on Sunny Boy series', source: '', severity: 'high', region: 'Europe', country: 'Germany' },
  { id: 'ce34', date: '2024-10-01', type: 'DATASHEET_REVISION', productId: '60', productName: 'Fronius Primo GEN24 3.0 Plus', manufacturer: 'Fronius International', field: 'Datasheet', oldValue: 'Rev 4.0', newValue: 'Rev 4.1', description: 'Updated battery compatibility and added Ohmpilot integration', source: '', severity: 'low', region: 'Europe', country: 'Austria' },
  { id: 'ce35', date: '2024-09-20', type: 'NEW_PRODUCT', productId: '84', productName: 'Q CELLS Q.VOLT MI-300', manufacturer: 'Q CELLS', description: 'Q CELLS enters microinverter market with Q.VOLT series', source: '', severity: 'high', region: 'North America', country: 'United States' },
  { id: 'ce36', date: '2024-09-10', type: 'PRICE_CHANGE', productId: '47', productName: 'Envertech EVT300', manufacturer: 'Envertech', field: 'Price', oldValue: '€85', newValue: '€65', description: 'Envertech reduces prices to compete in EU balcony solar market', source: '', severity: 'medium', region: 'Europe', country: 'Netherlands' },
  { id: 'ce37', date: '2024-08-25', type: 'SPEC_CHANGE', productId: '32', productName: 'Deye SUN300G3-EU-230', manufacturer: 'Deye', field: 'Grid Profiles', oldValue: '5 profiles', newValue: '12 profiles', description: 'Added grid profiles for additional EU countries', source: '', severity: 'medium', region: 'Europe', country: 'Germany' },
  { id: 'ce38', date: '2024-08-15', type: 'NEW_PRODUCT', productId: '35', productName: 'Deye SUN800G3-EU-230', manufacturer: 'Deye', description: 'Deye launches 800W dual microinverter for EU balcony solar', source: 'https://www.deyeinverter.com/deyeinverter/2022/03/16/deyemicroinverter300-2000wg3-eu230-datasheet-2022.pdf', severity: 'high', region: 'Europe', country: 'Germany' },
  { id: 'ce39', date: '2024-08-01', type: 'DISCONTINUATION', productId: '101', productName: 'APsystems YC600', manufacturer: 'APsystems', description: 'YC600 discontinued, replaced by DS3 series', source: '', severity: 'critical', region: 'Global', country: 'Global' },
  { id: 'ce40', date: '2024-07-20', type: 'WARRANTY_UPDATE', productId: '65', productName: 'Tigo TS4-A-O', manufacturer: 'Tigo Energy', field: 'Warranty', oldValue: '20 years', newValue: '25 years', description: 'Tigo extends optimizer warranty to match panel warranties', source: '', severity: 'medium', region: 'North America', country: 'United States' },
  { id: 'ce41', date: '2024-07-10', type: 'DATASHEET_REVISION', productId: '3', productName: 'Enphase IQ8M', manufacturer: 'Enphase Energy', field: 'Datasheet', oldValue: 'Rev 8', newValue: 'Rev 9', description: 'Updated thermal derating curves and added rapid shutdown compliance details', source: '', severity: 'low', region: 'North America', country: 'United States' },
  { id: 'ce42', date: '2024-06-25', type: 'SPEC_CHANGE', productId: '42', productName: 'SigenMicro 400', manufacturer: 'Sigenergy', field: 'Product Preview', oldValue: 'N/A', newValue: 'Announced', description: 'Sigenergy previews SigenMicro 400 at Intersolar Europe with preliminary DAB topology specs', source: '', severity: 'medium', region: 'Europe', country: 'Germany' },
  { id: 'ce43', date: '2024-06-15', type: 'PRICE_CHANGE', productId: '17', productName: 'APsystems DS3', manufacturer: 'APsystems', field: 'Price', oldValue: '$279', newValue: '$239', description: 'DS3 price reduced following manufacturing optimization', source: '', severity: 'medium', region: 'North America', country: 'United States' },
  { id: 'ce44', date: '2024-06-01', type: 'SPEC_CHANGE', productId: '5', productName: 'Enphase IQ8H', manufacturer: 'Enphase Energy', field: 'Max Module Size', oldValue: '500Wp', newValue: '540Wp', description: 'IQ8H now supports larger high-wattage panels', source: 'https://newsroom.enphase.com/news-releases/news-release-details/enphase-energy-opens-us-pre-orders-iq9-commercial-microinverters', severity: 'medium', region: 'North America', country: 'United States' },
  { id: 'ce45', date: '2024-05-20', type: 'NEW_PRODUCT', productId: '28', productName: 'Hoymiles HMS-1600-4T', manufacturer: 'Hoymiles', description: 'Quad-module microinverter for commercial rooftop applications', source: 'https://open-energy.hoymiles.com/en/about-us/news/hoymiles-unveils-the-lightest-and-most-efficient-mis-series-microinverter-at-intersolar-north-america-2025/', severity: 'high', region: 'Global', country: 'Global' },
  { id: 'ce46', date: '2024-05-10', type: 'WARRANTY_UPDATE', productId: '1', productName: 'Enphase IQ8', manufacturer: 'Enphase Energy', field: 'Warranty', oldValue: '25 years', newValue: '25 years + labor', description: 'Enphase adds labor coverage to standard warranty', source: 'https://newsroom.enphase.com/news-releases/news-release-details/enphase-energy-opens-us-pre-orders-iq9-commercial-microinverters', severity: 'high', region: 'North America', country: 'United States' },
  { id: 'ce47', date: '2024-04-25', type: 'DATASHEET_REVISION', productId: '62', productName: 'SolarEdge SE3000H', manufacturer: 'SolarEdge Technologies', field: 'Datasheet', oldValue: 'Rev 4.5', newValue: 'Rev 5.0', description: 'Major revision with updated efficiency data and new features', source: 'https://knowledge-center.solaredge.com/sites/kc/files/se-home-hub-single-phase-inverter-datasheet-eu.pdf', severity: 'medium', region: 'Global', country: 'Global' },
  { id: 'ce48', date: '2024-04-15', type: 'PRICE_CHANGE', productId: '60', productName: 'Fronius Primo GEN24 3.0 Plus', manufacturer: 'Fronius International', field: 'Price', oldValue: '€1,850', newValue: '€1,650', description: 'Fronius reduces GEN24 prices to improve competitiveness', source: '', severity: 'high', region: 'Europe', country: 'Austria' },
  { id: 'ce49', date: '2024-04-01', type: 'NEW_PRODUCT', productId: '71', productName: 'AEconversion INV250-45', manufacturer: 'AEconversion', description: 'German-made 250W microinverter for small balcony systems', source: 'aeconversion.de/press-releases', severity: 'medium', region: 'Europe', country: 'Germany' },
  { id: 'ce50', date: '2024-03-20', type: 'SPEC_CHANGE', productId: '26', productName: 'Hoymiles HMS-800-2T', manufacturer: 'Hoymiles', field: 'Communication', oldValue: '2.4G RF', newValue: 'Sub-1G RF', description: 'Upgraded to Sub-1G RF for better range and less interference', source: '', severity: 'high', region: 'Global', country: 'Global' },
  { id: 'ce51', date: '2024-03-10', type: 'DISCONTINUATION', productId: '102', productName: 'Enphase IQ6+', manufacturer: 'Enphase Energy', description: 'IQ6+ series fully discontinued, IQ8 series recommended', source: 'enphase.com/support/eol-products', severity: 'critical', region: 'Global', country: 'Global' },
  { id: 'ce52', date: '2024-02-25', type: 'WARRANTY_UPDATE', productId: '17', productName: 'APsystems DS3', manufacturer: 'APsystems', field: 'Warranty', oldValue: '12 years', newValue: '25 years', description: 'APsystems extends DS3 warranty to match Enphase', source: '', severity: 'critical', region: 'Global', country: 'Global' },
  { id: 'ce53', date: '2024-02-15', type: 'DATASHEET_REVISION', productId: '24', productName: 'Hoymiles HM-800', manufacturer: 'Hoymiles', field: 'Datasheet', oldValue: 'Rev 5.0', newValue: 'Rev 5.1', description: 'Added installation guidelines for EU balcony solar', source: '', severity: 'low', region: 'Europe', country: 'Germany' },
  { id: 'ce54', date: '2024-02-01', type: 'NEW_PRODUCT', productId: '67', productName: 'TSUN TSOL-MS600', manufacturer: 'TSUN', description: 'TSUN launches budget-friendly 600W microinverter for EU market', source: '', severity: 'medium', region: 'Europe', country: 'Germany' },
  { id: 'ce55', date: '2024-01-20', type: 'PRICE_CHANGE', productId: '62', productName: 'SolarEdge SE3000H', manufacturer: 'SolarEdge Technologies', field: 'Price', oldValue: '$1,150', newValue: '$950', description: 'SolarEdge reduces HD-Wave prices amid competition', source: '', severity: 'high', region: 'North America', country: 'United States' },
  { id: 'ce56', date: '2024-01-10', type: 'SPEC_CHANGE', productId: '57', productName: 'SMA Sunny Boy 3.0', manufacturer: 'SMA Solar Technology', field: 'ShadeFix', oldValue: 'Optional', newValue: 'Integrated', description: 'ShadeFix optimization now included as standard feature', source: '', severity: 'medium', region: 'Europe', country: 'Germany' },

  // 2023 Events
  { id: 'ce57', date: '2023-12-15', type: 'NEW_PRODUCT', productId: '1', productName: 'Enphase IQ8', manufacturer: 'Enphase Energy', description: 'Enphase launches IQ8 series with sunlight backup capability', source: 'enphase.com/microinverters/iq-microinverters/iq8', severity: 'critical', region: 'North America', country: 'United States' },
  { id: 'ce58', date: '2023-12-01', type: 'DISCONTINUATION', productId: '103', productName: 'Hoymiles HM-350', manufacturer: 'Hoymiles', description: 'HM-350 discontinued, replaced by HM-400', source: 'https://open-energy.hoymiles.com/en/about-us/news/hoymiles-unveils-the-lightest-and-most-efficient-mis-series-microinverter-at-intersolar-north-america-2025/', severity: 'medium', region: 'Global', country: 'Global' },
  { id: 'ce59', date: '2023-11-20', type: 'WARRANTY_UPDATE', productId: '62', productName: 'SolarEdge SE3000H', manufacturer: 'SolarEdge Technologies', field: 'Warranty', oldValue: '10 years', newValue: '12 years', description: 'SolarEdge extends standard warranty on HD-Wave series', source: 'solaredge.com/warranty', severity: 'medium', region: 'Global', country: 'Global' },
  { id: 'ce60', date: '2023-11-10', type: 'PRICE_CHANGE', productId: '24', productName: 'Hoymiles HM-800', manufacturer: 'Hoymiles', field: 'Price', oldValue: '€169', newValue: '€139', description: 'HM-800 price reduced to drive EU balcony solar adoption', source: '', severity: 'high', region: 'Europe', country: 'Germany' },
  { id: 'ce61', date: '2023-10-25', type: 'NEW_PRODUCT', productId: '17', productName: 'APsystems DS3', manufacturer: 'APsystems', description: 'DS3 flagship microinverter launched with dual independent MPPT', source: 'apsystems.com/products/ds3', severity: 'critical', region: 'Global', country: 'Global' },
  { id: 'ce62', date: '2023-10-15', type: 'SPEC_CHANGE', productId: '60', productName: 'Fronius Primo GEN24 3.0 Plus', manufacturer: 'Fronius International', field: 'Battery Support', oldValue: 'BYD HVS/HVM', newValue: 'BYD HVS/HVM + LG RESU', description: 'Added LG RESU battery compatibility', source: '', severity: 'high', region: 'Europe', country: 'Austria' },
  { id: 'ce63', date: '2023-10-01', type: 'DATASHEET_REVISION', productId: '57', productName: 'SMA Sunny Boy 3.0', manufacturer: 'SMA Solar Technology', field: 'Datasheet', oldValue: 'Rev 3.0', newValue: 'Rev 3.1', description: 'Updated grid code compliance information', source: 'sma.de/en/downloads', severity: 'low', region: 'Europe', country: 'Germany' },
  { id: 'ce64', date: '2023-09-20', type: 'NEW_PRODUCT', productId: '51', productName: 'Envertech EVT800', manufacturer: 'Envertech', description: 'Envertech launches 800W dual microinverter for EU market', source: 'envertec.com/press-releases', severity: 'high', region: 'Europe', country: 'Netherlands' },
  { id: 'ce65', date: '2023-09-10', type: 'PRICE_CHANGE', productId: '65', productName: 'Tigo TS4-A-O', manufacturer: 'Tigo Energy', field: 'Price', oldValue: '$65', newValue: '$55', description: 'Tigo reduces optimizer prices to compete with SolarEdge', source: '', severity: 'medium', region: 'North America', country: 'United States' },
  { id: 'ce66', date: '2023-08-25', type: 'WARRANTY_UPDATE', productId: '24', productName: 'Hoymiles HM-800', manufacturer: 'Hoymiles', field: 'Warranty', oldValue: '10 years', newValue: '12 years', description: 'Hoymiles extends warranty on HM series', source: '', severity: 'medium', region: 'Europe', country: 'Germany' },
  { id: 'ce67', date: '2023-08-15', type: 'SPEC_CHANGE', productId: '17', productName: 'APsystems DS3', manufacturer: 'APsystems', field: 'Max Panel Size', oldValue: '500Wp', newValue: '550Wp', description: 'DS3 now supports larger panels following firmware update', source: '', severity: 'medium', region: 'Global', country: 'Global' },
  { id: 'ce68', date: '2023-08-01', type: 'NEW_PRODUCT', productId: '32', productName: 'Deye SUN300G3-EU-230', manufacturer: 'Deye', description: 'Deye enters EU microinverter market with SUN-G3 series', source: 'https://www.deyeinverter.com/deyeinverter/2022/03/16/deyemicroinverter300-2000wg3-eu230-datasheet-2022.pdf', severity: 'high', region: 'Europe', country: 'Germany' },
  { id: 'ce69', date: '2023-07-20', type: 'DISCONTINUATION', productId: '104', productName: 'SolarEdge SE2200H', manufacturer: 'SolarEdge Technologies', description: 'SE2200H discontinued, SE3000H recommended as replacement', source: '', severity: 'medium', region: 'Global', country: 'Global' },
  { id: 'ce70', date: '2023-07-10', type: 'DATASHEET_REVISION', productId: '65', productName: 'Tigo TS4-A-O', manufacturer: 'Tigo Energy', field: 'Datasheet', oldValue: 'Rev 2.0', newValue: 'Rev 2.1', description: 'Added rapid shutdown compliance details for NEC 2020', source: 'tigoenergy.com/resources/downloads', severity: 'low', region: 'North America', country: 'United States' },
  { id: 'ce71', date: '2023-06-25', type: 'PRICE_CHANGE', productId: '57', productName: 'SMA Sunny Boy 3.0', manufacturer: 'SMA Solar Technology', field: 'Price', oldValue: '€950', newValue: '€850', description: 'SMA reduces Sunny Boy prices for residential market', source: '', severity: 'medium', region: 'Europe', country: 'Germany' },
  { id: 'ce72', date: '2023-06-15', type: 'NEW_PRODUCT', productId: '55', productName: 'Chilicon CP-250E', manufacturer: 'Chilicon Power', description: 'Chilicon launches compact 250W microinverter for US market', source: '', severity: 'medium', region: 'North America', country: 'United States' },
  { id: 'ce73', date: '2023-06-01', type: 'SPEC_CHANGE', productId: '62', productName: 'SolarEdge SE3000H', manufacturer: 'SolarEdge Technologies', field: 'Efficiency', oldValue: '99.0%', newValue: '99.2%', description: 'Efficiency rating updated following new testing methodology', source: '', severity: 'low', region: 'Global', country: 'Global' },
  { id: 'ce74', date: '2023-05-20', type: 'WARRANTY_UPDATE', productId: '60', productName: 'Fronius Primo GEN24 3.0 Plus', manufacturer: 'Fronius International', field: 'Warranty', oldValue: '7 years', newValue: '10 years', description: 'Fronius extends GEN24 warranty to 10 years', source: '', severity: 'high', region: 'Europe', country: 'Austria' },
  { id: 'ce75', date: '2023-05-10', type: 'DATASHEET_REVISION', productId: '17', productName: 'APsystems DS3', manufacturer: 'APsystems', field: 'Datasheet', oldValue: 'Rev 1.0', newValue: 'Rev 2.0', description: 'Major datasheet revision with updated specifications', source: 'https://usa.apsystems.com/ds3/', severity: 'medium', region: 'Global', country: 'Global' },
  { id: 'ce76', date: '2023-04-25', type: 'NEW_PRODUCT', productId: '24', productName: 'Hoymiles HM-800', manufacturer: 'Hoymiles', description: 'Hoymiles launches HM-800 dual microinverter for EU balcony solar', source: 'https://open-energy.hoymiles.com/en/about-us/news/hoymiles-unveils-the-lightest-and-most-efficient-mis-series-microinverter-at-intersolar-north-america-2025/', severity: 'high', region: 'Europe', country: 'Germany' },
  { id: 'ce77', date: '2023-04-15', type: 'PRICE_CHANGE', productId: '17', productName: 'APsystems DS3', manufacturer: 'APsystems', field: 'Price', oldValue: '$329', newValue: '$279', description: 'DS3 launch price reduced after initial market feedback', source: '', severity: 'medium', region: 'North America', country: 'United States' },
  { id: 'ce78', date: '2023-04-01', type: 'DISCONTINUATION', productId: '105', productName: 'Fronius Primo 3.0-1', manufacturer: 'Fronius International', description: 'Primo 3.0-1 discontinued, GEN24 series recommended', source: '', severity: 'critical', region: 'Europe', country: 'Austria' },
  { id: 'ce79', date: '2023-03-20', type: 'SPEC_CHANGE', productId: '57', productName: 'SMA Sunny Boy 3.0', manufacturer: 'SMA Solar Technology', field: 'Smart Connected', oldValue: 'Optional', newValue: 'Standard', description: 'Smart Connected service now included as standard', source: '', severity: 'medium', region: 'Europe', country: 'Germany' },
  { id: 'ce80', date: '2023-03-10', type: 'WARRANTY_UPDATE', productId: '17', productName: 'APsystems DS3', manufacturer: 'APsystems', field: 'Warranty', oldValue: '10 years', newValue: '12 years', description: 'APsystems extends DS3 warranty at launch', source: '', severity: 'medium', region: 'Global', country: 'Global' },
  { id: 'ce81', date: '2023-02-25', type: 'DATASHEET_REVISION', productId: '62', productName: 'SolarEdge SE3000H', manufacturer: 'SolarEdge Technologies', field: 'Datasheet', oldValue: 'Rev 4.0', newValue: 'Rev 4.5', description: 'Added StorEdge battery integration specifications', source: 'https://knowledge-center.solaredge.com/sites/kc/files/se-home-hub-single-phase-inverter-datasheet-eu.pdf', severity: 'medium', region: 'Global', country: 'Global' },
  { id: 'ce82', date: '2023-02-15', type: 'NEW_PRODUCT', productId: '47', productName: 'Envertech EVT300', manufacturer: 'Envertech', description: 'Envertech launches entry-level 300W microinverter', source: 'envertec.com/press-releases', severity: 'medium', region: 'Europe', country: 'Netherlands' },
  { id: 'ce83', date: '2023-02-01', type: 'PRICE_CHANGE', productId: '60', productName: 'Fronius Primo GEN24 3.0 Plus', manufacturer: 'Fronius International', field: 'Price', oldValue: '€2,100', newValue: '€1,850', description: 'Fronius reduces GEN24 prices for 2023', source: '', severity: 'high', region: 'Europe', country: 'Austria' },
  { id: 'ce84', date: '2023-01-20', type: 'SPEC_CHANGE', productId: '65', productName: 'Tigo TS4-A-O', manufacturer: 'Tigo Energy', field: 'Firmware', oldValue: 'v2.5', newValue: 'v3.0', description: 'Major firmware update with improved MPPT algorithm', source: '', severity: 'medium', region: 'Global', country: 'Global' },
  { id: 'ce85', date: '2023-01-10', type: 'NEW_PRODUCT', productId: '22', productName: 'Hoymiles HM-300', manufacturer: 'Hoymiles', description: 'Hoymiles launches budget-friendly 300W single microinverter', source: '', severity: 'medium', region: 'Europe', country: 'Germany' },
];

// AI Pipeline Data
export interface CrawlJob {
  id: string;
  manufacturer: string;
  url: string;
  status: 'COMPLETED' | 'RUNNING' | 'FAILED' | 'QUEUED';
  startTime: string;
  completedAt?: string;
  pagesProcessed: number;
  productsFound: number;
  datasheetsFound: number;
  errors: number;
  lastRun: string;
}

export const crawlJobs: CrawlJob[] = [
  { id: 'cj1', manufacturer: 'Enphase Energy', url: 'https://enphase.com/microinverters', status: 'COMPLETED', startTime: '2026-08-31T13:00:00Z', completedAt: '2026-08-31T13:18:00Z', pagesProcessed: 85, productsFound: 16, datasheetsFound: 22, errors: 0, lastRun: '2026-08-31' },
  { id: 'cj2', manufacturer: 'APsystems', url: 'https://apsystems.com/products', status: 'COMPLETED', startTime: '2026-08-31T13:20:00Z', completedAt: '2026-08-31T13:35:00Z', pagesProcessed: 52, productsFound: 9, datasheetsFound: 12, errors: 0, lastRun: '2026-08-31' },
  { id: 'cj3', manufacturer: 'Hoymiles', url: 'https://hoymiles.com/products', status: 'COMPLETED', startTime: '2026-08-31T13:40:00Z', completedAt: '2026-08-31T13:55:00Z', pagesProcessed: 68, productsFound: 14, datasheetsFound: 18, errors: 0, lastRun: '2026-08-31' },
  { id: 'cj4', manufacturer: 'Deye', url: 'https://www.deyeinverter.com/product/microinverter/', status: 'COMPLETED', startTime: '2026-08-31T14:00:00Z', completedAt: '2026-08-31T14:12:00Z', pagesProcessed: 48, productsFound: 12, datasheetsFound: 15, errors: 0, lastRun: '2026-08-31' },
  { id: 'cj5', manufacturer: 'Sigenergy', url: 'https://www.sigenergy.com/en/products/sigenmicro-inverter', status: 'COMPLETED', startTime: '2026-08-31T14:15:00Z', completedAt: '2026-08-31T14:22:00Z', pagesProcessed: 24, productsFound: 6, datasheetsFound: 8, errors: 0, lastRun: '2026-08-31' },
  { id: 'cj6', manufacturer: 'Envertech', url: 'https://www.envertec.com/products/', status: 'COMPLETED', startTime: '2026-08-31T14:25:00Z', completedAt: '2026-08-31T14:38:00Z', pagesProcessed: 35, productsFound: 8, datasheetsFound: 10, errors: 0, lastRun: '2026-08-31' },
  { id: 'cj7', manufacturer: 'Chilicon Power', url: 'https://chiliconpower.com/products', status: 'COMPLETED', startTime: '2026-08-31T14:40:00Z', completedAt: '2026-08-31T14:45:00Z', pagesProcessed: 8, productsFound: 2, datasheetsFound: 3, errors: 0, lastRun: '2026-08-31' },
  { id: 'cj8', manufacturer: 'SMA Solar Technology', url: 'https://sma.de/products', status: 'COMPLETED', startTime: '2026-08-31T14:48:00Z', completedAt: '2026-08-31T15:05:00Z', pagesProcessed: 60, productsFound: 3, datasheetsFound: 9, errors: 0, lastRun: '2026-08-31' },
  { id: 'cj9', manufacturer: 'Fronius International', url: 'https://fronius.com/products', status: 'COMPLETED', startTime: '2026-08-31T15:08:00Z', completedAt: '2026-08-31T15:18:00Z', pagesProcessed: 30, productsFound: 2, datasheetsFound: 6, errors: 0, lastRun: '2026-08-31' },
  { id: 'cj10', manufacturer: 'SolarEdge Technologies', url: 'https://solaredge.com/products', status: 'COMPLETED', startTime: '2026-08-31T15:20:00Z', completedAt: '2026-08-31T15:35:00Z', pagesProcessed: 50, productsFound: 4, datasheetsFound: 7, errors: 0, lastRun: '2026-08-31' },
  { id: 'cj11', manufacturer: 'Tigo Energy', url: 'https://tigoenergy.com/products', status: 'COMPLETED', startTime: '2026-08-31T15:38:00Z', completedAt: '2026-08-31T15:45:00Z', pagesProcessed: 15, productsFound: 2, datasheetsFound: 4, errors: 0, lastRun: '2026-08-31' },
  { id: 'cj12', manufacturer: 'TSUN', url: 'https://www.tsun-ess.com/products', status: 'COMPLETED', startTime: '2026-08-31T15:48:00Z', completedAt: '2026-08-31T15:55:00Z', pagesProcessed: 25, productsFound: 6, datasheetsFound: 7, errors: 0, lastRun: '2026-08-31' },
  { id: 'cj13', manufacturer: 'AEconversion', url: 'https://www.aeconversion.de/en/products/', status: 'COMPLETED', startTime: '2026-08-31T15:58:00Z', completedAt: '2026-08-31T16:05:00Z', pagesProcessed: 12, productsFound: 3, datasheetsFound: 4, errors: 0, lastRun: '2026-08-31' },
  { id: 'cj14', manufacturer: 'Atmoce', url: 'https://www.atmoce.com/en/Microinverter', status: 'COMPLETED', startTime: '2026-08-31T16:08:00Z', completedAt: '2026-08-31T16:18:00Z', pagesProcessed: 28, productsFound: 8, datasheetsFound: 8, errors: 0, lastRun: '2026-08-31' },
];

// Saved Searches
export interface SavedSearch {
  id: string;
  name: string;
  query: string;
  filters: Record<string, any>;
  createdAt: string;
  resultCount: number;
}

export const savedSearches: SavedSearch[] = [
  { id: 'ss1', name: 'EU Balcony Solar <800W', query: '', filters: { maxPower: 800, countries: ['Germany', 'France', 'Netherlands'] }, createdAt: '2025-06-15', resultCount: 5 },
  { id: 'ss2', name: 'Enphase IQ8 Series', query: 'IQ8', filters: { manufacturers: ['Enphase Energy'] }, createdAt: '2025-06-10', resultCount: 5 },
  { id: 'ss3', name: '25-Year Warranty Products', query: '', filters: { minWarranty: 25 }, createdAt: '2025-05-20', resultCount: 10 },
  { id: 'ss4', name: 'High Efficiency >97%', query: '', filters: { minEfficiency: 97 }, createdAt: '2025-05-15', resultCount: 12 },
];

export const countries = [
  'United States', 'Canada', 'Mexico', 'Australia', 'New Zealand', 'Germany', 'France', 'Italy', 'Spain',
  'Netherlands', 'Belgium', 'Austria', 'Switzerland', 'United Kingdom', 'Ireland', 'Sweden', 'Norway',
  'Denmark', 'Finland', 'Poland', 'Czech Republic', 'Hungary', 'Romania', 'Bulgaria', 'Greece', 'Portugal',
  'Luxembourg', 'Croatia', 'Slovakia', 'Slovenia', 'Japan', 'South Korea', 'India', 'Thailand',
  'Philippines', 'Vietnam', 'Taiwan', 'Singapore', 'Malaysia', 'Indonesia', 'Brazil', 'Chile',
  'Argentina', 'Colombia', 'Peru', 'South Africa', 'UAE', 'Saudi Arabia', 'Israel', 'Turkey',
  'Egypt', 'Morocco', 'Kenya', 'Nigeria'
];

export const regions: Record<string, string[]> = {
  'North America': ['United States', 'Canada', 'Mexico'],
  'Europe': ['Germany', 'France', 'Italy', 'Spain', 'Netherlands', 'Belgium', 'Austria', 'Switzerland',
             'United Kingdom', 'Ireland', 'Sweden', 'Norway', 'Denmark', 'Finland', 'Poland',
             'Czech Republic', 'Hungary', 'Romania', 'Bulgaria', 'Greece', 'Portugal', 'Luxembourg',
             'Croatia', 'Slovakia', 'Slovenia'],
  'Asia Pacific': ['Australia', 'New Zealand', 'Japan', 'South Korea', 'India', 'Thailand',
                   'Philippines', 'Vietnam', 'Taiwan', 'Singapore', 'Malaysia', 'Indonesia'],
  'Latin America': ['Brazil', 'Mexico', 'Chile', 'Argentina', 'Colombia', 'Peru'],
  'Middle East & Africa': ['South Africa', 'UAE', 'Saudi Arabia', 'Israel', 'Turkey', 'Egypt',
                           'Morocco', 'Kenya', 'Nigeria']
};
