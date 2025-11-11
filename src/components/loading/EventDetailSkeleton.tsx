import { motion } from 'motion/react';

export function EventDetailSkeleton() {
  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl py-8">
      <motion.div
        className="mb-6 h-10 w-40 rounded-full bg-[var(--surface-glass)]"
        initial={{ opacity: 0.6 }}
        animate={{ opacity: [0.6, 0.9, 0.6] }}
        transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="relative aspect-[16/9] rounded-2xl bg-[var(--surface-glass)]" />

          <div className="glass rounded-2xl border border-[var(--border-glass)] p-6 sm:p-8 space-y-6">
            <div className="space-y-3">
              <div className="h-9 w-3/4 rounded-full bg-[var(--surface-glass-active)]" />
              <div className="h-5 w-1/2 rounded-full bg-[var(--surface-glass)]" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="h-20 rounded-xl bg-[var(--surface-glass)]" />
              ))}
            </div>

            <div className="space-y-3">
              <div className="h-6 w-40 rounded-full bg-[var(--surface-glass-active)]" />
              {Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="h-4 w-full rounded-full bg-[var(--surface-glass)]" />
              ))}
            </div>
          </div>

          <div className="glass rounded-2xl border border-[var(--border-glass)] p-6 sm:p-8 space-y-3">
            <div className="h-6 w-48 rounded-full bg-[var(--surface-glass-active)]" />
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="h-4 w-2/3 rounded-full bg-[var(--surface-glass)]" />
            ))}
          </div>
        </div>

        <div className="lg:col-span-1">
          <div className="glass rounded-2xl border border-[var(--border-glass)] p-6 space-y-4 sticky top-24">
            <div className="h-6 w-32 rounded-full bg-[var(--surface-glass-active)]" />
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="h-20 rounded-xl bg-[var(--surface-glass)]" />
            ))}
            <div className="h-12 rounded-full bg-[var(--surface-glass-active)]" />
            <div className="space-y-2 pt-4 border-t border-[var(--border-default)]">
              {Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="h-3 w-3/4 rounded-full bg-[var(--surface-glass)]" />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
