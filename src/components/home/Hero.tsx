import { motion } from 'motion/react';
import { SearchBar } from './SearchBar';
import { useNavigate } from 'react-router-dom';

export function Hero() {
  const navigate = useNavigate();

  const handleSearch = (query: string) => {
    if (query.trim()) {
      navigate(`/discover?search=${encodeURIComponent(query)}`);
    }
  };
  return (
    <section className="relative pt-8 sm:pt-12 pb-16 sm:pb-20 overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 -z-10">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 0.2, scale: 1 }}
          transition={{ duration: 1.2, ease: 'easeOut' }}
          className="absolute top-20 left-10 w-96 h-96 bg-[var(--primary-500)] rounded-full blur-[128px]"
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 0.2, scale: 1 }}
          transition={{ duration: 1.2, delay: 0.2, ease: 'easeOut' }}
          className="absolute bottom-20 right-10 w-96 h-96 bg-[var(--accent-500)] rounded-full blur-[128px]"
        />
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        {/* Hero Text */}
        <div className="text-center mb-8 sm:mb-10">
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className="text-4xl sm:text-5xl lg:text-6xl mb-4 sm:mb-6"
            style={{ fontWeight: 'var(--font-weight-medium)' }}
          >
            <motion.span
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="block mb-2"
            >
              Discover Your Next
            </motion.span>
            <motion.span
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="block bg-gradient-to-r from-[var(--primary-400)] to-[var(--accent-400)] bg-clip-text"
              style={{ WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', color: 'transparent' }}
            >
              Unforgettable Experience
            </motion.span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="text-lg sm:text-xl text-[var(--text-secondary)] max-w-2xl mx-auto"
          >
            From electrifying concerts to intimate theater performances, find and book tickets to the best live events across Indonesia
          </motion.p>
        </div>

        {/* Search Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="max-w-4xl mx-auto mb-8 sm:mb-12"
        >
          <SearchBar onSearch={handleSearch} />
        </motion.div>

        {/* Quick Stats - Liquid Glass Style */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6 max-w-5xl mx-auto"
        >
          <StatCard number="10K+" label="Events" delay={0.6} />
          <StatCard number="500+" label="Venues" delay={0.65} />
          <StatCard number="1M+" label="Tickets Sold" delay={0.7} />
          <StatCard number="50+" label="Cities" delay={0.75} />
        </motion.div>
      </div>
    </section>
  );
}

interface StatCardProps {
  number: string;
  label: string;
  delay?: number;
}

function StatCard({ number, label, delay = 0 }: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, delay }}
      whileHover={{ scale: 1.05, y: -5 }}
      className="relative group"
    >
      {/* Liquid glass glow effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-[var(--primary-500)] to-[var(--accent-500)] rounded-2xl blur-xl opacity-20 group-hover:opacity-30 transition-smooth" />
      
      {/* Card content */}
      <div className="relative glass rounded-2xl p-4 sm:p-6 border border-[var(--border-glass)] transition-smooth hover:bg-[var(--surface-glass-hover)] hover:border-[var(--primary-500)]/30">
        <motion.div
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, delay: delay + 0.1 }}
          className="text-2xl sm:text-3xl mb-1 bg-gradient-to-r from-[var(--primary-500)] to-[var(--accent-500)] bg-clip-text text-transparent"
          style={{ fontWeight: 'var(--font-weight-medium)' }}
        >
          {number}
        </motion.div>
        <div className="text-sm sm:text-base text-[var(--text-secondary)]">
          {label}
        </div>
      </div>
    </motion.div>
  );
}
