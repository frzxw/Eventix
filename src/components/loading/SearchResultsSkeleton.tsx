import { motion } from 'motion/react';

const PLACEHOLDER_ITEMS = Array.from({ length: 5 });

export function SearchResultsSkeleton() {
  return (
    <div className="space-y-2">
      <p className="text-xs text-[var(--text-tertiary)] uppercase tracking-wide px-2 mb-3">
        Searching events
      </p>
      {PLACEHOLDER_ITEMS.map((_, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, x: -16 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.05 }}
          className="w-full flex items-center gap-4 p-3 rounded-2xl glass border border-[var(--border-glass)]/60"
        >
          <div className="relative w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 bg-[var(--surface-glass)] animate-pulse" />
          <div className="flex-1 min-w-0 space-y-3">
            <div className="h-4 bg-[var(--surface-glass)] rounded-md animate-pulse w-2/3" />
            <div className="flex items-center gap-4">
              <div className="h-3 bg-[var(--surface-glass)] rounded-full animate-pulse w-24" />
              <div className="h-3 bg-[var(--surface-glass)] rounded-full animate-pulse w-28" />
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}