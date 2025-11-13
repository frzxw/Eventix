import { Search, Menu, User, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from '../ui/button';
import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { SearchModal } from '../search/SearchModal';

export function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const location = useLocation();
  
  const getCurrentPage = () => {
    if (location.pathname === '/') return 'home';
    if (location.pathname === '/discover') return 'discover';
    if (location.pathname === '/my-tickets') return 'my-tickets';
    if (location.pathname === '/profile') return 'profile';
    return '';
  };
  
  const currentPage = getCurrentPage();

  return (
    <motion.header
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="sticky top-0 z-50 w-full py-3 sm:py-4"
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        {/* Pill-shaped Header Container with Neo Glassmorphism */}
        <div className="relative rounded-full">
          {/* Animated liquid glass gradient background */}
          <div className="absolute inset-0 bg-gradient-to-r from-[var(--primary-500)]/5 via-[var(--accent-500)]/5 to-[var(--primary-500)]/5 animate-gradient rounded-full" />
          
          {/* Glass blur layer */}
          <div className="absolute inset-0 backdrop-blur-xl bg-[var(--background-primary)]/70 border border-[var(--border-glass)] rounded-full shadow-2xl shadow-black/5" />
          
          {/* Subtle top glow */}
          <div className="absolute top-0 left-8 right-8 h-px bg-gradient-to-r from-transparent via-[var(--primary-500)]/30 to-transparent rounded-full" />

          {/* Content */}
          <nav className="relative px-4 sm:px-6" aria-label="Main navigation">
            <div className="relative flex items-center justify-between w-full z-10 h-14 sm:h-16">
              {/* Logo/Brand */}
              <Link 
                to="/"
                className="flex items-center gap-2 sm:gap-3 group focus-ring rounded-full px-2 -ml-2 py-2"
                aria-label="Eventix Home"
              >
                <span className="text-xl sm:text-2xl bg-gradient-to-r from-[var(--primary-400)] to-[var(--accent-400)] bg-clip-text text-transparent transition-all duration-300 group-hover:from-[var(--primary-300)] group-hover:to-[var(--accent-300)]" style={{ fontWeight: 'var(--font-weight-medium)' }}>
                  Eventix
                </span>
              </Link>

              {/* Desktop Navigation - Centered with Neo Glass Pills */}
              <nav className="hidden md:flex items-center gap-1 absolute left-1/2 -translate-x-1/2" aria-label="Main navigation">
                <NavLink to="/" active={currentPage === 'home'}>
                  Home
                </NavLink>
                <NavLink to="/discover" active={currentPage === 'discover'}>
                  Discover
                </NavLink>
                <NavLink to="/my-tickets" active={currentPage === 'my-tickets'}>
                  My Tickets
                </NavLink>
              </nav>

              {/* Desktop Actions with Neo Glass Effect */}
              <div className="hidden md:flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsSearchOpen(true)}
                  className="relative rounded-full glass-hover border border-[var(--border-glass)] hover:border-[var(--primary-500)]/30 transition-all duration-300 group overflow-hidden h-9 w-9"
                  aria-label="Search"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-[var(--primary-500)]/0 to-[var(--accent-500)]/0 group-hover:from-[var(--primary-500)]/10 group-hover:to-[var(--accent-500)]/10 transition-all duration-300 rounded-full" />
                  <Search className="w-4 h-4 relative z-10" aria-hidden="true" />
                </Button>

                <Link to="/auth/login">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="relative rounded-full glass-hover border border-[var(--border-glass)] hover:border-[var(--primary-500)]/30 transition-all duration-300 group overflow-hidden h-9 w-9"
                    aria-label="Login / My Account"
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-[var(--primary-500)]/0 to-[var(--accent-500)]/0 group-hover:from-[var(--primary-500)]/10 group-hover:to-[var(--accent-500)]/10 transition-all duration-300 rounded-full" />
                    <User className="w-4 h-4 relative z-10" aria-hidden="true" />
                  </Button>
                </Link>

                <div className="relative ml-1">
                  {/* Glow effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-[var(--primary-500)] to-[var(--accent-500)] rounded-full blur-lg opacity-30" />
                  
                  <Link to="/discover">
                    <Button
                      size="sm"
                      className="relative bg-gradient-to-r from-[var(--primary-500)] to-[var(--accent-500)] hover:opacity-90 transition-all duration-300 text-white border-0 shadow-xl shadow-[var(--primary-500)]/20 hover:shadow-2xl hover:shadow-[var(--primary-500)]/30 h-9 px-4 rounded-full"
                    >
                      Get Tickets
                    </Button>
                  </Link>
                </div>
              </div>

              {/* Mobile Menu Button */}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden relative rounded-full glass-hover border border-[var(--border-glass)] transition-all duration-300 h-9 w-9"
                aria-label="Toggle menu"
                aria-expanded={isMobileMenuOpen}
              >
                {isMobileMenuOpen ? (
                  <X className="w-4 h-4" aria-hidden="true" />
                ) : (
                  <Menu className="w-4 h-4" aria-hidden="true" />
                )}
              </Button>
            </div>

            {/* Mobile Menu with Neo Glass Effect */}
            <AnimatePresence>
              {isMobileMenuOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3, ease: 'easeInOut' }}
                  className="md:hidden pt-3 pb-4"
                >
                <div className="glass rounded-xl border border-[var(--border-glass)] p-3 backdrop-blur-xl">
                  <div className="flex flex-col gap-1.5">
                  <MobileNavLink to="/" onClick={() => setIsMobileMenuOpen(false)} active={currentPage === 'home'}>
                    Home
                  </MobileNavLink>
                  <MobileNavLink to="/discover" onClick={() => setIsMobileMenuOpen(false)} active={currentPage === 'discover'}>
                    Discover
                  </MobileNavLink>
                  <MobileNavLink to="/my-tickets" onClick={() => setIsMobileMenuOpen(false)} active={currentPage === 'my-tickets'}>
                    My Tickets
                  </MobileNavLink>
                  
                  {/* Mobile Action Buttons */}
                  <div className="flex gap-2 mt-2 px-1">
                    <Button
                      variant="ghost"
                      onClick={() => {
                        setIsMobileMenuOpen(false);
                        setIsSearchOpen(true);
                      }}
                      className="flex-1 glass-hover border border-[var(--border-glass)] transition-all duration-300 rounded-xl"
                      aria-label="Search"
                    >
                      <Search className="w-4 h-4 mr-2" aria-hidden="true" />
                      Search
                    </Button>
                    <Link to="/auth/login" onClick={() => setIsMobileMenuOpen(false)} className="flex-1">
                      <Button
                        variant="ghost"
                        className="w-full glass-hover border border-[var(--border-glass)] transition-all duration-300 rounded-xl"
                        aria-label="Login"
                      >
                        <User className="w-4 h-4 mr-2" aria-hidden="true" />
                        Login
                      </Button>
                    </Link>
                  </div>

                    <div className="relative mt-2 px-1">
                      {/* Glow effect */}
                      <div className="absolute inset-0 bg-gradient-to-r from-[var(--primary-500)] to-[var(--accent-500)] rounded-xl blur-lg opacity-30" />
                      
                      <Link to="/discover" onClick={() => setIsMobileMenuOpen(false)}>
                        <Button 
                          className="relative w-full bg-gradient-to-r from-[var(--primary-500)] to-[var(--accent-500)] hover:opacity-90 transition-all duration-300 text-white shadow-lg shadow-[var(--primary-500)]/20 rounded-xl"
                        >
                          Get Tickets
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
                </motion.div>
              )}
            </AnimatePresence>
          </nav>
        </div>
      </div>

      {/* Search Modal */}
      <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </motion.header>
  );
}

interface NavLinkProps {
  to: string;
  active?: boolean;
  children: React.ReactNode;
}

function NavLink({ to, active = false, children }: NavLinkProps) {
  return (
    <Link
      to={to}
      className={`relative px-3 py-1.5 rounded-full transition-all duration-300 group overflow-hidden text-sm ${
        active
          ? 'text-[var(--text-primary)]'
          : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
      }`}
    >
      {/* Neo glass background */}
      <div className={`absolute inset-0 rounded-full transition-all duration-300 ${
        active
          ? 'bg-[var(--surface-glass-active)] border border-[var(--border-glass)]'
          : 'bg-transparent group-hover:bg-[var(--surface-glass-hover)] border border-transparent group-hover:border-[var(--border-glass)]'
      }`} />
      
      {/* Active indicator with gradient */}
      {active && (
        <div className="absolute inset-0 bg-gradient-to-r from-[var(--primary-500)]/10 to-[var(--accent-500)]/10 rounded-full" />
      )}
      
      <span className="relative z-10">{children}</span>
    </Link>
  );
}

interface MobileNavLinkProps {
  to: string;
  onClick?: () => void;
  active?: boolean;
  children: React.ReactNode;
}

function MobileNavLink({ to, onClick, active = false, children }: MobileNavLinkProps) {
  return (
    <Link
      to={to}
      onClick={onClick}
      className={`relative px-4 py-2.5 rounded-xl text-left transition-all duration-300 overflow-hidden text-sm ${
        active
          ? 'text-[var(--text-primary)]'
          : 'text-[var(--text-secondary)]'
      }`}
    >
      {/* Neo glass background */}
      <div className={`absolute inset-0 rounded-xl transition-all duration-300 ${
        active
          ? 'bg-[var(--surface-glass-active)] border border-[var(--border-glass)]'
          : 'bg-transparent hover:bg-[var(--surface-glass-hover)] border border-transparent hover:border-[var(--border-glass)]'
      }`} />
      
      {/* Active indicator with gradient */}
      {active && (
        <div className="absolute inset-0 bg-gradient-to-r from-[var(--primary-500)]/10 to-[var(--accent-500)]/10 rounded-xl" />
      )}
      
      <span className="relative z-10">{children}</span>
    </Link>
  );
}
