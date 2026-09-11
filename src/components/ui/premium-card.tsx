'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

interface PremiumCardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'glass' | 'gradient' | 'elevated' | 'interactive';
  hover?: boolean;
  children: React.ReactNode;
}

export function PremiumCard({
  variant = 'default',
  hover = true,
  children,
  className,
  ...props
}: PremiumCardProps) {
  const getVariantStyles = () => {
    switch (variant) {
      case 'glass':
        return 'glass-card border-border/20';
      case 'gradient':
        return 'bg-gradient-to-br from-primary/10 to-accent/10 border-border/30';
      case 'elevated':
        return 'shadow-vercel-lg border-border/30 bg-card/80 backdrop-blur-sm';
      case 'interactive':
        return 'glass-card border-border/20 cursor-pointer';
      default:
        return 'card-glass border-border/20';
    }
  };

  const getHoverStyles = () => {
    if (!hover) return '';
    
    switch (variant) {
      case 'interactive':
        return 'hover:shadow-vercel-xl hover:border-border/40 hover:scale-[1.02]';
      case 'glass':
        return 'hover:shadow-vercel-lg hover:border-border/30';
      case 'gradient':
        return 'hover:shadow-vercel-md hover:from-primary/20 hover:to-accent/20';
      default:
        return 'hover:shadow-vercel-lg hover:border-border/30';
    }
  };

  return (
    <motion.div
      className={cn(
        'rounded-xl transition-all duration-300',
        getVariantStyles(),
        getHoverStyles(),
        className
      )}
      whileHover={hover ? { y: -4 } : undefined}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      {...(props as any)}
    >
      {children}
    </motion.div>
  );
}

// Enhanced card components with specific layouts
export function ProductCard({
  title,
  description,
  image,
  price,
  features,
  className,
  ...props
}: {
  title: string;
  description: string;
  image?: string;
  price?: string;
  features?: string[];
  className?: string;
} & React.HTMLAttributes<HTMLDivElement>) {
  return (
    <PremiumCard variant="interactive" className={className} {...props}>
      <CardHeader className="pb-3">
        {image && (
          <div className="aspect-video bg-gradient-to-br from-muted/50 to-muted rounded-lg mb-4 overflow-hidden">
            <img
              src={image}
              alt={title}
              className="w-full h-full object-cover"
            />
          </div>
        )}
        <CardTitle className="gradient-text">{title}</CardTitle>
        <CardDescription className="text-sm">{description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {price && (
          <div className="flex items-center justify-between">
            <span className="text-2xl font-bold text-foreground">{price}</span>
            <div className="px-2 py-1 bg-accent/20 text-accent text-xs font-medium rounded-full">
              Best Value
            </div>
          </div>
        )}
        {features && features.length > 0 && (
          <ul className="space-y-2">
            {features.map((feature, index) => (
              <motion.li
                key={feature}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center gap-2 text-sm text-muted-foreground"
              >
                <div className="w-1.5 h-1.5 bg-primary rounded-full" />
                {feature}
              </motion.li>
            ))}
          </ul>
        )}
      </CardContent>
    </PremiumCard>
  );
}

export function StatCard({
  title,
  value,
  change,
  icon,
  trend,
  className,
  ...props
}: {
  title: string;
  value: string | number;
  change?: string;
  icon?: React.ReactNode;
  trend?: 'up' | 'down' | 'neutral';
  className?: string;
} & React.HTMLAttributes<HTMLDivElement>) {
  const getTrendColor = () => {
    switch (trend) {
      case 'up':
        return 'text-success';
      case 'down':
        return 'text-destructive';
      default:
        return 'text-muted-foreground';
    }
  };

  return (
    <PremiumCard variant="glass" className={className} {...props}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="p-2 rounded-lg bg-gradient-to-br from-primary/20 to-accent/20">
            {icon}
          </div>
          {change && (
            <div className={`text-sm font-medium ${getTrendColor()}`}>
              {change}
            </div>
          )}
        </div>
        <div className="space-y-1">
          <div className="text-2xl font-bold text-foreground">{value}</div>
          <div className="text-sm text-muted-foreground">{title}</div>
        </div>
      </CardContent>
    </PremiumCard>
  );
}

export function FeatureCard({
  title,
  description,
  icon,
  className,
  ...props
}: {
  title: string;
  description: string;
  icon?: React.ReactNode;
  className?: string;
} & React.HTMLAttributes<HTMLDivElement>) {
  return (
    <PremiumCard variant="gradient" className={className} {...props}>
      <CardContent className="p-6 text-center">
        {icon && (
          <div className="w-16 h-16 mx-auto mb-4 rounded-full vercel-gradient flex items-center justify-center text-white shadow-vercel-md">
            {icon}
          </div>
        )}
        <h3 className="text-lg font-semibold text-foreground mb-2">{title}</h3>
        <p className="text-muted-foreground">{description}</p>
      </CardContent>
    </PremiumCard>
  );
}

// Animated card with entrance effects
export function AnimatedCard({
  children,
  delay = 0,
  className,
  ...props
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
} & React.HTMLAttributes<HTMLDivElement>) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay, duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
      className={className}
      {...(props as any)}
    >
      <PremiumCard variant="glass" className="h-full">
        {children}
      </PremiumCard>
    </motion.div>
  );
}
