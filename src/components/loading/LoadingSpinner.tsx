import { motion } from 'motion/react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function LoadingSpinner({ size = 'md', className = '' }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  };

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <motion.div
        className={`${sizeClasses[size]} rounded-full border-2 border-[var(--border-glass)] border-t-[var(--primary-500)]`}
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
      />
    </div>
  );
}

export function PageLoader() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center glass backdrop-blur-xl"
    >
      <div className="text-center">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.5, 1, 0.5],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className="mb-4"
        >
          <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-[var(--primary-500)] to-[var(--accent-500)] flex items-center justify-center">
            <svg
              className="w-8 h-8 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z"
              />
            </svg>
          </div>
        </motion.div>
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-[var(--text-secondary)]"
        >
          Loading...
        </motion.p>
      </div>
    </motion.div>
  );
}

export function EventCardSkeleton() {
  return (
    <div className="glass rounded-2xl overflow-hidden border border-[var(--border-glass)] h-full flex flex-col">
      {/* Image skeleton */}
      <div className="relative aspect-[16/10] bg-[var(--surface-glass)] animate-pulse" />

      {/* Content skeleton */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col space-y-3">
        <div className="h-6 bg-[var(--surface-glass)] rounded animate-pulse w-3/4" />
        <div className="h-4 bg-[var(--surface-glass)] rounded animate-pulse w-1/2" />

        <div className="space-y-2 flex-1">
          <div className="h-4 bg-[var(--surface-glass)] rounded animate-pulse" />
          <div className="h-4 bg-[var(--surface-glass)] rounded animate-pulse" />
          <div className="h-4 bg-[var(--surface-glass)] rounded animate-pulse w-2/3" />
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-[var(--border-default)]">
          <div className="h-6 bg-[var(--surface-glass)] rounded animate-pulse w-24" />
          <div className="h-4 bg-[var(--surface-glass)] rounded animate-pulse w-20" />
        </div>
      </div>
    </div>
  );
}
