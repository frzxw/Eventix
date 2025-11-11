import { motion } from 'motion/react';

interface EventCardSkeletonProps {
  animate?: boolean;
}

export function EventCardSkeleton({ animate = true }: EventCardSkeletonProps) {
  return (
    <motion.div
      className="glass rounded-2xl border border-[var(--border-glass)] overflow-hidden"
      initial={animate ? { opacity: 0.6 } : false}
      animate={animate ? { opacity: [0.6, 0.9, 0.6] } : undefined}
      transition={animate ? { duration: 1.6, repeat: Infinity, ease: 'easeInOut' } : undefined}
    >
      <div className="relative aspect-[16/10] bg-[var(--surface-glass)]" />
      <div className="p-4 sm:p-5 space-y-4">
        <div className="flex items-center gap-2">
          <span className="h-6 w-20 rounded-full bg-[var(--surface-glass-active)]" />
          <span className="h-6 w-16 rounded-full bg-[var(--surface-glass)]" />
        </div>
        <div className="space-y-2">
          <div className="h-6 w-3/4 rounded-full bg-[var(--surface-glass-active)]" />
          <div className="h-4 w-1/2 rounded-full bg-[var(--surface-glass)]" />
        </div>
        <div className="space-y-2">
          <div className="h-4 w-full rounded-full bg-[var(--surface-glass)]" />
          <div className="h-4 w-5/6 rounded-full bg-[var(--surface-glass)]" />
          <div className="h-4 w-2/3 rounded-full bg-[var(--surface-glass)]" />
        </div>
        <div className="flex items-center justify-between pt-4 border-t border-[var(--border-default)]">
          <div className="space-y-2">
            <div className="h-3 w-12 rounded-full bg-[var(--surface-glass)]" />
            <div className="h-5 w-24 rounded-full bg-[var(--surface-glass-active)]" />
          </div>
          <div className="h-10 w-24 rounded-full bg-[var(--surface-glass-active)]" />
        </div>
      </div>
    </motion.div>
  );
}
