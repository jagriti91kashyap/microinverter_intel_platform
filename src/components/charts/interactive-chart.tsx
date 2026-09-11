'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  TooltipProps
} from 'recharts';
import { cn } from '@/lib/utils';

interface InteractiveChartProps {
  data?: any[];
  type: 'line' | 'area' | 'bar' | 'pie';
  className?: string;
  height?: number;
  colors?: string[];
}

const CustomTooltip = ({ active, payload, label }: TooltipProps<number, string>) => {
  if (active && payload && payload.length) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass-card border-border/20 p-3 rounded-lg shadow-vercel-lg"
      >
        <p className="text-sm font-medium text-foreground">{label}</p>
        {payload.map((entry, index) => (
          <p key={index} className="text-sm" style={{ color: entry.color }}>
            {entry.name}: {entry.value}
          </p>
        ))}
      </motion.div>
    );
  }
  return null;
};

export function InteractiveChart({ 
  data, 
  type, 
  className, 
  height = 300,
  colors = ['hsl(var(--primary))', 'hsl(var(--accent))', 'hsl(var(--chart-3))', 'hsl(var(--chart-4))']
}: InteractiveChartProps) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const renderChart = () => {
    switch (type) {
      case 'line':
        return (
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
            <XAxis 
              dataKey="name" 
              stroke="hsl(var(--muted-foreground))" 
              fontSize={12}
              tickLine={false}
            />
            <YAxis 
              stroke="hsl(var(--muted-foreground))" 
              fontSize={12}
              tickLine={false}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Line
              type="monotone"
              dataKey="value"
              stroke={colors[0]}
              strokeWidth={2}
              dot={{ fill: colors[0], r: 4 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        );
      
      case 'area':
        return (
          <AreaChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
            <XAxis 
              dataKey="name" 
              stroke="hsl(var(--muted-foreground))" 
              fontSize={12}
              tickLine={false}
            />
            <YAxis 
              stroke="hsl(var(--muted-foreground))" 
              fontSize={12}
              tickLine={false}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="value"
              stroke={colors[0]}
              fill={colors[0]}
              fillOpacity={0.3}
            />
          </AreaChart>
        );
      
      case 'bar':
        return (
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
            <XAxis 
              dataKey="name" 
              stroke="hsl(var(--muted-foreground))" 
              fontSize={12}
              tickLine={false}
            />
            <YAxis 
              stroke="hsl(var(--muted-foreground))" 
              fontSize={12}
              tickLine={false}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="value" fill={colors[0]} radius={[8, 8, 0, 0]} />
          </BarChart>
        );
      
      case 'pie':
        return (
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={colors[index % colors.length]}
                  style={{
                    filter: activeIndex === index ? 'brightness(1.1)' : 'brightness(1)',
                    cursor: 'pointer'
                  }}
                  onMouseEnter={() => setActiveIndex(index)}
                  onMouseLeave={() => setActiveIndex(null)}
                />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        );
      
      default:
        return null;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
      className={cn('glass-card border-border/20 p-6 rounded-xl', className)}
    >
      <ResponsiveContainer width="100%" height={height}>
        {renderChart()}
      </ResponsiveContainer>
    </motion.div>
  );
}

// Pre-configured chart components for the dashboard
export function ProductTrendChart({ className, data }: { className?: string; data?: any[] }) {
  const defaultData = [
    { name: 'Jan', value: 400 },
    { name: 'Feb', value: 300 },
    { name: 'Mar', value: 600 },
    { name: 'Apr', value: 800 },
    { name: 'May', value: 500 },
    { name: 'Jun', value: 700 },
    { name: 'Jul', value: 900 }
  ];

  const chartData = data && data.length > 0 ? data : defaultData;

  return (
    <div className={className}>
      <InteractiveChart 
        data={chartData} 
        type="bar" 
        height={250}
        colors={['hsl(var(--primary))']}
      />
    </div>
  );
}

export function ManufacturerDistributionChart({ className, data }: { className?: string; data?: any[] }) {
  const defaultData = [
    { name: 'Enphase', value: 400 },
    { name: 'SolarEdge', value: 300 },
    { name: 'SMA', value: 300 },
    { name: 'Huawei', value: 200 },
    { name: 'Others', value: 150 }
  ];

  const chartData = data && data.length > 0 ? data : defaultData;

  return (
    <div className={className}>
      <InteractiveChart 
        data={chartData} 
        type="pie" 
        height={250}
        colors={['hsl(var(--primary))', 'hsl(var(--accent))', 'hsl(var(--chart-3))', 'hsl(var(--chart-4))', 'hsl(var(--chart-5))']}
      />
    </div>
  );
}

export function PerformanceChart({ className, data }: { className?: string; data?: any[] }) {
  const defaultData = [
    { name: 'Q1', value: 1200, target: 1000 },
    { name: 'Q2', value: 1800, target: 1500 },
    { name: 'Q3', value: 2400, target: 2000 },
    { name: 'Q4', value: 2800, target: 2500 }
  ];

  const chartData = data && data.length > 0 ? data : defaultData;

  return (
    <div className={className}>
      <InteractiveChart 
        data={chartData} 
        type="bar" 
        height={250}
        colors={['hsl(var(--primary))', 'hsl(var(--accent))']}
      />
    </div>
  );
}

// Mini chart for KPI cards
export function MiniSparkline({ 
  data, 
  trend = 'up', 
  className 
}: { 
  data: number[]; 
  trend?: 'up' | 'down' | 'neutral';
  className?: string;
}) {
  const chartData = data.map((value, index) => ({
    name: index.toString(),
    value
  }));

  const color = trend === 'up' ? 'hsl(var(--success))' : trend === 'down' ? 'hsl(var(--destructive))' : 'hsl(var(--muted-foreground))';

  return (
    <div className={cn('w-full h-12', className)}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData}>
          <Line
            type="monotone"
            dataKey="value"
            stroke={color}
            strokeWidth={2}
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
