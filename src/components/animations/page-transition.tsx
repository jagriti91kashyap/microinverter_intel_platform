'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { usePathname } from 'next/navigation';

interface PageTransitionProps {
  children: React.ReactNode;
  className?: string;
}

const pageVariants = {
  initial: {
    opacity: 0,
    y: 20,
    scale: 0.98
  },
  in: {
    opacity: 1,
    y: 0,
    scale: 1
  },
  out: {
    opacity: 0,
    y: -20,
    scale: 1.02
  }
};

const pageTransition = {
  type: 'tween' as const,
  ease: [0.4, 0, 0.2, 1] as const,
  duration: 0.4
};

const pageStyle = {
  position: 'absolute' as const,
  width: '100%',
  height: '100%'
};

export function PageTransition({ children, className }: PageTransitionProps) {
  const pathname = usePathname();

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={pathname}
        initial="initial"
        animate="in"
        exit="out"
        variants={pageVariants}
        transition={pageTransition}
        style={pageStyle}
        className={className}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}

// Enhanced page transition with different animation types
interface EnhancedPageTransitionProps {
  children: React.ReactNode;
  className?: string;
  type?: 'fade' | 'slide' | 'scale' | 'flip';
}

export function EnhancedPageTransition({ 
  children, 
  className, 
  type = 'fade' 
}: EnhancedPageTransitionProps) {
  const pathname = usePathname();

  const getVariants = () => {
    switch (type) {
      case 'slide':
        return {
          initial: { opacity: 0, x: 100 },
          in: { opacity: 1, x: 0 },
          out: { opacity: 0, x: -100 }
        };
      case 'scale':
        return {
          initial: { opacity: 0, scale: 0.8 },
          in: { opacity: 1, scale: 1 },
          out: { opacity: 0, scale: 1.2 }
        };
      case 'flip':
        return {
          initial: { opacity: 0, rotateY: 90 },
          in: { opacity: 1, rotateY: 0 },
          out: { opacity: 0, rotateY: -90 }
        };
      default:
        return pageVariants;
    }
  };

  const getTransition = () => {
    switch (type) {
      case 'slide':
        return { type: 'tween' as const, ease: [0.4, 0, 0.2, 1] as const, duration: 0.3 };
      case 'scale':
        return { type: 'spring' as const, stiffness: 300, damping: 30 };
      case 'flip':
        return { type: 'tween' as const, ease: [0.4, 0, 0.2, 1] as const, duration: 0.6 };
      default:
        return pageTransition;
    }
  };

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={pathname}
        initial="initial"
        animate="in"
        exit="out"
        variants={getVariants()}
        transition={getTransition()}
        style={pageStyle}
        className={className}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
