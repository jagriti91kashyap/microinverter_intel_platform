'use client';

import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AccessibleButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'secondary' | 'outline' | 'ghost' | 'destructive' | 'premium' | 'gradient';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  loading?: boolean;
  children: React.ReactNode;
  className?: string;
  ariaLabel?: string;
  ariaDescribedBy?: string;
  disabled?: boolean;
}

export function AccessibleButton({
  variant = 'default',
  size = 'default',
  loading = false,
  children,
  className,
  ariaLabel,
  ariaDescribedBy,
  disabled,
  ...props
}: AccessibleButtonProps) {
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
        'relative overflow-hidden transition-all duration-300 button-glow focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2',
        getVariantStyles(),
        getSizeStyles(),
        loading && 'cursor-not-allowed',
        className
      )}
      disabled={disabled || loading}
      aria-label={ariaLabel}
      aria-describedby={ariaDescribedBy}
      aria-busy={loading}
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
            aria-hidden="true"
          >
            <Loader2 className="w-4 h-4" />
          </motion.div>
        )}
        <span className={loading ? 'opacity-0' : 'opacity-100'}>{children}</span>
      </motion.div>
    </Button>
  );
}

// Accessible card component with proper ARIA attributes
interface AccessibleCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  role?: string;
  ariaLabel?: string;
  ariaDescribedBy?: string;
  tabIndex?: number;
}

export function AccessibleCard({
  children,
  role = 'article',
  ariaLabel,
  ariaDescribedBy,
  tabIndex = 0,
  className,
  ...props
}: AccessibleCardProps) {
  return (
    <div
      role={role}
      aria-label={ariaLabel}
      aria-describedby={ariaDescribedBy}
      tabIndex={tabIndex}
      className={cn(
        'card-glass border-border/20 rounded-xl p-6 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

// Accessible input component with proper labels and ARIA attributes
interface AccessibleInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  helperText?: string;
  required?: boolean;
}

export function AccessibleInput({
  label,
  error,
  helperText,
  required,
  id,
  className,
  ...props
}: AccessibleInputProps) {
  const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;
  const errorId = error ? `${inputId}-error` : undefined;
  const helperId = helperText ? `${inputId}-helper` : undefined;

  return (
    <div className="space-y-2">
      <label
        htmlFor={inputId}
        className="text-sm font-medium text-foreground"
      >
        {label}
        {required && (
          <span className="text-destructive ml-1" aria-label="required">
            *
          </span>
        )}
      </label>
      <input
        id={inputId}
        aria-invalid={!!error}
        aria-describedby={cn(errorId, helperId)}
        aria-required={required}
        className={cn(
          'w-full px-3 py-2 bg-background border border-input rounded-md text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
          error && 'border-destructive focus:ring-destructive',
          className
        )}
        {...props}
      />
      {error && (
        <p id={errorId} className="text-sm text-destructive" role="alert">
          {error}
        </p>
      )}
      {helperText && (
        <p id={helperId} className="text-sm text-muted-foreground">
          {helperText}
        </p>
      )}
    </div>
  );
}

// Accessible link component with proper ARIA attributes
interface AccessibleLinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  children: React.ReactNode;
  external?: boolean;
  ariaLabel?: string;
}

export function AccessibleLink({
  children,
  external = false,
  ariaLabel,
  className,
  ...props
}: AccessibleLinkProps) {
  return (
    <a
      aria-label={ariaLabel}
      className={cn(
        'text-primary hover:text-primary/80 underline underline-offset-4 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded-sm',
        className
      )}
      {...(external && { target: '_blank', rel: 'noopener noreferrer' })}
      {...props}
    >
      {children}
      {external && (
        <span className="sr-only">(opens in new tab)</span>
      )}
    </a>
  );
}

// Skip link component for accessibility
export function SkipLink() {
  return (
    <a
      href="#main-content"
      className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-primary text-primary-foreground px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 z-50"
    >
      Skip to main content
    </a>
  );
}

// Screen reader only text component
export function SrOnlyText({ children }: { children: React.ReactNode }) {
  return <span className="sr-only">{children}</span>;
}

// Focus visible utility for better focus management
export function FocusVisible({ children }: { children: React.ReactNode }) {
  return (
    <div className="focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2">
      {children}
    </div>
  );
}
