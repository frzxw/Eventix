import { Facebook, Twitter, Instagram, Youtube } from 'lucide-react';
import { Link } from 'react-router-dom';

export function Footer() {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    discover: [
      { href: '/', label: 'Home' },
      { href: '/discover', label: 'Browse Events' },
      { href: '/my-tickets', label: 'My Tickets' },
    ],
    support: [
      { href: '/faq', label: 'FAQ' },
      { href: '/contact', label: 'Contact Us' },
    ],
    legal: [
      { href: '/terms', label: 'Terms & Conditions' },
      { href: '/privacy', label: 'Privacy Policy' },
    ],
  };

  return (
    <footer className="relative mt-20 overflow-hidden">
      {/* Subtle gradient border */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[var(--border-glass)] to-transparent" />

      <div className="relative container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl py-12 sm:py-16">
        {/* Main content - Desktop Grid / Mobile Stack */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-12 mb-8">
          {/* Brand - Full width on mobile, spans 4 cols on desktop */}
          <div className="lg:col-span-4">
            <Link to="/" className="inline-block mb-4">
              <span className="text-2xl bg-gradient-to-r from-[var(--primary-400)] to-[var(--accent-400)] bg-clip-text text-transparent" style={{ fontWeight: 'var(--font-weight-medium)' }}>
                Eventix
              </span>
            </Link>
            <p className="text-[var(--text-secondary)] text-sm max-w-xs">
              Your premier destination for discovering and booking tickets to concerts, festivals, theater, and live entertainment.
            </p>
          </div>

          {/* Discover Links */}
          <div className="lg:col-span-2">
            <h3 className="mb-4 text-sm" style={{ fontWeight: 'var(--font-weight-semibold)' }}>Discover</h3>
            <nav className="flex flex-col gap-3" aria-label="Discover navigation">
              {footerLinks.discover.map((link) => (
                <Link
                  key={link.href}
                  to={link.href}
                  className="text-sm text-[var(--text-secondary)] hover:text-[var(--primary-400)] transition-smooth focus-ring rounded-md w-fit"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>

          {/* Support Links */}
          <div className="lg:col-span-2">
            <h3 className="mb-4 text-sm" style={{ fontWeight: 'var(--font-weight-semibold)' }}>Support</h3>
            <nav className="flex flex-col gap-3" aria-label="Support navigation">
              {footerLinks.support.map((link) => (
                <Link
                  key={link.href}
                  to={link.href}
                  className="text-sm text-[var(--text-secondary)] hover:text-[var(--primary-400)] transition-smooth focus-ring rounded-md w-fit"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>

          {/* Legal Links */}
          <div className="lg:col-span-2">
            <h3 className="mb-4 text-sm" style={{ fontWeight: 'var(--font-weight-semibold)' }}>Legal</h3>
            <nav className="flex flex-col gap-3" aria-label="Legal navigation">
              {footerLinks.legal.map((link) => (
                <Link
                  key={link.href}
                  to={link.href}
                  className="text-sm text-[var(--text-secondary)] hover:text-[var(--primary-400)] transition-smooth focus-ring rounded-md w-fit"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>

          {/* Social Links */}
          <div className="lg:col-span-2">
            <h3 className="mb-4 text-sm" style={{ fontWeight: 'var(--font-weight-semibold)' }}>Follow Us</h3>
            <div className="flex items-center gap-3">
              <SocialLink href="#" label="Facebook">
                <Facebook className="w-5 h-5" />
              </SocialLink>
              <SocialLink href="#" label="Twitter">
                <Twitter className="w-5 h-5" />
              </SocialLink>
              <SocialLink href="#" label="Instagram">
                <Instagram className="w-5 h-5" />
              </SocialLink>
              <SocialLink href="#" label="YouTube">
                <Youtube className="w-5 h-5" />
              </SocialLink>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-[var(--border-default)]">
          <p className="text-[var(--text-tertiary)] text-sm text-center">
            © {currentYear} Eventix. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}

interface SocialLinkProps {
  href: string;
  label: string;
  children: React.ReactNode;
}

function SocialLink({ href, label, children }: SocialLinkProps) {
  return (
    <a
      href={href}
      aria-label={label}
      className="relative w-10 h-10 rounded-full flex items-center justify-center text-[var(--text-secondary)] hover:text-[var(--primary-400)] transition-smooth focus-ring group"
    >
      {/* Subtle glass background on hover */}
      <div className="absolute inset-0 glass rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      
      {/* Icon */}
      <div className="relative z-10">
        {children}
      </div>
    </a>
  );
}
