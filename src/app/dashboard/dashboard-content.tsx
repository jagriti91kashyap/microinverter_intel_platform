'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MainLayout } from '@/components/layout/main-layout';
import { 
  Package, 
  Users, 
  TrendingUp, 
  Activity,
  Globe,
  Zap,
  Shield,
  Clock,
  GitCompare
} from 'lucide-react';
import { DashboardKPI, Product } from '@/types';

export function DashboardContent() {
  const [kpiData, setKpiData] = useState<DashboardKPI | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (isMounted) {
      fetchDashboardData();
    }
  }, [isMounted]);

  const fetchDashboardData = async () => {
    try {
      // Only access localStorage on client side
      if (typeof window === 'undefined') return;
      
      const token = localStorage.getItem('auth_token');
      
      if (!token) {
        // Redirect to login if no token
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
        return;
      }

      const response = await fetch('/api/dashboard/kpi', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setKpiData(data);
      } else {
        if (response.status === 401) {
          // Token expired, redirect to login
          if (typeof window !== 'undefined') {
            localStorage.removeItem('auth_token');
            window.location.href = '/login';
          }
        }
      }
    } catch (error) {
      // Error fetching dashboard data
    } finally {
      setIsLoading(false);
    }
  };

  // Don't render anything until mounted
  if (!isMounted) {
    return (
      <MainLayout>
        <div className="space-y-6">
          <div className="text-center">Loading...</div>
        </div>
      </MainLayout>
    );
  }

  if (isLoading) {
    return (
      <MainLayout>
        <div className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <div className="h-4 w-20 bg-muted rounded"></div>
                  <div className="h-4 w-4 bg-muted rounded"></div>
                </CardHeader>
                <CardContent>
                  <div className="h-8 w-16 bg-muted rounded mb-2"></div>
                  <div className="h-3 w-24 bg-muted rounded"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </MainLayout>
    );
  }

  const kpiCards = [
    {
      title: 'Total Products',
      value: kpiData?.totalProducts || 0,
      description: 'Active microinverter products',
      icon: Package,
      change: '+12%',
      changeType: 'positive' as const
    },
    {
      title: 'Manufacturers',
      value: kpiData?.totalManufacturers || 0,
      description: 'Global manufacturers tracked',
      icon: Users,
      change: '+3',
      changeType: 'positive' as const
    },
    {
      title: 'Recent Updates',
      value: kpiData?.recentUpdates || 0,
      description: 'Updated this week',
      icon: Clock,
      change: '+8',
      changeType: 'positive' as const
    },
    {
      title: 'Countries Tracked',
      value: kpiData?.countriesTracked || 0,
      description: 'Markets with product availability',
      icon: Globe,
      change: '+23',
      changeType: 'positive' as const
    }
  ];

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Overview of microinverter product intelligence platform
          </p>
        </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {kpiCards.map((card, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {card.title}
              </CardTitle>
              <card.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{card.value}</div>
              <p className="text-xs text-muted-foreground">
                {card.description}
              </p>
              <div className="mt-2">
                <Badge 
                  variant={card.changeType === 'positive' ? 'default' : 'destructive'}
                  className="text-xs"
                >
                  {card.change}
                </Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Products by Manufacturer */}
        <Card className="col-span-2">
          <CardHeader>
            <CardTitle>Products by Manufacturer</CardTitle>
            <CardDescription>
              Distribution of products across manufacturers
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {kpiData?.productsByManufacturer.slice(0, 5).map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 rounded-full bg-orange-500"></div>
                    <span className="text-sm font-medium">{item.manufacturer}</span>
                  </div>
                  <span className="text-sm text-muted-foreground">{item.count}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Launches */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Launches</CardTitle>
            <CardDescription>
              Latest product announcements
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {kpiData?.recentLaunches.slice(0, 3).map((product, index) => (
                <div key={product.id} className="space-y-1">
                  <div className="font-medium text-sm">{product.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {product.manufacturer?.name}
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {product.acPower}W
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Global Availability */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Top Markets by Products Available</CardTitle>
            <CardDescription>
              Countries with the most product options
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {kpiData?.productsByCountry?.slice(0, 8).map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Globe className="h-3.5 w-3.5 text-muted-foreground" />
                    <span className="text-sm font-medium">{item.country}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-24 bg-muted rounded-full h-2">
                      <div
                        className="bg-orange-500 h-2 rounded-full"
                        style={{ width: `${Math.min(100, (item.count / (kpiData?.totalProducts || 1)) * 100)}%` }}
                      />
                    </div>
                    <span className="text-sm text-muted-foreground w-8 text-right">{item.count}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Manufacturer Global Reach</CardTitle>
            <CardDescription>
              Countries tracked per manufacturer
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {kpiData?.topManufacturerCountries?.slice(0, 8).map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-sm font-medium">{item.manufacturer}</span>
                  <Badge variant="outline" className="text-xs">
                    {item.countriesTracked} countries
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>
            Common tasks and shortcuts
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Button variant="outline" className="h-auto p-4 flex flex-col items-center space-y-2">
              <Package className="h-6 w-6" />
              <span>Add Product</span>
            </Button>
            <Button variant="outline" className="h-auto p-4 flex flex-col items-center space-y-2">
              <Zap className="h-6 w-6" />
              <span>Start Crawl</span>
            </Button>
            <Button variant="outline" className="h-auto p-4 flex flex-col items-center space-y-2">
              <GitCompare className="h-6 w-6" />
              <span>Compare Products</span>
            </Button>
            <Button variant="outline" className="h-auto p-4 flex flex-col items-center space-y-2">
              <Shield className="h-6 w-6" />
              <span>View Reports</span>
            </Button>
          </div>
        </CardContent>
      </Card>
      </div>
    </MainLayout>
  );
}
