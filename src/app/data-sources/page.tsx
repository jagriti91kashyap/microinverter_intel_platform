'use client';

import { useState, useEffect } from 'react';
import { Database, Globe, FileText, CheckCircle, XCircle, AlertCircle, Plus, Edit, Trash2, RefreshCw, Download, Upload } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface DataSource {
  id: string;
  name: string;
  type: 'API' | 'CSV' | 'Database' | 'Manual';
  status: 'Active' | 'Inactive' | 'Error';
  lastSync: string;
  recordCount: number;
  description: string;
  url?: string;
  frequency?: string;
  error?: string;
}

const mockDataSources: DataSource[] = [
  {
    id: '1',
    name: 'Enphase Product Catalog',
    type: 'API',
    status: 'Active',
    lastSync: '2024-01-15T10:30:00Z',
    recordCount: 245,
    description: 'Official Enphase microinverter product data',
    url: 'https://api.enphaseenergy.com/products',
    frequency: 'Daily'
  },
  {
    id: '2',
    name: 'SolarEdge Database',
    type: 'Database',
    status: 'Active',
    lastSync: '2024-01-15T09:15:00Z',
    recordCount: 189,
    description: 'SolarEdge product specifications and pricing',
    frequency: 'Hourly'
  },
  {
    id: '3',
    name: 'Manufacturer CSV Import',
    type: 'CSV',
    status: 'Inactive',
    lastSync: '2024-01-14T16:45:00Z',
    recordCount: 156,
    description: 'Bulk manufacturer data import',
    frequency: 'Weekly'
  },
  {
    id: '4',
    name: 'Manual Entry - Chint Power',
    type: 'Manual',
    status: 'Active',
    lastSync: '2024-01-15T11:00:00Z',
    recordCount: 67,
    description: 'Manually entered Chint Power microinverter data'
  },
  {
    id: '5',
    name: 'Huawei API Integration',
    type: 'API',
    status: 'Error',
    lastSync: '2024-01-15T08:30:00Z',
    recordCount: 0,
    description: 'Huawei product data API',
    url: 'https://api.huawei.com/solar/products',
    frequency: 'Daily',
    error: 'Authentication failed: Invalid API key'
  }
];

export default function DataSourcesPage() {
  const [dataSources, setDataSources] = useState<DataSource[]>(mockDataSources);
  const [loading, setLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingSource, setEditingSource] = useState<DataSource | null>(null);
  const [filter, setFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredSources = dataSources.filter(source => {
    const matchesFilter = filter === 'all' || source.status.toLowerCase() === filter.toLowerCase();
    const matchesSearch = source.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         source.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Active':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'Inactive':
        return <XCircle className="w-4 h-4 text-gray-400" />;
      case 'Error':
        return <AlertCircle className="w-4 h-4 text-red-600" />;
      default:
        return <AlertCircle className="w-4 h-4 text-yellow-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active':
        return 'bg-green-100 text-green-800';
      case 'Inactive':
        return 'bg-gray-100 text-gray-800';
      case 'Error':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'API':
        return <Globe className="w-4 h-4" />;
      case 'Database':
        return <Database className="w-4 h-4" />;
      case 'CSV':
        return <FileText className="w-4 h-4" />;
      case 'Manual':
        return <Edit className="w-4 h-4" />;
      default:
        return <Database className="w-4 h-4" />;
    }
  };

  const handleSync = async (sourceId: string) => {
    setLoading(true);
    // Simulate sync process
    setTimeout(() => {
      setDataSources(prev => prev.map(source => 
        source.id === sourceId 
          ? { ...source, lastSync: new Date().toISOString(), status: 'Active' as const, error: undefined }
          : source
      ));
      setLoading(false);
    }, 2000);
  };

  const handleDelete = (sourceId: string) => {
    if (confirm('Are you sure you want to delete this data source?')) {
      setDataSources(prev => prev.filter(source => source.id !== sourceId));
    }
  };

  const handleExport = () => {
    const csvContent = [
      'Name,Type,Status,Last Sync,Record Count,Description,Frequency',
      ...filteredSources.map(source => [
        `"${source.name}"`,
        source.type,
        source.status,
        new Date(source.lastSync).toLocaleString(),
        source.recordCount,
        `"${source.description}"`,
        source.frequency || 'N/A'
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `data_sources_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const stats = {
    total: dataSources.length,
    active: dataSources.filter(s => s.status === 'Active').length,
    error: dataSources.filter(s => s.status === 'Error').length,
    totalRecords: dataSources.reduce((sum, s) => sum + s.recordCount, 0)
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold gradient-text">Data Sources Management</h1>
          <p className="text-muted-foreground mt-1">Manage and monitor your microinverter data sources</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={handleExport} className="apple-button">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button onClick={() => setShowAddModal(true)} className="apple-gradient">
            <Plus className="w-4 h-4 mr-2" />
            Add Source
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="glass-card apple-card-hover">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Sources</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">Data sources configured</p>
          </CardContent>
        </Card>
        <Card className="glass-card apple-card-hover">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.active}</div>
            <p className="text-xs text-muted-foreground">Currently syncing</p>
          </CardContent>
        </Card>
        <Card className="glass-card apple-card-hover">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Errors</CardTitle>
            <AlertCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.error}</div>
            <p className="text-xs text-muted-foreground">Need attention</p>
          </CardContent>
        </Card>
        <Card className="glass-card apple-card-hover">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Records</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalRecords.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Across all sources</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="glass-card">
        <CardContent className="pt-6">
          <div className="flex gap-4 flex-wrap">
            <div className="flex-1 min-w-[200px]">
              <input
                placeholder="Search data sources..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 glass-card rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant={filter === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilter('all')}
                className="apple-button"
              >
                All ({stats.total})
              </Button>
              <Button
                variant={filter === 'active' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilter('active')}
                className="apple-button"
              >
                Active ({stats.active})
              </Button>
              <Button
                variant={filter === 'error' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilter('error')}
                className="apple-button"
              >
                Errors ({stats.error})
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Data Sources List */}
      <div className="space-y-4">
        {filteredSources.map((source) => (
          <Card key={source.id} className="glass-card apple-card-hover">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl apple-gradient flex items-center justify-center">
                    {getTypeIcon(source.type)}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-foreground">{source.name}</h3>
                      <Badge className={getStatusColor(source.status)}>
                        {source.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{source.description}</p>
                    <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        {getTypeIcon(source.type)}
                        {source.type}
                      </span>
                      <span>•</span>
                      <span>{source.recordCount.toLocaleString()} records</span>
                      <span>•</span>
                      <span>Last sync: {new Date(source.lastSync).toLocaleString()}</span>
                      {source.frequency && (
                        <>
                          <span>•</span>
                          <span>{source.frequency}</span>
                        </>
                      )}
                    </div>
                    {source.error && (
                      <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded-lg">
                        <p className="text-sm text-red-800">{source.error}</p>
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleSync(source.id)}
                    disabled={loading}
                    className="apple-button"
                  >
                    <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setEditingSource(source)}
                    className="apple-button"
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(source.id)}
                    className="apple-button"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {filteredSources.length === 0 && (
        <Card className="glass-card">
          <CardContent className="pt-12 text-center">
            <div className="w-16 h-16 rounded-xl apple-gradient flex items-center justify-center mx-auto mb-4">
              <Database className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-lg font-medium mb-2">No data sources found</h3>
            <p className="text-muted-foreground mb-4">
              {searchTerm ? 'Try adjusting your search terms' : 'Add your first data source to get started'}
            </p>
            {!searchTerm && (
              <Button onClick={() => setShowAddModal(true)} className="apple-gradient">
                <Plus className="w-4 h-4 mr-2" />
                Add Data Source
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
