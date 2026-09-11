'use client';

import { useState, useEffect } from 'react';
import { TrendingUp, BarChart3, PieChart, Activity, Download, RefreshCw, Filter } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AnalyticsChart, generateMockAnalyticsData } from '@/components/charts/analytics-chart';

interface AnalyticsMetrics {
  totalProducts: number;
  totalManufacturers: number;
  avgEfficiency: number;
  marketGrowth: number;
  topManufacturer: string;
  avgPower: number;
}

export default function AnalyticsPage() {
  const [data, setData] = useState(generateMockAnalyticsData());
  const [metrics, setMetrics] = useState<AnalyticsMetrics>({
    totalProducts: 0,
    totalManufacturers: 0,
    avgEfficiency: 0,
    marketGrowth: 0,
    topManufacturer: '',
    avgPower: 0
  });
  const [loading, setLoading] = useState(false);
  const [timeRange, setTimeRange] = useState('6months');
  const [selectedRegion, setSelectedRegion] = useState('all');

  useEffect(() => {
    calculateMetrics();
  }, [data]);

  const calculateMetrics = () => {
    const totalProducts = data.monthlyTrends.reduce((sum, month) => sum + month.products, 0);
    const totalManufacturers = data.manufacturerMarketShare.length;
    const avgEfficiency = data.efficiencyComparison.reduce((sum, m) => sum + m.efficiency, 0) / data.efficiencyComparison.length;
    const marketGrowth = ((data.monthlyTrends[data.monthlyTrends.length - 1].products - data.monthlyTrends[0].products) / data.monthlyTrends[0].products) * 100;
    const topManufacturer = data.manufacturerMarketShare[0]?.name || '';
    const avgPower = data.monthlyTrends.reduce((sum, month) => sum + month.avgPower, 0) / data.monthlyTrends.length;

    setMetrics({
      totalProducts,
      totalManufacturers,
      avgEfficiency,
      marketGrowth,
      topManufacturer,
      avgPower
    });
  };

  const handleRefresh = () => {
    setLoading(true);
    setTimeout(() => {
      setData(generateMockAnalyticsData());
      setLoading(false);
    }, 1000);
  };

  const handleExport = () => {
    const exportData = {
      metrics,
      monthlyTrends: data.monthlyTrends,
      manufacturerMarketShare: data.manufacturerMarketShare,
      powerDistribution: data.powerDistribution,
      efficiencyComparison: data.efficiencyComparison,
      regionalData: data.regionalData,
      exportDate: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `analytics_export_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold gradient-text">Analytics Dashboard</h1>
          <p className="text-muted-foreground mt-1">Comprehensive insights and market analysis</p>
        </div>
        <div className="flex gap-3">
          <div className="flex gap-2">
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="px-3 py-2 glass-card rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              <option value="1month">Last Month</option>
              <option value="3months">Last 3 Months</option>
              <option value="6months">Last 6 Months</option>
              <option value="1year">Last Year</option>
            </select>
            <select
              value={selectedRegion}
              onChange={(e) => setSelectedRegion(e.target.value)}
              className="px-3 py-2 glass-card rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              <option value="all">All Regions</option>
              <option value="north-america">North America</option>
              <option value="europe">Europe</option>
              <option value="asia-pacific">Asia Pacific</option>
            </select>
          </div>
          <Button variant="outline" onClick={handleRefresh} disabled={loading} className="apple-button">
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button onClick={handleExport} className="apple-gradient">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-6">
        <Card className="glass-card apple-card-hover">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Products</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.totalProducts.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">In database</p>
          </CardContent>
        </Card>
        <Card className="glass-card apple-card-hover">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Manufacturers</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.totalManufacturers}</div>
            <p className="text-xs text-muted-foreground">Active brands</p>
          </CardContent>
        </Card>
        <Card className="glass-card apple-card-hover">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Efficiency</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.avgEfficiency.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">Industry average</p>
          </CardContent>
        </Card>
        <Card className="glass-card apple-card-hover">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Market Growth</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              <span className={metrics.marketGrowth >= 0 ? 'text-green-600' : 'text-red-600'}>
                {metrics.marketGrowth >= 0 ? '+' : ''}{metrics.marketGrowth.toFixed(1)}%
              </span>
            </div>
            <p className="text-xs text-muted-foreground">vs previous period</p>
          </CardContent>
        </Card>
        <Card className="glass-card apple-card-hover">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Top Manufacturer</CardTitle>
            <PieChart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.topManufacturer}</div>
            <p className="text-xs text-muted-foreground">Market leader</p>
          </CardContent>
        </Card>
        <Card className="glass-card apple-card-hover">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Power</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Math.round(metrics.avgPower)}W</div>
            <p className="text-xs text-muted-foreground">Per inverter</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Monthly Trends */}
        <AnalyticsChart
          data={data}
          type="line"
          title="Monthly Product Trends"
          height={350}
        />

        {/* Power Distribution */}
        <AnalyticsChart
          data={data}
          type="bar"
          title="Power Range Distribution"
          height={350}
        />

        {/* Market Share */}
        <AnalyticsChart
          data={data}
          type="pie"
          title="Manufacturer Market Share"
          height={350}
        />

        {/* Efficiency Comparison */}
        <AnalyticsChart
          data={data}
          type="radar"
          title="Multi-Metric Comparison"
          height={350}
        />
      </div>

      {/* Regional Analysis */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Regional Performance Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {data.regionalData.map((region, index) => (
              <div key={region.region} className="p-4 glass-card rounded-xl apple-card-hover">
                <h4 className="font-semibold mb-2">{region.region}</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Products</span>
                    <span className="font-medium">{region.products}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Manufacturers</span>
                    <span className="font-medium">{region.manufacturers}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Avg Efficiency</span>
                    <span className="font-medium">{region.avgEfficiency.toFixed(1)}%</span>
                  </div>
                </div>
                <div className="mt-3">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-primary h-2 rounded-full" 
                      style={{ width: `${(region.products / Math.max(...data.regionalData.map(r => r.products))) * 100}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Insights Section */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle>Key Insights</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <div className="p-4 glass-card rounded-xl apple-card-hover">
              <h4 className="font-semibold text-primary mb-2">Growth Trend</h4>
              <p className="text-sm text-muted-foreground">
                Market has grown by {metrics.marketGrowth.toFixed(1)}% over the selected period, 
                indicating strong demand for microinverter technology.
              </p>
            </div>
            <div className="p-4 glass-card rounded-xl apple-card-hover">
              <h4 className="font-semibold text-green-600 mb-2">Efficiency Leader</h4>
              <p className="text-sm text-muted-foreground">
                {data.efficiencyComparison.reduce((a, b) => a.efficiency > b.efficiency ? a : b)?.manufacturer} 
                leads with {Math.max(...data.efficiencyComparison.map(m => m.efficiency)).toFixed(1)}% average efficiency.
              </p>
            </div>
            <div className="p-4 glass-card rounded-xl apple-card-hover">
              <h4 className="font-semibold text-yellow-600 mb-2">Power Range</h4>
              <p className="text-sm text-muted-foreground">
                Most popular power range is 500-1000W with {data.powerDistribution[1]?.count} units, 
                representing {data.powerDistribution[1]?.percentage}% of the market.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
