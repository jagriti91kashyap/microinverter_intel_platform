'use client';

import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import { TrendingUp, Users, Globe, Award, Zap, Shield, Download, Brain } from 'lucide-react';

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

interface ManufacturerStats {
  manufacturer: string;
  country: string;
  productCount: number;
  avgPower: number;
  avgEfficiency: number;
  avgWarranty: number;
  powerRange: { min: number; max: number };
  topSeries: string;
  monitoringPlatform: string;
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16'];

export default function ManufacturerComparisonPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedManufacturers, setSelectedManufacturers] = useState<string[]>([]);
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

  const getManufacturerStats = (): ManufacturerStats[] => {
    const stats = products.reduce((acc, product) => {
      const manufacturerName = product.manufacturer.name;
      if (!acc[manufacturerName]) {
        acc[manufacturerName] = {
          products: [],
          country: product.manufacturer.country,
          monitoringPlatform: product.monitoringPlatform
        };
      }
      acc[manufacturerName].products.push(product);
      return acc;
    }, {} as Record<string, { products: Product[]; country: string; monitoringPlatform: string }>);

    return Object.entries(stats).map(([manufacturer, data]) => {
      const products = data.products;
      const powers = products.map(p => p.acPower);
      const efficiencies = products.map(p => p.efficiency || 0);
      const warranties = products.map(p => p.warranty);
      const seriesCount = products.reduce((acc, p) => {
        acc[p.series] = (acc[p.series] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
      const topSeries = Object.entries(seriesCount).sort(([,a], [,b]) => b - a)[0]?.[0] || '';

      return {
        manufacturer,
        country: data.country,
        productCount: products.length,
        avgPower: powers.reduce((a, b) => a + b, 0) / powers.length,
        avgEfficiency: efficiencies.reduce((a, b) => a + b, 0) / efficiencies.length,
        avgWarranty: warranties.reduce((a, b) => a + b, 0) / warranties.length,
        powerRange: {
          min: Math.min(...powers),
          max: Math.max(...powers)
        },
        topSeries,
        monitoringPlatform: data.monitoringPlatform
      };
    }).sort((a, b) => b.productCount - a.productCount);
  };

  const generateCompetitorSummary = (): string[] => {
    const stats = getManufacturerStats();
    if (stats.length < 2) return [];

    const enphase = stats.find(s => s.manufacturer.toLowerCase().includes('enphase'));
    const competitors = stats.filter(s => !s.manufacturer.toLowerCase().includes('enphase'));
    const paragraphs: string[] = [];

    // Opening paragraph about Enphase position
    if (enphase) {
      paragraphs.push(
        `Enphase Energy currently offers ${enphase.productCount} products with an average efficiency of ${enphase.avgEfficiency.toFixed(1)}% and an average warranty of ${enphase.avgWarranty.toFixed(1)} years. Its power output ranges from ${enphase.powerRange.min}W to ${enphase.powerRange.max}W, positioning it as a strong residential-focused microinverter manufacturer.`
      );
    }

    // Rank threats by composite score
    const maxProducts = Math.max(...stats.map(s => s.productCount));
    const maxPower = Math.max(...stats.map(s => s.avgPower));
    const maxEff = Math.max(...stats.map(s => s.avgEfficiency));
    const maxWarranty = Math.max(...stats.map(s => s.avgWarranty));

    const ranked = competitors.map(c => {
      const score = (maxProducts > 0 ? c.productCount / maxProducts : 0) * 0.3
        + (maxPower > 0 ? c.avgPower / maxPower : 0) * 0.25
        + (maxEff > 0 ? c.avgEfficiency / maxEff : 0) * 0.25
        + (maxWarranty > 0 ? c.avgWarranty / maxWarranty : 0) * 0.2;
      return { ...c, score };
    }).sort((a, b) => b.score - a.score);

    // Generate a sentence per competitor
    for (const c of ranked) {
      const advantages: string[] = [];
      const disadvantages: string[] = [];

      if (enphase) {
        if (c.avgEfficiency >= enphase.avgEfficiency) advantages.push(`a higher average efficiency (${c.avgEfficiency.toFixed(1)}% vs ${enphase.avgEfficiency.toFixed(1)}%)`);
        else disadvantages.push(`lower efficiency`);
        if (c.avgPower >= enphase.avgPower) advantages.push(`stronger average power output (${Math.round(c.avgPower)}W vs ${Math.round(enphase.avgPower)}W)`);
        if (c.avgWarranty >= enphase.avgWarranty) advantages.push(`a longer warranty (${c.avgWarranty.toFixed(1)} vs ${enphase.avgWarranty.toFixed(1)} years)`);
        else disadvantages.push(`a shorter warranty`);
        if (c.productCount >= enphase.productCount) advantages.push(`a broader product lineup (${c.productCount} products)`);
        if (c.powerRange.max > enphase.powerRange.max) advantages.push(`higher-power models reaching ${c.powerRange.max}W`);
      }

      let sentence = '';
      if (c.score > 0.65) {
        sentence = `${c.manufacturer} (${c.country}) is a direct threat to Enphase.`;
        if (advantages.length > 0) sentence += ` They offer ${advantages.join(', ')}.`;
        if (disadvantages.length > 0) sentence += ` However, they have ${disadvantages.join(' and ')}.`;
        sentence += ` With ${c.productCount} products in market, they are well-positioned to compete head-to-head.`;
      } else if (c.score > 0.5) {
        sentence = `${c.manufacturer} (${c.country}) is a notable competitor worth monitoring.`;
        if (advantages.length > 0) sentence += ` They stand out with ${advantages.join(', ')}.`;
        if (disadvantages.length > 0) sentence += ` On the other hand, they have ${disadvantages.join(' and ')}.`;
      } else if (c.score > 0.35) {
        sentence = `${c.manufacturer} (${c.country}) is an emerging player in the microinverter space.`;
        if (advantages.length > 0) sentence += ` While they offer ${advantages.join(', ')}, their overall portfolio is still limited compared to Enphase.`;
        else sentence += ` Their portfolio remains limited compared to Enphase.`;
      } else {
        sentence = `${c.manufacturer} (${c.country}) is a niche player with ${c.productCount} product${c.productCount !== 1 ? 's' : ''} and does not currently pose a significant competitive threat to Enphase.`;
      }

      paragraphs.push(sentence);
    }

    return paragraphs;
  };

  const getCountryDistribution = () => {
    const stats = getManufacturerStats();
    const distribution = stats.reduce((acc, stat) => {
      acc[stat.country] = (acc[stat.country] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(distribution).map(([country, count]) => ({
      country,
      count
    })).sort((a, b) => b.count - a.count);
  };

  const getPowerRangeData = () => {
    const stats = getManufacturerStats();
    return stats.slice(0, 8).map(stat => ({
      manufacturer: stat.manufacturer.length > 10 ? stat.manufacturer.substring(0, 10) + '...' : stat.manufacturer,
      minPower: stat.powerRange.min,
      maxPower: stat.powerRange.max,
      avgPower: stat.avgPower
    }));
  };

  const getRadarData = () => {
    const stats = getManufacturerStats();
    return stats.slice(0, 6).map(stat => ({
      manufacturer: stat.manufacturer.length > 12 ? stat.manufacturer.substring(0, 12) + '...' : stat.manufacturer,
      products: (stat.productCount / 20) * 100, // Normalized to 100
      avgPower: (stat.avgPower / 5000) * 100, // Normalized to 100
      avgEfficiency: stat.avgEfficiency,
      avgWarranty: (stat.avgWarranty / 25) * 100, // Normalized to 100
      powerRange: ((stat.powerRange.max - stat.powerRange.min) / 5000) * 100 // Normalized to 100
    }));
  };

  const exportComparisonData = () => {
    const stats = getManufacturerStats();
    const headers = [
      'Manufacturer', 'Country', 'Product Count', 'Average Power (W)', 
      'Average Efficiency (%)', 'Average Warranty (Years)', 
      'Min Power (W)', 'Max Power (W)', 'Top Series', 'Monitoring Platform'
    ];
    
    const csvContent = [
      headers.join(','),
      ...stats.map(stat => [
        `"${stat.manufacturer}"`,
        `"${stat.country}"`,
        stat.productCount,
        Math.round(stat.avgPower),
        stat.avgEfficiency.toFixed(1),
        stat.avgWarranty.toFixed(1),
        stat.powerRange.min,
        stat.powerRange.max,
        `"${stat.topSeries}"`,
        `"${stat.monitoringPlatform}"`
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `manufacturer_comparison_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (!token) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Authentication Required</h2>
          <p className="text-gray-600 mb-6">Please log in to access manufacturer comparison.</p>
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

  const manufacturerStats = getManufacturerStats();
  const countryDistribution = getCountryDistribution();
  const powerRangeData = getPowerRangeData();
  const radarData = getRadarData();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            <TrendingUp className="inline-block w-8 h-8 mr-2" />
            Manufacturer Comparison Analytics
          </h1>
          <p className="text-gray-600">
            Comprehensive analysis and comparison of microinverter manufacturers across key metrics.
          </p>
        </div>

        {/* Export Button */}
        <div className="mb-6 flex justify-end">
          <button
            onClick={exportComparisonData}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center"
          >
            <Download className="w-4 h-4 mr-2" />
            Export Comparison Data
          </button>
        </div>

        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading manufacturer analytics...</p>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Key Metrics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="glass-card rounded-xl shadow-apple-lg p-6 apple-card-hover">
                <div className="flex items-center">
                  <Users className="w-8 h-8 text-primary mr-3" />
                  <div>
                    <p className="text-sm text-muted-foreground">Total Manufacturers</p>
                    <p className="text-2xl font-bold text-foreground">{manufacturerStats.length}</p>
                  </div>
                </div>
              </div>
              <div className="glass-card rounded-xl shadow-apple-lg p-6 apple-card-hover">
                <div className="flex items-center">
                  <Globe className="w-8 h-8 text-green-600 mr-3" />
                  <div>
                    <p className="text-sm text-muted-foreground">Countries</p>
                    <p className="text-2xl font-bold text-foreground">{countryDistribution.length}</p>
                  </div>
                </div>
              </div>
              <div className="glass-card rounded-xl shadow-apple-lg p-6 apple-card-hover">
                <div className="flex items-center">
                  <Zap className="w-8 h-8 text-yellow-600 mr-3" />
                  <div>
                    <p className="text-sm text-muted-foreground">Total Products</p>
                    <p className="text-2xl font-bold text-foreground">{products.length}</p>
                  </div>
                </div>
              </div>
              <div className="glass-card rounded-xl shadow-apple-lg p-6 apple-card-hover">
                <div className="flex items-center">
                  <Award className="w-8 h-8 text-purple-600 mr-3" />
                  <div>
                    <p className="text-sm text-muted-foreground">Avg Efficiency</p>
                    <p className="text-2xl font-bold text-foreground">
                      {(manufacturerStats.reduce((acc, stat) => acc + stat.avgEfficiency, 0) / manufacturerStats.length).toFixed(1)}%
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Manufacturer Comparison Table */}
            <div className="glass-card rounded-xl shadow-apple-lg overflow-hidden">
              <div className="px-6 py-4 border-b border-border/20">
                <h2 className="text-xl font-semibold text-foreground">Manufacturer Performance Overview</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-border/20">
                  <thead className="glass-card">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Manufacturer
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Country
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Products
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Avg Power
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Avg Efficiency
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Avg Warranty
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Power Range
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Top Series
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-background divide-y divide-border/20">
                    {manufacturerStats.map((stat, index) => (
                      <tr key={stat.manufacturer} className="hover:bg-muted/50 apple-card-hover">
                        <td className="px-6 py-4 whitespace-nowrap font-medium text-foreground">
                          {stat.manufacturer}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">
                          {stat.country}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">
                          {stat.productCount}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">
                          {Math.round(stat.avgPower)}W
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">
                          {stat.avgEfficiency.toFixed(1)}%
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">
                          {stat.avgWarranty.toFixed(1)} years
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">
                          {stat.powerRange.min}W - {stat.powerRange.max}W
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">
                          {stat.topSeries}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* AI Competitor Summary */}
            {(() => {
              const paragraphs = generateCompetitorSummary();
              if (paragraphs.length === 0) return null;
              return (
                <div className="glass-card rounded-xl shadow-apple-lg p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Brain className="w-5 h-5 text-indigo-500" />
                    <h2 className="text-xl font-semibold text-foreground">AI Summary: Competitive Threat & Market Perception</h2>
                  </div>
                  <div className="prose prose-sm max-w-none text-foreground space-y-3">
                    {paragraphs.map((p, i) => (
                      <p key={i} className="leading-relaxed text-sm">{p}</p>
                    ))}
                  </div>
                </div>
              );
            })()}

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Country Distribution */}
              <div className="glass-card rounded-xl shadow-apple-lg p-6">
                <h3 className="text-lg font-semibold text-foreground mb-4">Manufacturer Distribution by Country</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={countryDistribution}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={(entry: any) => `${entry.country}: ${entry.count}`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="count"
                    >
                      {countryDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Power Range Comparison */}
              <div className="glass-card rounded-xl shadow-apple-lg p-6">
                <h3 className="text-lg font-semibold text-foreground mb-4">Power Range Comparison (Top 8)</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={powerRangeData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="manufacturer" angle={-45} textAnchor="end" height={80} />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="minPower" fill="#3b82f6" name="Min Power (W)" />
                    <Bar dataKey="avgPower" fill="#10b981" name="Avg Power (W)" />
                    <Bar dataKey="maxPower" fill="#f59e0b" name="Max Power (W)" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Radar Chart */}
            <div className="glass-card rounded-xl shadow-apple-lg p-6">
              <h3 className="text-lg font-semibold text-foreground mb-4">Multi-Metric Comparison (Top 6)</h3>
              <ResponsiveContainer width="100%" height={400}>
                <RadarChart data={radarData}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="manufacturer" />
                  <PolarRadiusAxis angle={90} domain={[0, 100]} />
                  <Radar name="Products" dataKey="products" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.6} />
                  <Radar name="Avg Power" dataKey="avgPower" stroke="#10b981" fill="#10b981" fillOpacity={0.6} />
                  <Radar name="Efficiency" dataKey="avgEfficiency" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.6} />
                  <Radar name="Warranty" dataKey="avgWarranty" stroke="#ef4444" fill="#ef4444" fillOpacity={0.6} />
                  <Radar name="Power Range" dataKey="powerRange" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.6} />
                  <Legend />
                  <Tooltip />
                </RadarChart>
              </ResponsiveContainer>
            </div>

            {/* Insights Section */}
            <div className="glass-card rounded-xl shadow-apple-lg p-6">
              <h3 className="text-lg font-semibold text-foreground mb-4">
                <Shield className="inline-block w-5 h-5 mr-2" />
                Key Insights
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="glass-card p-4 rounded-xl apple-card-hover">
                  <h4 className="font-semibold text-primary mb-2">Market Leaders</h4>
                  <p className="text-sm text-foreground">
                    <strong>{manufacturerStats[0]?.manufacturer}</strong> leads with {manufacturerStats[0]?.productCount} products, 
                    followed by <strong>{manufacturerStats[1]?.manufacturer}</strong> with {manufacturerStats[1]?.productCount} products.
                  </p>
                </div>
                <div className="glass-card p-4 rounded-xl apple-card-hover">
                  <h4 className="font-semibold text-green-600 mb-2">Geographic Distribution</h4>
                  <p className="text-sm text-foreground">
                    <strong>{countryDistribution[0]?.country}</strong> has the most manufacturers ({countryDistribution[0]?.count}), 
                    indicating strong regional presence.
                  </p>
                </div>
                <div className="glass-card p-4 rounded-xl apple-card-hover">
                  <h4 className="font-semibold text-yellow-600 mb-2">Efficiency Leaders</h4>
                  <p className="text-sm text-foreground">
                    <strong>{manufacturerStats.reduce((a, b) => a.avgEfficiency > b.avgEfficiency ? a : b)?.manufacturer}</strong> 
                    offers the highest average efficiency at {manufacturerStats.reduce((a, b) => a.avgEfficiency > b.avgEfficiency ? a : b)?.avgEfficiency.toFixed(1)}%.
                  </p>
                </div>
                <div className="glass-card p-4 rounded-xl apple-card-hover">
                  <h4 className="font-semibold text-purple-600 mb-2">Warranty Champions</h4>
                  <p className="text-sm text-foreground">
                    <strong>{manufacturerStats.reduce((a, b) => a.avgWarranty > b.avgWarranty ? a : b)?.manufacturer}</strong> 
                    provides the best warranty coverage at {manufacturerStats.reduce((a, b) => a.avgWarranty > b.avgWarranty ? a : b)?.avgWarranty.toFixed(1)} years.
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
