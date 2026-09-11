'use client';

import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PremiumButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'secondary' | 'outline' | 'ghost' | 'destructive' | 'premium' | 'gradient';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  loading?: boolean;
  children: React.ReactNode;
  className?: string;
}

export function PremiumButton({
  variant = 'default',
  size = 'default',
  loading = false,
  children,
  className,
  disabled,
  ...props
}: PremiumButtonProps) {
  const getVariantStyles = () => {
    switch (variant) {
      case 'premium':
        return 'vercel-gradient text-white shadow-vercel-md hover:shadow-vercel-lg border-transparent';
      case 'gradient':
        return 'bg-gradient-to-r from-primary to-accent text-white shadow-vercel-md hover:shadow-vercel-lg border-transparent';
      default:
        return '';
    }
  };

  const getSizeStyles = () => {
    switch (size) {
      case 'sm':
        return 'h-8 px-3 text-xs';
      case 'lg':
        return 'h-12 px-8 text-lg';
      case 'icon':
        return 'h-10 w-10 p-0';
      default:
        return 'h-10 px-4 py-2';
    }
  };

  return (
    <Button
      className={cn(
        'relative overflow-hidden transition-all duration-300 button-glow',
        getVariantStyles(),
        getSizeStyles(),
        loading && 'cursor-not-allowed',
        className
      )}
      disabled={disabled || loading}
      {...props}
    >
      <motion.div
        className="flex items-center justify-center gap-2"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        transition={{ type: 'spring', stiffness: 400, damping: 17 }}
      >
        {loading && (
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            className="flex items-center"
          >
            <Loader2 className="w-4 h-4" />
          </motion.div>
        )}
        <span className={loading ? 'opacity-0' : 'opacity-100'}>{children}</span>
      </motion.div>
    </Button>
  );
}

// Floating action button
interface FloatingActionButtonProps {
  icon: React.ReactNode;
  onClick?: () => void;
  className?: string;
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
}

export function FloatingActionButton({
  icon,
  onClick,
  className,
  position = 'bottom-right'
}: FloatingActionButtonProps) {
  const getPositionStyles = () => {
    switch (position) {
      case 'bottom-right':
        return 'bottom-6 right-6';
      case 'bottom-left':
        return 'bottom-6 left-6';
      case 'top-right':
        return 'top-6 right-6';
      case 'top-left':
        return 'top-6 left-6';
      default:
        return 'bottom-6 right-6';
    }
  };

  return (
    <motion.button
      onClick={onClick}
      className={cn(
        'fixed z-50 w-14 h-14 rounded-full vercel-gradient shadow-vercel-lg hover:shadow-vercel-xl flex items-center justify-center text-white',
        getPositionStyles(),
        className
      )}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      transition={{ type: 'spring', stiffness: 400, damping: 17 }}
    >
      <motion.div
        animate={{ rotate: [0, 10, -10, 0] }}
        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
      >
        {icon}
      </motion.div>
    </motion.button>
  );
}

// Icon button with enhanced hover effects
interface IconButtonProps {
  icon: React.ReactNode;
  onClick?: () => void;
  className?: string;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  tooltip?: string;
}

export function IconButton({
  icon,
  onClick,
  className,
  variant = 'default',
  size = 'md',
  tooltip
}: IconButtonProps) {
  const getVariantStyles = () => {
    switch (variant) {
      case 'outline':
        return 'border-border/50 hover:border-border bg-transparent';
      case 'ghost':
        return 'hover:bg-muted/50';
      default:
        return 'vercel-gradient text-white border-transparent';
    }
  };

  const getSizeStyles = () => {
    switch (size) {
      case 'sm':
        return 'w-8 h-8';
      case 'lg':
        return 'w-12 h-12';
      default:
        return 'w-10 h-10';
    }
  };

  return (
    <motion.button
      onClick={onClick}
      className={cn(
        'relative rounded-xl flex items-center justify-center transition-all duration-300',
        getVariantStyles(),
        getSizeStyles(),
        className
      )}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      transition={{ type: 'spring', stiffness: 400, damping: 17 }}
    >
      {icon}
      {tooltip && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 0, y: 10 }}
          whileHover={{ opacity: 1, y: 0 }}
          className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-foreground text-background text-xs rounded whitespace-nowrap"
        >
          {tooltip}
        </motion.div>
      )}
    </motion.button>
  );
}
