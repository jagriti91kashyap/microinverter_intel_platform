'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Download, Database, RefreshCw, Filter, Search, FileText, Upload } from 'lucide-react';

export default function DataPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  useEffect(() => {
    // Simulate loading data management information
    setTimeout(() => {
      setData({
        overview: {
          totalProducts: 113,
          totalManufacturers: 24,
          totalDatasheets: 89,
          dataLastUpdated: '2026-06-29T10:32:01.197Z',
          storageUsed: '2.4 GB',
          apiCalls: 125430,
          dataQuality: '98.5%'
        },
        datasets: [
          {
            name: 'Product Specifications',
            records: 113,
            lastUpdated: '2026-06-29',
            size: '456 MB',
            quality: '99.2%',
            status: 'Active'
          },
          {
            name: 'Manufacturer Information',
            records: 24,
            lastUpdated: '2026-06-28',
            size: '12 MB',
            quality: '100%',
            status: 'Active'
          },
          {
            name: 'Technical Datasheets',
            records: 89,
            lastUpdated: '2026-06-27',
            size: '1.8 GB',
            quality: '97.8%',
            status: 'Active'
          },
          {
            name: 'Market Pricing Data',
            records: 113,
            lastUpdated: '2026-06-29',
            size: '23 MB',
            quality: '96.5%',
            status: 'Active'
          },
          {
            name: 'Regional Compliance',
            records: 49,
            lastUpdated: '2026-06-26',
            size: '8 MB',
            quality: '98.1%',
            status: 'Active'
          }
        ],
        recentUpdates: [
          {
            dataset: 'Product Specifications',
            action: 'Updated',
            records: 5,
            timestamp: '2026-06-29T10:32:01.197Z',
            details: 'Added new regional variants for EU markets'
          },
          {
            dataset: 'Technical Datasheets',
            action: 'Added',
            records: 12,
            timestamp: '2026-06-28T15:45:23.456Z',
            details: 'Updated datasheets for SolarEdge HD-Wave series'
          },
          {
            dataset: 'Manufacturer Information',
            action: 'Updated',
            records: 4,
            timestamp: '2026-06-28T09:12:45.789Z',
            details: 'Added Atmoce, Sigenergy, Envertech, Deye manufacturers'
          },
          {
            dataset: 'Market Pricing Data',
            action: 'Refreshed',
            records: 113,
            timestamp: '2026-06-27T18:30:12.345Z',
            details: 'Updated pricing for all products'
          }
        ],
        dataQuality: {
          completeness: 98.5,
          accuracy: 97.2,
          consistency: 99.1,
          timeliness: 96.8
        }
      });
      setLoading(false);
    }, 1000);
  }, []);

  const filteredDatasets = data?.datasets?.filter((dataset: any) => {
    const matchesSearch = dataset.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || 
      (selectedCategory === 'active' && dataset.status === 'Active') ||
      (selectedCategory === 'inactive' && dataset.status !== 'Active');
    return matchesSearch && matchesCategory;
  }) || [];

  if (loading) {
    return (
      <div className="container mx-auto py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
          <div className="h-96 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Data Management</h1>
        <p className="text-gray-600">Monitor and manage platform data quality and availability</p>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Products</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.overview.totalProducts}</div>
            <p className="text-xs text-muted-foreground">
              Across {data.overview.totalManufacturers} manufacturers
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Datasheets</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.overview.totalDatasheets}</div>
            <p className="text-xs text-muted-foreground">
              Technical documentation files
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Data Quality</CardTitle>
            <RefreshCw className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.overview.dataQuality}</div>
            <p className="text-xs text-muted-foreground">
              Overall accuracy score
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Storage</CardTitle>
            <Upload className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.overview.storageUsed}</div>
            <p className="text-xs text-muted-foreground">
              Total data storage
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="datasets" className="space-y-4">
        <TabsList>
          <TabsTrigger value="datasets">Datasets</TabsTrigger>
          <TabsTrigger value="quality">Data Quality</TabsTrigger>
          <TabsTrigger value="updates">Recent Updates</TabsTrigger>
          <TabsTrigger value="exports">Data Exports</TabsTrigger>
        </TabsList>

        <TabsContent value="datasets" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Dataset Management</CardTitle>
              <CardDescription>Monitor and manage all platform datasets</CardDescription>
            </CardHeader>
            <CardContent>
              {/* Filters */}
              <div className="flex gap-4 mb-6">
                <div className="flex-1">
                  <Label htmlFor="search" className="sr-only">Search</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="search"
                      placeholder="Search datasets..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <Select value={selectedCategory} onValueChange={(value) => setSelectedCategory(value || '')}>
                  <SelectTrigger className="w-48">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Datasets</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Dataset List */}
              <div className="space-y-4">
                {filteredDatasets.map((dataset: any, index: number) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{dataset.name}</span>
                        <Badge variant={dataset.status === 'Active' ? 'default' : 'secondary'}>
                          {dataset.status}
                        </Badge>
                      </div>
                      <div className="flex gap-4 mt-1 text-sm text-gray-600">
                        <span>{dataset.records.toLocaleString()} records</span>
                        <span>•</span>
                        <span>{dataset.size}</span>
                        <span>•</span>
                        <span>Updated: {dataset.lastUpdated}</span>
                        <span>•</span>
                        <span className="text-green-600">Quality: {dataset.quality}</span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        <Download className="h-4 w-4 mr-1" />
                        Export
                      </Button>
                      <Button variant="outline" size="sm">
                        <RefreshCw className="h-4 w-4 mr-1" />
                        Refresh
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="quality" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Data Quality Metrics</CardTitle>
              <CardDescription>Overall data quality assessment across different dimensions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {Object.entries(data.dataQuality).map(([metric, value]: [string, any]) => (
                  <div key={metric} className="space-y-2">
                    <div className="flex justify-between">
                      <span className="font-medium capitalize">{metric}</span>
                      <span className="text-sm text-gray-600">{value}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${
                          value >= 98 ? 'bg-green-600' : 
                          value >= 95 ? 'bg-yellow-600' : 'bg-red-600'
                        }`}
                        style={{ width: `${value}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="updates" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Data Updates</CardTitle>
              <CardDescription>Latest changes to platform datasets</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {data.recentUpdates.map((update: any, index: number) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{update.dataset}</span>
                        <Badge variant="outline">{update.action}</Badge>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">{update.details}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(update.timestamp).toLocaleString()}
                      </p>
                    </div>
                    <div className="text-sm text-gray-600">
                      {update.records} records
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="exports" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Data Exports</CardTitle>
              <CardDescription>Export platform data in various formats</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Product Catalog</CardTitle>
                    <CardDescription>Complete product specifications database</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <Button className="w-full" variant="outline">
                        <Download className="h-4 w-4 mr-2" />
                        Export as CSV
                      </Button>
                      <Button className="w-full" variant="outline">
                        <Download className="h-4 w-4 mr-2" />
                        Export as JSON
                      </Button>
                      <Button className="w-full" variant="outline">
                        <Download className="h-4 w-4 mr-2" />
                        Export as Excel
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Manufacturer Data</CardTitle>
                    <CardDescription>Manufacturer information and contacts</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <Button className="w-full" variant="outline">
                        <Download className="h-4 w-4 mr-2" />
                        Export as CSV
                      </Button>
                      <Button className="w-full" variant="outline">
                        <Download className="h-4 w-4 mr-2" />
                        Export as JSON
                      </Button>
                      <Button className="w-full" variant="outline">
                        <Download className="h-4 w-4 mr-2" />
                        Export as Excel
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Analytics Report</CardTitle>
                    <CardDescription>Comprehensive analytics dashboard data</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <Button className="w-full" variant="outline">
                        <Download className="h-4 w-4 mr-2" />
                        Export as PDF
                      </Button>
                      <Button className="w-full" variant="outline">
                        <Download className="h-4 w-4 mr-2" />
                        Export as Excel
                      </Button>
                      <Button className="w-full" variant="outline">
                        <Download className="h-4 w-4 mr-2" />
                        Export as PowerPoint
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Custom Export</CardTitle>
                    <CardDescription>Create custom data exports</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <Button className="w-full">
                        <Download className="h-4 w-4 mr-2" />
                        Create Custom Export
                      </Button>
                      <p className="text-xs text-gray-600 text-center">
                        Select specific fields and filters
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
