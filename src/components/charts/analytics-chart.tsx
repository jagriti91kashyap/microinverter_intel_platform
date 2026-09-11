'use client';

import { useState, useEffect } from 'react';
import {
  LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar
} from 'recharts';

interface AnalyticsData {
  monthlyTrends: Array<{
    month: string;
    products: number;
    manufacturers: number;
    avgPower: number;
  }>;
  powerDistribution: Array<{
    range: string;
    count: number;
    percentage: number;
  }>;
  manufacturerMarketShare: Array<{
    name: string;
    value: number;
    marketShare: number;
  }>;
  efficiencyComparison: Array<{
    manufacturer: string;
    efficiency: number;
    warranty: number;
    power: number;
  }>;
  regionalData: Array<{
    region: string;
    products: number;
    manufacturers: number;
    avgEfficiency: number;
  }>;
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16'];

interface AnalyticsChartProps {
  data: AnalyticsData;
  type: 'line' | 'area' | 'bar' | 'pie' | 'radar';
  title: string;
  height?: number;
  className?: string;
}

export function AnalyticsChart({ data, type, title, height = 300, className = '' }: AnalyticsChartProps) {
  const [chartData, setChartData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate data loading
    setTimeout(() => {
      switch (type) {
        case 'line':
        case 'area':
          setChartData(data.monthlyTrends);
          break;
        case 'bar':
          setChartData(data.powerDistribution);
          break;
        case 'pie':
          setChartData(data.manufacturerMarketShare);
          break;
        case 'radar':
          setChartData(data.efficiencyComparison);
          break;
        default:
          setChartData([]);
      }
      setLoading(false);
    }, 500);
  }, [data, type]);

  if (loading) {
    return (
      <div className={`glass-card rounded-xl p-6 ${className}`} style={{ height }}>
        <div className="flex items-center justify-center h-full">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  const renderChart = () => {
    switch (type) {
      case 'line':
        return (
          <ResponsiveContainer width="100%" height={height}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis dataKey="month" stroke="#6b7280" />
              <YAxis stroke="#6b7280" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'rgba(255, 255, 255, 0.9)',
                  border: '1px solid rgba(0, 0, 0, 0.1)',
                  borderRadius: '8px'
                }} 
              />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="products" 
                stroke="#3b82f6" 
                strokeWidth={2}
                dot={{ fill: '#3b82f6', r: 4 }}
                activeDot={{ r: 6 }}
              />
              <Line 
                type="monotone" 
                dataKey="manufacturers" 
                stroke="#10b981" 
                strokeWidth={2}
                dot={{ fill: '#10b981', r: 4 }}
                activeDot={{ r: 6 }}
              />
              <Line 
                type="monotone" 
                dataKey="avgPower" 
                stroke="#f59e0b" 
                strokeWidth={2}
                dot={{ fill: '#f59e0b', r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        );

      case 'area':
        return (
          <ResponsiveContainer width="100%" height={height}>
            <AreaChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis dataKey="month" stroke="#6b7280" />
              <YAxis stroke="#6b7280" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'rgba(255, 255, 255, 0.9)',
                  border: '1px solid rgba(0, 0, 0, 0.1)',
                  borderRadius: '8px'
                }} 
              />
              <Legend />
              <Area 
                type="monotone" 
                dataKey="products" 
                stackId="1"
                stroke="#3b82f6" 
                fill="#3b82f6"
                fillOpacity={0.6}
              />
              <Area 
                type="monotone" 
                dataKey="manufacturers" 
                stackId="1"
                stroke="#10b981" 
                fill="#10b981"
                fillOpacity={0.6}
              />
            </AreaChart>
          </ResponsiveContainer>
        );

      case 'bar':
        return (
          <ResponsiveContainer width="100%" height={height}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis dataKey="range" stroke="#6b7280" />
              <YAxis stroke="#6b7280" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'rgba(255, 255, 255, 0.9)',
                  border: '1px solid rgba(0, 0, 0, 0.1)',
                  borderRadius: '8px'
                }} 
              />
              <Legend />
              <Bar dataKey="count" fill="#3b82f6" radius={[8, 8, 0, 0]} />
              <Bar dataKey="percentage" fill="#10b981" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        );

      case 'pie':
        return (
          <ResponsiveContainer width="100%" height={height}>
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name}: ${value}`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'rgba(255, 255, 255, 0.9)',
                  border: '1px solid rgba(0, 0, 0, 0.1)',
                  borderRadius: '8px'
                }} 
              />
            </PieChart>
          </ResponsiveContainer>
        );

      case 'radar':
        return (
          <ResponsiveContainer width="100%" height={height}>
            <RadarChart data={chartData}>
              <PolarGrid strokeDasharray="3 3" className="opacity-30" />
              <PolarAngleAxis dataKey="manufacturer" stroke="#6b7280" />
              <PolarRadiusAxis angle={90} domain={[0, 100]} stroke="#6b7280" />
              <Radar 
                name="Efficiency" 
                dataKey="efficiency" 
                stroke="#3b82f6" 
                fill="#3b82f6" 
                fillOpacity={0.6}
              />
              <Radar 
                name="Warranty" 
                dataKey="warranty" 
                stroke="#10b981" 
                fill="#10b981" 
                fillOpacity={0.6}
              />
              <Radar 
                name="Power" 
                dataKey="power" 
                stroke="#f59e0b" 
                fill="#f59e0b" 
                fillOpacity={0.6}
              />
              <Legend />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'rgba(255, 255, 255, 0.9)',
                  border: '1px solid rgba(0, 0, 0, 0.1)',
                  borderRadius: '8px'
                }} 
              />
            </RadarChart>
          </ResponsiveContainer>
        );

      default:
        return <div>Unsupported chart type</div>;
    }
  };

  return (
    <div className={`glass-card rounded-xl p-6 ${className}`}>
      <h3 className="text-lg font-semibold mb-4">{title}</h3>
      {renderChart()}
    </div>
  );
}

// Mock data generator for demonstration
export const generateMockAnalyticsData = (): AnalyticsData => ({
  monthlyTrends: [
    { month: 'Jan', products: 120, manufacturers: 15, avgPower: 350 },
    { month: 'Feb', products: 145, manufacturers: 17, avgPower: 380 },
    { month: 'Mar', products: 168, manufacturers: 19, avgPower: 420 },
    { month: 'Apr', products: 195, manufacturers: 22, avgPower: 450 },
    { month: 'May', products: 220, manufacturers: 25, avgPower: 480 },
    { month: 'Jun', products: 245, manufacturers: 28, avgPower: 520 }
  ],
  powerDistribution: [
    { range: '0-500W', count: 45, percentage: 18.4 },
    { range: '500-1000W', count: 78, percentage: 31.8 },
    { range: '1000-1500W', count: 62, percentage: 25.3 },
    { range: '1500-2000W', count: 35, percentage: 14.3 },
    { range: '2000W+', count: 25, percentage: 10.2 }
  ],
  manufacturerMarketShare: [
    { name: 'Enphase', value: 85, marketShare: 34.7 },
    { name: 'SolarEdge', value: 62, marketShare: 25.3 },
    { name: 'Chint Power', value: 45, marketShare: 18.4 },
    { name: 'Huawei', value: 28, marketShare: 11.4 },
    { name: 'Others', value: 25, marketShare: 10.2 }
  ],
  efficiencyComparison: [
    { manufacturer: 'Enphase', efficiency: 96.5, warranty: 25, power: 85 },
    { manufacturer: 'SolarEdge', efficiency: 97.2, warranty: 12, power: 78 },
    { manufacturer: 'Chint Power', efficiency: 95.8, warranty: 10, power: 65 },
    { manufacturer: 'Huawei', efficiency: 97.8, warranty: 10, power: 72 }
  ],
  regionalData: [
    { region: 'North America', products: 145, manufacturers: 12, avgEfficiency: 96.8 },
    { region: 'Europe', products: 98, manufacturers: 18, avgEfficiency: 97.2 },
    { region: 'Asia Pacific', products: 67, manufacturers: 15, avgEfficiency: 96.5 },
    { region: 'Latin America', products: 35, manufacturers: 8, avgEfficiency: 95.9 }
  ]
});
