import { Facebook, Twitter, Instagram, Youtube } from 'lucide-react';
import { Link } from 'react-router-dom';

export function Footer() {
  const currentYear = new Date().getFullYear();

  const footerLinks = [
    { href: '/', label: 'Events' },
    { href: '/discover', label: 'Discover' },
    { href: '/my-tickets', label: 'My Tickets' },
    { href: '/profile', label: 'Profile' },
  ];

  return (
    <footer className="relative mt-20 overflow-hidden">
      {/* Subtle gradient border */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[var(--border-glass)] to-transparent" />

      <div className="relative container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl py-6 sm:py-8">
        {/* Main content */}
        <div className="flex flex-col items-center gap-5">
          {/* Brand */}
          <Link to="/" className="flex items-center">
            <span className="text-2xl bg-gradient-to-r from-[var(--primary-400)] to-[var(--accent-400)] bg-clip-text text-transparent" style={{ fontWeight: 'var(--font-weight-medium)' }}>
              Eventix
            </span>
          </Link>

          {/* Links */}
          <nav className="flex flex-wrap items-center justify-center gap-x-8 gap-y-2" aria-label="Footer navigation">
            {footerLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                className="text-sm text-[var(--text-secondary)] hover:text-[var(--primary-400)] transition-smooth focus-ring rounded-md px-2 py-1"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Social Links */}
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

          {/* Copyright */}
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
