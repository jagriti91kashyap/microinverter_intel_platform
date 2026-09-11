'use client';

import { motion } from 'framer-motion';

interface LoadingSkeletonProps {
  className?: string;
  variant?: 'default' | 'card' | 'table' | 'list';
  lines?: number;
  height?: string;
}

export function LoadingSkeleton({ 
  className = '', 
  variant = 'default',
  lines = 1,
  height = 'h-4'
}: LoadingSkeletonProps) {
  const skeletonVariants = {
    default: {
      hidden: { opacity: 0 },
      visible: { opacity: 1 }
    },
    card: {
      hidden: { opacity: 0, scale: 0.95 },
      visible: { opacity: 1, scale: 1 }
    },
    table: {
      hidden: { opacity: 0, x: -20 },
      visible: { opacity: 1, x: 0 }
    },
    list: {
      hidden: { opacity: 0, y: 10 },
      visible: { opacity: 1, y: 0 }
    }
  };

  return (
    <div className={`space-y-2 ${className}`}>
      {Array.from({ length: lines }).map((_, index) => (
        <motion.div
          key={index}
          variants={skeletonVariants[variant]}
          initial="hidden"
          animate="visible"
          transition={{
            duration: 0.5,
            delay: index * 0.1,
            ease: [0.4, 0, 0.2, 1]
          }}
          className={`${height} bg-gradient-to-r from-muted via-muted/60 to-muted rounded-lg loading-shimmer`}
          style={{
            backgroundSize: '200% 100%',
            animation: 'shimmer 1.5s ease-in-out infinite'
          }}
        />
      ))}
    </div>
  );
}

// Card skeleton with multiple elements
export function CardSkeleton() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
      className="card-glass p-6 space-y-4"
    >
      <div className="flex items-center space-x-4">
        <div className="w-12 h-12 bg-gradient-to-br from-primary/20 to-accent/20 rounded-xl loading-shimmer" />
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-gradient-to-r from-muted via-muted/60 to-muted rounded loading-shimmer" />
          <div className="h-3 w-3/4 bg-gradient-to-r from-muted via-muted/60 to-muted rounded loading-shimmer" />
        </div>
      </div>
      <div className="space-y-2">
        <div className="h-3 bg-gradient-to-r from-muted via-muted/60 to-muted rounded loading-shimmer" />
        <div className="h-3 w-5/6 bg-gradient-to-r from-muted via-muted/60 to-muted rounded loading-shimmer" />
      </div>
    </motion.div>
  );
}

// Table skeleton for data tables
export function TableSkeleton({ rows = 5, columns = 4 }: { rows?: number; columns?: number }) {
  return (
    <div className="glass-card border-border/20 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border/20">
              <th className="w-12 p-4">
                <div className="w-4 h-4 bg-muted rounded loading-shimmer" />
              </th>
              {Array.from({ length: columns }).map((_, index) => (
                <th key={index} className="p-4">
                  <div className="h-4 bg-muted rounded loading-shimmer" />
                </th>
              ))}
              <th className="w-16 p-4">
                <div className="w-8 h-8 bg-muted rounded loading-shimmer" />
              </th>
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: rows }).map((_, rowIndex) => (
              <motion.tr
                key={rowIndex}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: rowIndex * 0.1, duration: 0.3 }}
                className="border-b border-border/10"
              >
                <td className="p-4">
                  <div className="w-4 h-4 bg-muted rounded loading-shimmer" />
                </td>
                {Array.from({ length: columns }).map((_, colIndex) => (
                  <td key={colIndex} className="p-4">
                    <div className="w-full h-4 bg-muted rounded loading-shimmer" />
                  </td>
                ))}
                <td className="p-4">
                  <div className="w-8 h-8 bg-muted rounded loading-shimmer" />
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// Dashboard skeleton with KPI cards
export function DashboardSkeleton() {
  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <div className="h-10 w-48 bg-gradient-to-r from-muted via-muted/60 to-muted rounded loading-shimmer" />
        <div className="h-5 w-96 bg-gradient-to-r from-muted via-muted/60 to-muted rounded loading-shimmer" />
      </div>

      {/* KPI Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ delay: index * 0.1, duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
            className="card-glass p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="h-4 w-24 bg-muted rounded loading-shimmer" />
              <div className="w-10 h-10 bg-gradient-to-br from-primary/20 to-accent/20 rounded-xl loading-shimmer" />
            </div>
            <div className="space-y-2">
              <div className="h-8 w-16 bg-gradient-to-r from-muted via-muted/60 to-muted rounded loading-shimmer" />
              <div className="h-3 w-32 bg-gradient-to-r from-muted via-muted/60 to-muted rounded loading-shimmer" />
            </div>
          </motion.div>
        ))}
      </div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.4 }}
        className="card-glass p-6"
      >
        <div className="h-6 w-32 bg-gradient-to-r from-muted via-muted/60 to-muted rounded loading-shimmer mb-6" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 + index * 0.1, duration: 0.4 }}
              className="flex items-center p-4 rounded-xl bg-gradient-to-br from-muted/30 to-muted/10 border border-border/20"
            >
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 loading-shimmer mr-4" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-24 bg-gradient-to-r from-muted via-muted/60 to-muted rounded loading-shimmer" />
                <div className="h-3 w-32 bg-gradient-to-r from-muted via-muted/60 to-muted rounded loading-shimmer" />
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}

// Pulse animation for loading states
export function PulseLoader({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  };

  return (
    <div className="flex items-center justify-center">
      <motion.div
        className={`${sizeClasses[size]} vercel-gradient rounded-lg flex items-center justify-center`}
        animate={{
          scale: [1, 1.2, 1],
          rotate: [0, 180, 360]
        }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: [0.4, 0, 0.2, 1]
        }}
      >
        <div className="w-1/2 h-1/2 bg-white rounded-full" />
      </motion.div>
    </div>
  );
}
