'use client';

import { useState, useEffect } from 'react';
import { MapPin, Globe, TrendingUp, AlertTriangle, CheckCircle, XCircle, Download, Filter } from 'lucide-react';

interface Manufacturer {
  id: string;
  name: string;
  country: string;
  website: string;
  isActive: boolean;
}

interface Product {
  id: string;
  name: string;
  series: string;
  model: string;
  acPower: number;
  mppt: number;
  warranty: number;
  efficiency: number;
  monitoringPlatform: string;
  status: string;
  manufacturer: Manufacturer;
}

interface RegionalData {
  region: string;
  countries: string[];
  manufacturerCount: number;
  productCount: number;
  avgPower: number;
  topManufacturers: string[];
  marketShare: number;
}

interface CountryData {
  country: string;
  region: string;
  manufacturers: string[];
  productCount: number;
  powerRange: { min: number; max: number };
  avgEfficiency: number;
  avgWarranty: number;
  availability: 'High' | 'Medium' | 'Low';
}

const REGIONS = {
  'North America': ['United States', 'Canada', 'Mexico'],
  'Europe': ['Germany', 'United Kingdom', 'France', 'Spain', 'Italy', 'Netherlands', 'Austria', 'Switzerland', 'Poland', 'Belgium', 'Sweden', 'Denmark', 'Norway', 'Finland', 'Greece', 'Portugal', 'Ireland'],
  'Asia Pacific': ['China', 'Japan', 'South Korea', 'Taiwan', 'Australia', 'Vietnam', 'Singapore', 'India'],
  'Latin America': ['Brazil'],
  'Middle East': ['Israel'],
  'Africa': ['South Africa']
};

export default function GlobalAvailabilityPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRegion, setSelectedRegion] = useState<string>('');
  const [selectedCountry, setSelectedCountry] = useState<string>('');
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const storedToken = localStorage.getItem('auth_token');
    if (storedToken) {
      setToken(storedToken);
    }
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/products?pageSize=200');

      if (response.ok) {
        const data = await response.json();
        setProducts(data.items || []);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const getRegionalData = (): RegionalData[] => {
    return Object.entries(REGIONS).map(([region, countries]) => {
      const regionProducts = products.filter(p => countries.includes(p.manufacturer.country));
      const manufacturers = [...new Set(regionProducts.map(p => p.manufacturer.name))];
      const manufacturerCounts = manufacturers.reduce((acc, name) => {
        acc[name] = regionProducts.filter(p => p.manufacturer.name === name).length;
        return acc;
      }, {} as Record<string, number>);
      
      const topManufacturers = Object.entries(manufacturerCounts)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 3)
        .map(([name]) => name);

      return {
        region,
        countries,
        manufacturerCount: manufacturers.length,
        productCount: regionProducts.length,
        avgPower: regionProducts.length > 0 
          ? regionProducts.reduce((sum, p) => sum + p.acPower, 0) / regionProducts.length 
          : 0,
        topManufacturers,
        marketShare: (regionProducts.length / products.length) * 100
      };
    }).sort((a, b) => b.productCount - a.productCount);
  };

  const getCountryData = (): CountryData[] => {
    const allCountries = [...new Set(products.map(p => p.manufacturer.country))];
    
    return allCountries.map(country => {
      const countryProducts = products.filter(p => p.manufacturer.country === country);
      const manufacturers = [...new Set(countryProducts.map(p => p.manufacturer.name))];
      const powers = countryProducts.map(p => p.acPower);
      const efficiencies = countryProducts.map(p => p.efficiency || 0);
      const warranties = countryProducts.map(p => p.warranty);
      
      // Determine availability based on product count
      let availability: 'High' | 'Medium' | 'Low';
      if (countryProducts.length >= 10) availability = 'High';
      else if (countryProducts.length >= 5) availability = 'Medium';
      else availability = 'Low';

      // Find region for this country
      const region = Object.entries(REGIONS).find(([_, countries]) => 
        countries.includes(country)
      )?.[0] || 'Other';

      return {
        country,
        region,
        manufacturers,
        productCount: countryProducts.length,
        powerRange: {
          min: Math.min(...powers),
          max: Math.max(...powers)
        },
        avgEfficiency: efficiencies.reduce((a, b) => a + b, 0) / efficiencies.length,
        avgWarranty: warranties.reduce((a, b) => a + b, 0) / warranties.length,
        availability
      };
    }).sort((a, b) => b.productCount - a.productCount);
  };

  const getFilteredData = () => {
    let countryData = getCountryData();
    
    if (selectedRegion) {
      countryData = countryData.filter(c => c.region === selectedRegion);
    }
    
    if (selectedCountry) {
      countryData = countryData.filter(c => c.country.toLowerCase().includes(selectedCountry.toLowerCase()));
    }
    
    return countryData;
  };

  const exportGlobalData = () => {
    const regionalData = getRegionalData();
    const countryData = getCountryData();
    
    const csvContent = [
      'GLOBAL AVAILABILITY REPORT',
      '',
      'Regional Summary',
      'Region,Countries,Manufacturers,Products,Avg Power (W),Market Share (%),Top Manufacturers',
      ...regionalData.map(r => [
        `"${r.region}"`,
        r.countries.length,
        r.manufacturerCount,
        r.productCount,
        Math.round(r.avgPower),
        r.marketShare.toFixed(1),
        `"${r.topManufacturers.join(', ')}"`
      ].join(',')),
      '',
      'Country Details',
      'Country,Region,Manufacturers,Products,Min Power (W),Max Power (W),Avg Efficiency (%),Avg Warranty (Years),Availability',
      ...countryData.map(c => [
        `"${c.country}"`,
        `"${c.region}"`,
        c.manufacturers.length,
        c.productCount,
        c.powerRange.min,
        c.powerRange.max,
        c.avgEfficiency.toFixed(1),
        c.avgWarranty.toFixed(1),
        c.availability
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `global_availability_analysis_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (!token) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Authentication Required</h2>
          <p className="text-gray-600 mb-6">Please log in to access global availability analysis.</p>
          <button
            onClick={() => window.location.href = '/login'}
            className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  const regionalData = getRegionalData();
  const countryData = getFilteredData();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            <Globe className="inline-block w-8 h-8 mr-2" />
            Global Availability & Regional Analysis
          </h1>
          <p className="text-gray-600">
            Comprehensive analysis of microinverter availability across global regions and countries.
          </p>
        </div>

        {/* Filters */}
        <div className="glass-card rounded-xl shadow-apple-lg p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Filter by Region
              </label>
              <select
                value={selectedRegion}
                onChange={(e) => setSelectedRegion(e.target.value)}
                className="w-full px-3 py-2 glass-card rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                <option value="">All Regions</option>
                {Object.keys(REGIONS).map(region => (
                  <option key={region} value={region}>{region}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Filter by Country
              </label>
              <input
                type="text"
                value={selectedCountry}
                onChange={(e) => setSelectedCountry(e.target.value)}
                placeholder="Search country..."
                className="w-full px-3 py-2 glass-card rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <div className="flex items-end">
              <button
                onClick={exportGlobalData}
                className="w-full px-4 py-2 apple-gradient text-white rounded-xl hover:opacity-90 flex items-center justify-center transition-all duration-200"
              >
                <Download className="w-4 h-4 mr-2" />
                Export Analysis
              </button>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading global availability data...</p>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Global Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="glass-card rounded-xl shadow-apple-lg p-6 apple-card-hover">
                <div className="flex items-center">
                  <Globe className="w-8 h-8 text-primary mr-3" />
                  <div>
                    <p className="text-sm text-muted-foreground">Total Countries</p>
                    <p className="text-2xl font-bold text-foreground">{countryData.length}</p>
                  </div>
                </div>
              </div>
              <div className="glass-card rounded-xl shadow-apple-lg p-6 apple-card-hover">
                <div className="flex items-center">
                  <MapPin className="w-8 h-8 text-green-600 mr-3" />
                  <div>
                    <p className="text-sm text-muted-foreground">Regions</p>
                    <p className="text-2xl font-bold text-foreground">{regionalData.length}</p>
                  </div>
                </div>
              </div>
              <div className="glass-card rounded-xl shadow-apple-lg p-6 apple-card-hover">
                <div className="flex items-center">
                  <TrendingUp className="w-8 h-8 text-yellow-600 mr-3" />
                  <div>
                    <p className="text-sm text-muted-foreground">Total Products</p>
                    <p className="text-2xl font-bold text-foreground">{products.length}</p>
                  </div>
                </div>
              </div>
              <div className="glass-card rounded-xl shadow-apple-lg p-6 apple-card-hover">
                <div className="flex items-center">
                  <CheckCircle className="w-8 h-8 text-purple-600 mr-3" />
                  <div>
                    <p className="text-sm text-muted-foreground">High Availability</p>
                    <p className="text-2xl font-bold text-foreground">
                      {countryData.filter(c => c.availability === 'High').length}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Regional Overview */}
            <div className="glass-card rounded-xl shadow-apple-lg overflow-hidden">
              <div className="px-6 py-4 border-b border-border/20">
                <h2 className="text-xl font-semibold text-foreground">Regional Overview</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-border/20">
                  <thead className="glass-card">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Region
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Countries
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Manufacturers
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Products
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Market Share
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Top Manufacturers
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-background divide-y divide-border/20">
                    {regionalData.map((region) => (
                      <tr key={region.region} className="hover:bg-muted/50 apple-card-hover">
                        <td className="px-6 py-4 whitespace-nowrap font-medium text-foreground">
                          {region.region}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">
                          {region.countries.length}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">
                          {region.manufacturerCount}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">
                          {region.productCount}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">
                          {region.marketShare.toFixed(1)}%
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">
                          <div className="flex flex-wrap gap-1">
                            {region.topManufacturers.map((mfg, idx) => (
                              <span key={idx} className="px-2 py-1 glass-card text-primary text-xs rounded-lg">
                                {mfg}
                              </span>
                            ))}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Country Analysis */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900">
                  Country Analysis {selectedRegion && `- ${selectedRegion}`}
                </h2>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Country
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Region
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Manufacturers
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Products
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Power Range
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Avg Efficiency
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Avg Warranty
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Availability
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {countryData.map((country) => (
                      <tr key={country.country} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">
                          {country.country}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {country.region}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {country.manufacturers.length}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {country.productCount}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {country.powerRange.min}W - {country.powerRange.max}W
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {country.avgEfficiency.toFixed(1)}%
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {country.avgWarranty.toFixed(1)} years
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            country.availability === 'High' 
                              ? 'bg-green-100 text-green-800' 
                              : country.availability === 'Medium'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {country.availability}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Key Insights */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                <AlertTriangle className="inline-block w-5 h-5 mr-2" />
                Key Market Insights
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-blue-900 mb-2">Dominant Region</h4>
                  <p className="text-sm text-blue-800">
                    <strong>{regionalData[0]?.region}</strong> leads with {regionalData[0]?.productCount} products 
                    ({regionalData[0]?.marketShare.toFixed(1)}% market share)
                  </p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-green-900 mb-2">Most Available Country</h4>
                  <p className="text-sm text-green-800">
                    <strong>{countryData[0]?.country}</strong> offers the highest availability with {countryData[0]?.productCount} products
                  </p>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-purple-900 mb-2">Emerging Markets</h4>
                  <p className="text-sm text-purple-800">
                    <strong>{countryData.filter(c => c.availability === 'Low').length}</strong> countries show low availability, 
                    indicating growth opportunities
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
