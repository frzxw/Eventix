import { motion } from 'motion/react';

interface TicketListSkeletonProps {
  items?: number;
}

export function TicketListSkeleton({ items = 3 }: TicketListSkeletonProps) {
  return (
    <div className="space-y-6">
      {Array.from({ length: items }).map((_, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: index * 0.08 }}
          className="glass rounded-3xl border border-[var(--border-glass)] p-6 sm:p-8"
        >
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div className="flex items-start gap-4">
              <div className="h-16 w-16 rounded-2xl bg-[var(--surface-glass)]" />
              <div className="space-y-3">
                <div className="h-4 w-24 rounded-full bg-[var(--surface-glass)]" />
                <div className="h-5 w-48 rounded-full bg-[var(--surface-glass-active)]" />
                <div className="h-4 w-32 rounded-full bg-[var(--surface-glass)]" />
                <div className="flex gap-3">
                  <div className="h-4 w-24 rounded-full bg-[var(--surface-glass)]" />
                  <div className="h-4 w-20 rounded-full bg-[var(--surface-glass)]" />
                </div>
              </div>
            </div>

            <div className="flex flex-col items-start md:items-end gap-3">
              <div className="h-4 w-20 rounded-full bg-[var(--surface-glass)]" />
              <div className="h-10 w-32 rounded-full bg-[var(--surface-glass-active)]" />
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
