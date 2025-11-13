import { motion } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { Home, Search, Ticket, ArrowLeft } from 'lucide-react';
import { Button } from '../components/ui/button';

export function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="max-w-2xl w-full text-center">
        {/* 404 Animation */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="mb-8"
        >
          <motion.div
            animate={{
              y: [0, -10, 0],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
            className="inline-block"
          >
            <div className="text-[120px] sm:text-[180px] font-bold bg-gradient-to-br from-[var(--primary-400)] to-[var(--primary-600)] bg-clip-text text-transparent leading-none">
              404
            </div>
          </motion.div>
        </motion.div>

        {/* Message */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <h1 className="mb-4">Page Not Found</h1>
          <p className="text-[var(--text-secondary)] mb-8 max-w-md mx-auto">
            Oops! The page you&rsquo;re looking for doesn&rsquo;t exist. It might have been moved or deleted, or you
            may have mistyped the URL.
          </p>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="relative rounded-3xl overflow-hidden mb-8"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-[var(--surface-glass)]/80 to-[var(--surface-glass)]/40 backdrop-blur-xl border border-[var(--border-glass)]" />
          <div className="relative p-8">
            <h2 className="mb-6">Quick Actions</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <button
                onClick={() => navigate('/')}
                className="group relative p-6 rounded-2xl border border-[var(--border-default)] hover:border-[var(--primary-500)]/50 transition-all duration-300 hover:shadow-lg hover:shadow-[var(--primary-500)]/10"
              >
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[var(--primary-500)]/20 to-[var(--primary-600)]/20 border border-[var(--primary-500)]/30 flex items-center justify-center mb-4 mx-auto group-hover:scale-110 transition-transform">
                  <Home className="w-6 h-6 text-[var(--primary-400)]" />
                </div>
                <p style={{ fontWeight: 'var(--font-weight-medium)' }} className="mb-1">
                  Home
                </p>
                <p className="text-sm text-[var(--text-secondary)]">Back to homepage</p>
              </button>

              <button
                onClick={() => navigate('/discover')}
                className="group relative p-6 rounded-2xl border border-[var(--border-default)] hover:border-[var(--primary-500)]/50 transition-all duration-300 hover:shadow-lg hover:shadow-[var(--primary-500)]/10"
              >
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[var(--primary-500)]/20 to-[var(--primary-600)]/20 border border-[var(--primary-500)]/30 flex items-center justify-center mb-4 mx-auto group-hover:scale-110 transition-transform">
                  <Search className="w-6 h-6 text-[var(--primary-400)]" />
                </div>
                <p style={{ fontWeight: 'var(--font-weight-medium)' }} className="mb-1">
                  Discover
                </p>
                <p className="text-sm text-[var(--text-secondary)]">Browse events</p>
              </button>

              <button
                onClick={() => navigate('/my-tickets')}
                className="group relative p-6 rounded-2xl border border-[var(--border-default)] hover:border-[var(--primary-500)]/50 transition-all duration-300 hover:shadow-lg hover:shadow-[var(--primary-500)]/10"
              >
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[var(--primary-500)]/20 to-[var(--primary-600)]/20 border border-[var(--primary-500)]/30 flex items-center justify-center mb-4 mx-auto group-hover:scale-110 transition-transform">
                  <Ticket className="w-6 h-6 text-[var(--primary-400)]" />
                </div>
                <p style={{ fontWeight: 'var(--font-weight-medium)' }} className="mb-1">
                  My Tickets
                </p>
                <p className="text-sm text-[var(--text-secondary)]">View your tickets</p>
              </button>
            </div>
          </div>
        </motion.div>

        {/* Go Back Button */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
        >
          <Button
            onClick={() => navigate(-1)}
            variant="ghost"
            className="text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Go Back
          </Button>
        </motion.div>
      </div>
    </div>
  );
}
