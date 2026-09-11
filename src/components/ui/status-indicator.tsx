'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { CheckCircle, AlertCircle, Clock, XCircle, Loader2 } from 'lucide-react';

interface StatusIndicatorProps {
  status: 'success' | 'warning' | 'error' | 'info' | 'loading' | 'neutral';
  text?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  showIcon?: boolean;
}

const statusConfig = {
  success: {
    icon: CheckCircle,
    color: 'text-success',
    bgColor: 'bg-success/10',
    borderColor: 'border-success/20',
    pulseColor: 'bg-success'
  },
  warning: {
    icon: AlertCircle,
    color: 'text-warning',
    bgColor: 'bg-warning/10',
    borderColor: 'border-warning/20',
    pulseColor: 'bg-warning'
  },
  error: {
    icon: XCircle,
    color: 'text-destructive',
    bgColor: 'bg-destructive/10',
    borderColor: 'border-destructive/20',
    pulseColor: 'bg-destructive'
  },
  info: {
    icon: Clock,
    color: 'text-info',
    bgColor: 'bg-info/10',
    borderColor: 'border-info/20',
    pulseColor: 'bg-info'
  },
  loading: {
    icon: Loader2,
    color: 'text-primary',
    bgColor: 'bg-primary/10',
    borderColor: 'border-primary/20',
    pulseColor: 'bg-primary'
  },
  neutral: {
    icon: Clock,
    color: 'text-muted-foreground',
    bgColor: 'bg-muted/50',
    borderColor: 'border-border/20',
    pulseColor: 'bg-muted-foreground'
  }
};

const sizeConfig = {
  sm: 'text-xs px-2 py-1',
  md: 'text-sm px-3 py-1.5',
  lg: 'text-base px-4 py-2'
};

export function StatusIndicator({
  status,
  text,
  size = 'md',
  className,
  showIcon = true
}: StatusIndicatorProps) {
  const config = statusConfig[status];
  const Icon = config.icon;
  const sizeStyles = sizeConfig[size];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      className={cn(
        'inline-flex items-center gap-2 rounded-full border font-medium',
        sizeStyles,
        config.bgColor,
        config.borderColor,
        config.color,
        className
      )}
    >
      {showIcon && (
        <motion.div
          animate={status === 'loading' ? { rotate: 360 } : {}}
          transition={status === 'loading' ? { duration: 1, repeat: Infinity, ease: 'linear' } : {}}
          className="flex items-center"
        >
          <Icon className="w-4 h-4" />
        </motion.div>
      )}
      {text && <span>{text}</span>}
      {status === 'loading' && (
        <motion.div
          className="w-2 h-2 rounded-full"
          animate={{ opacity: [1, 0.5, 1] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          style={{ backgroundColor: 'currentColor' }}
        />
      )}
    </motion.div>
  );
}

// Live status indicator with pulse animation
export function LiveStatusIndicator({
  isLive,
  text,
  className
}: {
  isLive: boolean;
  text?: string;
  className?: string;
}) {
  return (
    <motion.div
      className={cn(
        'inline-flex items-center gap-2 px-3 py-1.5 rounded-full border font-medium text-sm',
        isLive 
          ? 'bg-success/10 border-success/20 text-success' 
          : 'bg-muted/50 border-border/20 text-muted-foreground',
        className
      )}
    >
      <div className="relative">
        <div className={cn(
          'w-2 h-2 rounded-full',
          isLive ? 'bg-success' : 'bg-muted-foreground'
        )} />
        {isLive && (
          <motion.div
            className="absolute inset-0 w-2 h-2 rounded-full bg-success"
            animate={{ scale: [1, 1.5, 1], opacity: [1, 0, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        )}
      </div>
      {text && <span>{isLive ? 'Live' : text}</span>}
    </motion.div>
  );
}

// Progress indicator with animated bar
export function ProgressIndicator({
  value,
  max = 100,
  label,
  color = 'primary',
  size = 'md',
  className
}: {
  value: number;
  max?: number;
  label?: string;
  color?: 'primary' | 'success' | 'warning' | 'error';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}) {
  const percentage = Math.min((value / max) * 100, 100);
  
  const colorConfig = {
    primary: 'bg-primary',
    success: 'bg-success',
    warning: 'bg-warning',
    error: 'bg-destructive'
  };

  const sizeConfig = {
    sm: 'h-1',
    md: 'h-2',
    lg: 'h-3'
  };

  return (
    <div className={cn('space-y-2', className)}>
      {label && (
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">{label}</span>
          <span className="font-medium text-foreground">{percentage.toFixed(0)}%</span>
        </div>
      )}
      <div className={cn(
        'w-full bg-muted rounded-full overflow-hidden',
        sizeConfig[size]
      )}>
        <motion.div
          className={cn(
            'h-full rounded-full',
            colorConfig[color]
          )}
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
        />
      </div>
    </div>
  );
}
