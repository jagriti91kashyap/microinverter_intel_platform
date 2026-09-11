'use client';

import { useState, useEffect } from 'react';
import { Search, Filter, Download, ExternalLink, FileText, Globe } from 'lucide-react';
import { ClientOnly } from '@/components/client-only';
import { MainLayout } from '@/components/layout/main-layout';

interface Manufacturer {
  id: string;
  name: string;
  country: string;
}

interface Product {
  id: string;
  name: string;
  series: string;
  model: string;
  acPower: number;
  mppt: number;
  warranty: number;
  monitoringPlatform: string;
  status: string;
  datasheetUrl?: string;
  productUrl?: string;
  manufacturer: Manufacturer;
}

const COUNTRIES = [
  'United States', 'China', 'Germany', 'Israel', 'Austria', 'Canada', 
  'Spain', 'France', 'Switzerland', 'Taiwan', 'Japan', 'Netherlands',
  'Australia', 'Italy', 'Germany', 'United Kingdom', 'Brazil', 'India',
  'South Korea', 'Mexico', 'Poland', 'Vietnam', 'Belgium', 'Sweden',
  'Denmark', 'Norway', 'Finland', 'Greece', 'Portugal', 'Ireland'
];

const REGIONS = [
  'North America', 'Europe', 'Asia Pacific', 'Latin America', 'Middle East', 'Africa'
];

export default function CountryFilterPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCountry, setSelectedCountry] = useState('');
  const [selectedRegion, setSelectedRegion] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    // Check for auth_token in localStorage (matching the auth system)
    const storedToken = localStorage.getItem('auth_token');
    if (storedToken) {
      setToken(storedToken);
    } else {
      // Try to get token from sessionStorage as fallback
      const sessionToken = sessionStorage.getItem('auth_token');
      if (sessionToken) {
        setToken(sessionToken);
        localStorage.setItem('auth_token', sessionToken); // Move to localStorage for persistence
      }
    }
  }, []);

  useEffect(() => {
    if (token) {
      fetchProducts();
    }
  }, [token, selectedCountry, selectedRegion]);

  useEffect(() => {
    let filtered = products;

    if (searchTerm) {
      filtered = filtered.filter(product =>
        product.manufacturer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.series.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.model.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredProducts(filtered);
  }, [searchTerm, products]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedCountry) params.append('country', selectedCountry);
      params.append('pageSize', '200');

      const response = await fetch(`/api/products?${params}`);

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

  const handleCountryChange = (country: string) => {
    setSelectedCountry(country);
    setSelectedRegion(''); // Clear region when country is selected
  };

  const handleRegionChange = (region: string) => {
    setSelectedRegion(region);
    setSelectedCountry(''); // Clear country when region is selected
  };

  const exportToCSV = () => {
    const headers = [
      'Manufacturer', 'Product', 'Series', 'AC Power (W)', 'MPPT', 
      'Warranty (Years)', 'Monitoring Platform', 'Status', 
      'Country', 'Datasheet URL', 'Product URL'
    ];
    
    const csvContent = [
      headers.join(','),
      ...filteredProducts.map(product => [
        `"${product.manufacturer.name}"`,
        `"${product.name}"`,
        `"${product.series}"`,
        product.acPower,
        product.mppt,
        product.warranty,
        `"${product.monitoringPlatform}"`,
        product.status,
        `"${product.manufacturer.country}"`,
        `"${product.datasheetUrl || ''}"`,
        `"${product.productUrl || ''}"`
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `microinverters_${selectedCountry || selectedRegion || 'all'}_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const getCountryStats = () => {
    const stats = products.reduce((acc, product) => {
      const country = product.manufacturer.country;
      if (!acc[country]) {
        acc[country] = { count: 0, manufacturers: new Set() };
      }
      acc[country].count++;
      acc[country].manufacturers.add(product.manufacturer.name);
      return acc;
    }, {} as Record<string, { count: number; manufacturers: Set<string> }>);

    return Object.entries(stats).map(([country, data]) => ({
      country,
      count: data.count,
      manufacturers: data.manufacturers.size
    })).sort((a, b) => b.count - a.count);
  };

  if (!token) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Authentication Required</h2>
          <p className="text-gray-600 mb-6">Please log in to access the country filter.</p>
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

  return (
    <MainLayout>
      <ClientOnly fallback={<div className="space-y-6">Loading country filter...</div>}>
        <div className="space-y-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            <Globe className="inline-block w-8 h-8 mr-2" />
            Country-Wise Microinverter Filter
          </h1>
          <p className="text-gray-600">
            Search and filter microinverters by country or region. Find available products in specific markets.
          </p>
        </div>

        {/* Filters */}
        <div className="glass-card rounded-xl p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {/* Country Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Filter by Country
              </label>
              <select
                value={selectedCountry}
                onChange={(e) => handleCountryChange(e.target.value)}
                className="w-full px-3 py-2 glass-card rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                <option value="">All Countries</option>
                {COUNTRIES.map(country => (
                  <option key={country} value={country}>{country}</option>
                ))}
              </select>
            </div>

            {/* Region Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Filter by Region
              </label>
              <select
                value={selectedRegion}
                onChange={(e) => handleRegionChange(e.target.value)}
                className="w-full px-3 py-2 glass-card rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                <option value="">All Regions</option>
                {REGIONS.map(region => (
                  <option key={region} value={region}>{region}</option>
                ))}
              </select>
            </div>

            {/* Search */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search Products
              </label>
              <div className="flex items-center gap-2 glass-card rounded-xl px-3 py-2 focus-within:ring-2 focus-within:ring-primary/20">
                <Search className="w-4 h-4 text-gray-400 flex-shrink-0" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search by manufacturer, product, model..."
                  className="w-full bg-transparent outline-none"
                />
              </div>
            </div>

            {/* Export Button */}
            <div className="flex items-end">
              <button
                onClick={exportToCSV}
                disabled={filteredProducts.length === 0}
                className="w-full px-4 py-2 apple-gradient text-white rounded-xl hover:opacity-90 disabled:bg-gray-400 flex items-center justify-center transition-all duration-200"
              >
                <Download className="w-4 h-4 mr-2" />
                Export CSV
              </button>
            </div>
          </div>

          {/* Country Statistics */}
          {products.length > 0 && (
            <div className="border-t pt-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Market Statistics</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
                {getCountryStats().slice(0, 6).map(stat => (
                  <div key={stat.country} className="glass-card p-3 rounded-xl apple-card-hover">
                    <div className="text-sm font-medium text-gray-900">{stat.country}</div>
                    <div className="text-xs text-gray-600">{stat.count} products</div>
                    <div className="text-xs text-gray-500">{stat.manufacturers} manufacturers</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Results Table */}
        <div className="glass-card rounded-xl overflow-hidden">
          <div className="px-6 py-4 border-b border-border/20">
            <h2 className="text-xl font-semibold text-foreground">
              Available Products ({filteredProducts.length})
            </h2>
          </div>

          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
              <p className="mt-4 text-muted-foreground">Loading products...</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-border/20">
                <thead className="glass-card">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Manufacturer
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Product
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Series
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      AC Power
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      MPPT
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Warranty
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Monitoring Platform
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Datasheet
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Product URL
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-background divide-y divide-border/20">
                  {filteredProducts.map((product) => (
                    <tr key={product.id} className="hover:bg-muted/50 apple-card-hover">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-foreground">
                            {product.manufacturer.name}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {product.manufacturer.country}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">
                        {product.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">
                        {product.series}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">
                        {product.acPower}W
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">
                        {product.mppt}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">
                        {product.warranty} years
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">
                        {product.monitoringPlatform}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          product.status === 'ACTIVE' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {product.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {product.datasheetUrl ? (
                          <a
                            href={product.datasheetUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:text-primary/80 inline-flex items-center apple-button"
                          >
                            <FileText className="w-4 h-4 mr-1" />
                            Datasheet
                          </a>
                        ) : (
                          <span className="text-muted-foreground">Not available</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {product.productUrl ? (
                          <a
                            href={product.productUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:text-primary/80 inline-flex items-center apple-button"
                          >
                            <ExternalLink className="w-4 h-4 mr-1" />
                            Product
                          </a>
                        ) : (
                          <span className="text-muted-foreground">Not available</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {filteredProducts.length === 0 && !loading && (
                <div className="p-8 text-center text-muted-foreground">
                  <Filter className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />
                  <p>No products found matching your criteria.</p>
                  <p className="text-sm mt-2">Try adjusting your filters or search terms.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      </ClientOnly>
    </MainLayout>
  );
}
