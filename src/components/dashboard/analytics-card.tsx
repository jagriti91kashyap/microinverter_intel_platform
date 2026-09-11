'use client'

import { motion } from 'framer-motion'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  TrendingUp, 
  TrendingDown, 
  Minus,
  Info,
  ArrowUpRight,
  ArrowDownRight,
  BarChart3,
  PieChart,
  Activity,
  Users,
  Package,
  Search,
  Cpu,
  Shield
} from 'lucide-react'

interface AnalyticsCardProps {
  title: string
  value: string | number
  change?: number
  changeType?: 'increase' | 'decrease' | 'neutral'
  icon?: React.ReactNode
  description?: string
  trend?: 'up' | 'down' | 'stable'
  color?: 'primary' | 'success' | 'warning' | 'error' | 'info'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
  children?: React.ReactNode
}

export function AnalyticsCard({
  title,
  value,
  change,
  changeType = 'neutral',
  icon,
  description,
  trend = 'stable',
  color = 'primary',
  size = 'md',
  loading = false,
  children
}: AnalyticsCardProps) {
  const getIconColor = () => {
    switch (color) {
      case 'success': return 'text-success'
      case 'warning': return 'text-warning'
      case 'error': return 'text-error'
      case 'info': return 'text-info'
      default: return 'text-primary'
    }
  }

  const getBgColor = () => {
    switch (color) {
      case 'success': return 'from-success/20 to-success/10'
      case 'warning': return 'from-warning/20 to-warning/10'
      case 'error': return 'from-error/20 to-error/10'
      case 'info': return 'from-info/20 to-info/10'
      default: return 'from-primary/20 to-primary/10'
    }
  }

  const getChangeColor = () => {
    if (changeType === 'increase') return 'text-success'
    if (changeType === 'decrease') return 'text-error'
    return 'text-muted-foreground'
  }

  const getChangeIcon = () => {
    if (changeType === 'increase') return <TrendingUp className="w-4 h-4" />
    if (changeType === 'decrease') return <TrendingDown className="w-4 h-4" />
    return <Minus className="w-4 h-4" />
  }

  const getSizeClasses = () => {
    switch (size) {
      case 'sm': return 'p-4'
      case 'lg': return 'p-8'
      default: return 'p-6'
    }
  }

  const getValueSize = () => {
    switch (size) {
      case 'sm': return 'text-2xl'
      case 'lg': return 'text-4xl'
      default: return 'text-3xl'
    }
  }

  if (loading) {
    return (
      <Card className={`relative overflow-hidden ${getSizeClasses()}`}>
        <div className="animate-pulse">
          <div className="flex items-center justify-between mb-4">
            <div className="h-4 bg-muted rounded w-1/3"></div>
            <div className="h-8 w-8 bg-muted rounded"></div>
          </div>
          <div className="h-8 bg-muted rounded w-1/2 mb-2"></div>
          <div className="h-3 bg-muted rounded w-2/3"></div>
        </div>
      </Card>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className={`relative overflow-hidden ${getSizeClasses()} group hover:shadow-lg transition-all duration-300`}>
        {/* Background gradient */}
        <div className={`absolute inset-0 bg-gradient-to-br ${getBgColor()} opacity-50`}></div>
        
        {/* Content */}
        <div className="relative z-10">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              {icon && (
                <div className={`p-2 rounded-lg bg-background/80 backdrop-blur-sm ${getIconColor()}`}>
                  {icon}
                </div>
              )}
              <div>
                <h3 className="font-semibold text-foreground/90">{title}</h3>
                {description && (
                  <p className="text-xs text-muted-foreground mt-1">{description}</p>
                )}
              </div>
            </div>
            
            {change !== undefined && (
              <div className={`flex items-center gap-1 px-2 py-1 rounded-full bg-background/80 backdrop-blur-sm ${getChangeColor()}`}>
                {getChangeIcon()}
                <span className="text-sm font-medium">
                  {change > 0 ? '+' : ''}{change}%
                </span>
              </div>
            )}
          </div>

          {/* Value */}
          <div className="mb-4">
            <div className={`font-bold ${getValueSize()} text-foreground`}>
              {typeof value === 'number' ? value.toLocaleString() : value}
            </div>
          </div>

          {/* Additional content */}
          {children && (
            <div className="mt-4">
              {children}
            </div>
          )}

          {/* Trend indicator */}
          {trend !== 'stable' && (
            <div className={`flex items-center gap-2 text-sm ${getChangeColor()}`}>
              {trend === 'up' ? (
                <ArrowUpRight className="w-4 h-4" />
              ) : (
                <ArrowDownRight className="w-4 h-4" />
              )}
              <span>
                {trend === 'up' ? 'Trending up' : 'Trending down'}
              </span>
            </div>
          )}
        </div>

        {/* Hover effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
      </Card>
    </motion.div>
  )
}

// Pre-configured analytics cards
export function ProductsCard({ total, newProducts, change, loading }: {
  total: number
  newProducts: number
  change?: number
  loading?: boolean
}) {
  return (
    <AnalyticsCard
      title="Total Products"
      value={total}
      change={change}
      changeType={change && change > 0 ? 'increase' : change && change < 0 ? 'decrease' : 'neutral'}
      icon={<Package className="w-5 h-5" />}
      description={`${newProducts} new this period`}
      color="primary"
      loading={loading}
    />
  )
}

export function ManufacturersCard({ total, change, loading }: {
  total: number
  change?: number
  loading?: boolean
}) {
  return (
    <AnalyticsCard
      title="Manufacturers"
      value={total}
      change={change}
      changeType={change && change > 0 ? 'increase' : change && change < 0 ? 'decrease' : 'neutral'}
      icon={<Users className="w-5 h-5" />}
      description="Active manufacturers"
      color="info"
      loading={loading}
    />
  )
}

export function SearchesCard({ total, unique, change, loading }: {
  total: number
  unique: number
  change?: number
  loading?: boolean
}) {
  return (
    <AnalyticsCard
      title="Total Searches"
      value={total}
      change={change}
      changeType={change && change > 0 ? 'increase' : change && change < 0 ? 'decrease' : 'neutral'}
      icon={<Search className="w-5 h-5" />}
      description={`${unique} unique searches`}
      color="success"
      loading={loading}
    />
  )
}

export function QualityCard({ score, change, loading }: {
  score: number
  change?: number
  loading?: boolean
}) {
  return (
    <AnalyticsCard
      title="Quality Score"
      value={`${score}%`}
      change={change}
      changeType={change && change > 0 ? 'increase' : change && change < 0 ? 'decrease' : 'neutral'}
      icon={<Shield className="w-5 h-5" />}
      description="Data quality metrics"
      color={score >= 90 ? 'success' : score >= 70 ? 'warning' : 'error'}
      loading={loading}
    />
  )
}

export function PerformanceCard({ responseTime, change, loading }: {
  responseTime: number
  change?: number
  loading?: boolean
}) {
  return (
    <AnalyticsCard
      title="Avg Response Time"
      value={`${responseTime}ms`}
      change={change}
      changeType={change && change < 0 ? 'increase' : change && change > 0 ? 'decrease' : 'neutral'}
      icon={<Activity className="w-5 h-5" />}
      description="API performance"
      color={responseTime <= 200 ? 'success' : responseTime <= 500 ? 'warning' : 'error'}
      loading={loading}
    />
  )
}

export function CrawlJobsCard({ completed, failed, total, change, loading }: {
  completed: number
  failed: number
  total: number
  change?: number
  loading?: boolean
}) {
  const successRate = total > 0 ? (completed / total) * 100 : 0
  
  return (
    <AnalyticsCard
      title="Crawl Jobs"
      value={total}
      change={change}
      changeType={change && change > 0 ? 'increase' : change && change < 0 ? 'decrease' : 'neutral'}
      icon={<Cpu className="w-5 h-5" />}
      description={`${completed} completed, ${failed} failed`}
      color={successRate >= 90 ? 'success' : successRate >= 70 ? 'warning' : 'error'}
      loading={loading}
    >
      <div className="w-full bg-muted rounded-full h-2">
        <div 
          className={`h-2 rounded-full transition-all duration-500 ${
            successRate >= 90 ? 'bg-success' : successRate >= 70 ? 'bg-warning' : 'bg-error'
          }`}
          style={{ width: `${successRate}%` }}
        ></div>
      </div>
    </AnalyticsCard>
  )
}
