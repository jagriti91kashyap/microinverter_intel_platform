// Mock data for microinverter products and manufacturers

export interface Manufacturer {
  id: string;
  name: string;
  country: string;
  website: string;
  isActive: boolean;
  foundedYear?: number;
  description?: string;
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
  status: string;
  imageUrl?: string;
  datasheetUrl?: string;
  productUrl?: string;
  manufacturerId: string;
  manufacturer: Manufacturer;
  countries: string[];
  price?: number;
  availability: 'IN_STOCK' | 'OUT_OF_STOCK' | 'LIMITED';
}

// Mock manufacturers data
export const mockManufacturers: Manufacturer[] = [
  {
    id: '1',
    name: 'Enphase Energy',
    country: 'United States',
    website: 'https://enphase.com',
    isActive: true,
    foundedYear: 2006,
    description: 'Leading microinverter technology provider'
  },
  {
    id: '2',
    name: 'SolarEdge Technologies',
    country: 'Israel',
    website: 'https://solaredge.com',
    isActive: true,
    foundedYear: 2006,
    description: 'Power optimizer and inverter solutions'
  },
  {
    id: '3',
    name: 'Chilicon Power',
    country: 'United States',
    website: 'https://chiliconpower.com',
    isActive: true,
    foundedYear: 2010,
    description: 'Microinverter systems for residential solar'
  },
  {
    id: '4',
    name: 'APsystems',
    country: 'United States',
    website: 'https://apsystems.com',
    isActive: true,
    foundedYear: 2010,
    description: 'Microinverter and energy storage solutions'
  },
  {
    id: '5',
    name: 'Hoymiles',
    country: 'China',
    website: 'https://hoymiles.com',
    isActive: true,
    foundedYear: 2012,
    description: 'Cost-effective microinverter solutions'
  },
  {
    id: '6',
    name: 'SMA Solar Technology',
    country: 'Germany',
    website: 'https://sma.de',
    isActive: true,
    foundedYear: 1981,
    description: 'German solar technology leader'
  },
  {
    id: '7',
    name: 'Fronius International',
    country: 'Austria',
    website: 'https://fronius.com',
    isActive: true,
    foundedYear: 1945,
    description: 'Austrian welding and solar technology'
  },
  {
    id: '8',
    name: 'Altenergy Power System (APS)',
    country: 'United States',
    website: 'https://altenergypower.com',
    isActive: true,
    foundedYear: 2009,
    description: 'Microinverter and energy management'
  }
];

// Mock products data
export const mockProducts: Product[] = [
  // Enphase Products
  {
    id: '1',
    name: 'IQ8 Microinverter',
    series: 'IQ8',
    model: 'IQ8-60-4-US',
    acPower: 245,
    maxModuleSize: 250,
    voltage: 240,
    mppt: 2,
    efficiency: 97.5,
    warranty: 25,
    weight: 2.7,
    dimensions: '185 x 215 x 31 mm',
    monitoringPlatform: 'Enphase Enlighten',
    status: 'ACTIVE',
    manufacturerId: '1',
    manufacturer: mockManufacturers[0],
    countries: ['United States', 'Canada', 'Australia', 'Germany', 'France', 'Italy', 'Spain', 'Netherlands'],
    price: 189.99,
    availability: 'IN_STOCK'
  },
  {
    id: '2',
    name: 'IQ8+ Microinverter',
    series: 'IQ8',
    model: 'IQ8P-72-2-US',
    acPower: 295,
    maxModuleSize: 300,
    voltage: 240,
    mppt: 2,
    efficiency: 97.5,
    warranty: 25,
    weight: 2.9,
    dimensions: '185 x 215 x 31 mm',
    monitoringPlatform: 'Enphase Enlighten',
    status: 'ACTIVE',
    manufacturerId: '1',
    manufacturer: mockManufacturers[0],
    countries: ['United States', 'Canada', 'Australia', 'Germany', 'France', 'Italy', 'Spain', 'Netherlands'],
    price: 224.99,
    availability: 'IN_STOCK'
  },
  {
    id: '3',
    name: 'IQ8A Microinverter',
    series: 'IQ8',
    model: 'IQ8A-72-2-US',
    acPower: 366,
    maxModuleSize: 380,
    voltage: 240,
    mppt: 2,
    efficiency: 97.5,
    warranty: 25,
    weight: 3.1,
    dimensions: '185 x 215 x 31 mm',
    monitoringPlatform: 'Enphase Enlighten',
    status: 'ACTIVE',
    manufacturerId: '1',
    manufacturer: mockManufacturers[0],
    countries: ['United States', 'Canada', 'Australia', 'Germany', 'France', 'Italy', 'Spain', 'Netherlands'],
    price: 269.99,
    availability: 'IN_STOCK'
  },
  // SolarEdge Products
  {
    id: '4',
    name: 'SolarEdge Residential Inverter',
    series: 'SE',
    model: 'SE6000H-US',
    acPower: 6000,
    maxModuleSize: 7500,
    voltage: 240,
    mppt: 2,
    efficiency: 98.0,
    warranty: 12,
    weight: 24.3,
    dimensions: '592 x 379 x 210 mm',
    monitoringPlatform: 'SolarEdge Monitoring Platform',
    status: 'ACTIVE',
    manufacturerId: '2',
    manufacturer: mockManufacturers[1],
    countries: ['United States', 'Canada', 'Germany', 'France', 'Italy', 'Spain', 'Netherlands', 'Belgium'],
    price: 1250.00,
    availability: 'IN_STOCK'
  },
  {
    id: '5',
    name: 'SolarEdge Commercial Inverter',
    series: 'SE',
    model: 'SE10K-US',
    acPower: 10000,
    maxModuleSize: 11500,
    voltage: 208,
    mppt: 8,
    efficiency: 98.5,
    warranty: 10,
    weight: 52.0,
    dimensions: '700 x 460 x 270 mm',
    monitoringPlatform: 'SolarEdge Monitoring Platform',
    status: 'ACTIVE',
    manufacturerId: '2',
    manufacturer: mockManufacturers[1],
    countries: ['United States', 'Canada', 'Germany', 'France', 'Italy', 'Spain', 'Netherlands', 'Belgium'],
    price: 2850.00,
    availability: 'IN_STOCK'
  },
  // Chilicon Products
  {
    id: '6',
    name: 'CP-250E Microinverter',
    series: 'CP',
    model: 'CP-250E',
    acPower: 250,
    maxModuleSize: 260,
    voltage: 240,
    mppt: 1,
    efficiency: 96.5,
    warranty: 25,
    weight: 2.5,
    dimensions: '165 x 185 x 30 mm',
    monitoringPlatform: 'Chilicon Cloud',
    status: 'ACTIVE',
    manufacturerId: '3',
    manufacturer: mockManufacturers[2],
    countries: ['United States', 'Canada', 'Australia', 'New Zealand', 'Germany', 'France'],
    price: 195.00,
    availability: 'IN_STOCK'
  },
  {
    id: '7',
    name: 'CP-350E Microinverter',
    series: 'CP',
    model: 'CP-350E',
    acPower: 350,
    maxModuleSize: 365,
    voltage: 240,
    mppt: 1,
    efficiency: 96.5,
    warranty: 25,
    weight: 2.8,
    dimensions: '165 x 185 x 30 mm',
    monitoringPlatform: 'Chilicon Cloud',
    status: 'ACTIVE',
    manufacturerId: '3',
    manufacturer: mockManufacturers[2],
    countries: ['United States', 'Canada', 'Australia', 'New Zealand', 'Germany', 'France'],
    price: 245.00,
    availability: 'IN_STOCK'
  },
  // APsystems Products
  {
    id: '8',
    name: 'QS1 Microinverter',
    series: 'QS',
    model: 'QS1',
    acPower: 300,
    maxModuleSize: 320,
    voltage: 240,
    mppt: 2,
    efficiency: 97.0,
    warranty: 25,
    weight: 3.2,
    dimensions: '190 x 230 x 35 mm',
    monitoringPlatform: 'APsystems ECU',
    status: 'ACTIVE',
    manufacturerId: '4',
    manufacturer: mockManufacturers[3],
    countries: ['United States', 'Canada', 'Australia', 'New Zealand', 'Germany', 'France', 'Italy', 'Spain'],
    price: 215.00,
    availability: 'IN_STOCK'
  },
  {
    id: '9',
    name: 'YL-1000 Microinverter',
    series: 'YL',
    model: 'YL-1000',
    acPower: 1000,
    maxModuleSize: 1050,
    voltage: 240,
    mppt: 4,
    efficiency: 97.5,
    warranty: 25,
    weight: 8.5,
    dimensions: '280 x 320 x 45 mm',
    monitoringPlatform: 'APsystems ECU',
    status: 'ACTIVE',
    manufacturerId: '4',
    manufacturer: mockManufacturers[3],
    countries: ['United States', 'Canada', 'Australia', 'New Zealand', 'Germany', 'France', 'Italy', 'Spain'],
    price: 595.00,
    availability: 'IN_STOCK'
  },
  // Hoymiles Products
  {
    id: '10',
    name: 'HM-600 Microinverter',
    series: 'HM',
    model: 'HM-600',
    acPower: 300,
    maxModuleSize: 320,
    voltage: 240,
    mppt: 2,
    efficiency: 96.5,
    warranty: 10,
    weight: 2.6,
    dimensions: '170 x 190 x 30 mm',
    monitoringPlatform: 'Hoymiles Monitoring',
    status: 'ACTIVE',
    manufacturerId: '5',
    manufacturer: mockManufacturers[4],
    countries: ['China', 'Australia', 'New Zealand', 'Germany', 'France', 'Italy', 'Spain', 'Netherlands'],
    price: 125.00,
    availability: 'IN_STOCK'
  },
  {
    id: '11',
    name: 'HM-1200 Microinverter',
    series: 'HM',
    model: 'HM-1200',
    acPower: 600,
    maxModuleSize: 650,
    voltage: 240,
    mppt: 2,
    efficiency: 97.0,
    warranty: 10,
    weight: 4.8,
    dimensions: '210 x 240 x 35 mm',
    monitoringPlatform: 'Hoymiles Monitoring',
    status: 'ACTIVE',
    manufacturerId: '5',
    manufacturer: mockManufacturers[4],
    countries: ['China', 'Australia', 'New Zealand', 'Germany', 'France', 'Italy', 'Spain', 'Netherlands'],
    price: 285.00,
    availability: 'IN_STOCK'
  },
  // SMA Products
  {
    id: '12',
    name: 'Sunny Boy 3.0-US',
    series: 'Sunny Boy',
    model: 'SB3.0-1AV-40',
    acPower: 3000,
    maxModuleSize: 3200,
    voltage: 240,
    mppt: 2,
    efficiency: 97.5,
    warranty: 10,
    weight: 17.5,
    dimensions: '514 x 261 x 188 mm',
    monitoringPlatform: 'SMA Sunny Portal',
    status: 'ACTIVE',
    manufacturerId: '6',
    manufacturer: mockManufacturers[5],
    countries: ['Germany', 'France', 'Italy', 'Spain', 'Netherlands', 'Belgium', 'Austria', 'Switzerland'],
    price: 950.00,
    availability: 'IN_STOCK'
  },
  {
    id: '13',
    name: 'Sunny Boy 5.0-US',
    series: 'Sunny Boy',
    model: 'SB5.0-1AV-41',
    acPower: 5000,
    maxModuleSize: 5500,
    voltage: 240,
    mppt: 2,
    efficiency: 98.0,
    warranty: 10,
    weight: 18.5,
    dimensions: '514 x 261 x 188 mm',
    monitoringPlatform: 'SMA Sunny Portal',
    status: 'ACTIVE',
    manufacturerId: '6',
    manufacturer: mockManufacturers[5],
    countries: ['Germany', 'France', 'Italy', 'Spain', 'Netherlands', 'Belgium', 'Austria', 'Switzerland'],
    price: 1450.00,
    availability: 'IN_STOCK'
  },
  // Fronius Products
  {
    id: '14',
    name: 'Primo 3.0-1',
    series: 'Primo',
    model: '3.0-1',
    acPower: 3000,
    maxModuleSize: 3200,
    voltage: 240,
    mppt: 2,
    efficiency: 97.8,
    warranty: 10,
    weight: 18.0,
    dimensions: '520 x 266 x 173 mm',
    monitoringPlatform: 'Fronius Solar.web',
    status: 'ACTIVE',
    manufacturerId: '7',
    manufacturer: mockManufacturers[6],
    countries: ['Austria', 'Germany', 'France', 'Italy', 'Spain', 'Netherlands', 'Belgium', 'Switzerland'],
    price: 1100.00,
    availability: 'IN_STOCK'
  },
  {
    id: '15',
    name: 'Primo 5.0-1',
    series: 'Primo',
    model: '5.0-1',
    acPower: 5000,
    maxModuleSize: 5400,
    voltage: 240,
    mppt: 2,
    efficiency: 98.1,
    warranty: 10,
    weight: 19.0,
    dimensions: '520 x 266 x 173 mm',
    monitoringPlatform: 'Fronius Solar.web',
    status: 'ACTIVE',
    manufacturerId: '7',
    manufacturer: mockManufacturers[6],
    countries: ['Austria', 'Germany', 'France', 'Italy', 'Spain', 'Netherlands', 'Belgium', 'Switzerland'],
    price: 1650.00,
    availability: 'IN_STOCK'
  }
];

// Countries and regions for filtering
export const countries = [
  'United States', 'Canada', 'Australia', 'New Zealand', 'Germany', 'France', 'Italy', 'Spain', 
  'Netherlands', 'Belgium', 'Austria', 'Switzerland', 'China', 'Japan', 'South Korea', 'India',
  'United Kingdom', 'Ireland', 'Sweden', 'Norway', 'Denmark', 'Finland', 'Poland', 'Czech Republic',
  'Hungary', 'Romania', 'Bulgaria', 'Greece', 'Portugal', 'Brazil', 'Mexico', 'Argentina', 'Chile'
];

export const regions = {
  'North America': ['United States', 'Canada', 'Mexico'],
  'Europe': ['Germany', 'France', 'Italy', 'Spain', 'Netherlands', 'Belgium', 'Austria', 'Switzerland', 
             'United Kingdom', 'Ireland', 'Sweden', 'Norway', 'Denmark', 'Finland', 'Poland', 
             'Czech Republic', 'Hungary', 'Romania', 'Bulgaria', 'Greece', 'Portugal'],
  'Asia Pacific': ['Australia', 'New Zealand', 'China', 'Japan', 'South Korea', 'India'],
  'South America': ['Brazil', 'Argentina', 'Chile']
};
