import Link from 'next/link';
import { siteConfig } from '@/config/site';

const footerLinks = [
  { label: 'Privacy', href: '/privacy' },
  { label: 'Terms', href: '/terms' },
  { label: 'Documentation', href: '/docs' },
];

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className='w-full border-border border-t bg-background'>
      <div className='mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 py-6 sm:flex-row sm:px-6 lg:px-8'>
        {/* Copyright */}
        <p className='text-muted-foreground text-xs'>
          © {currentYear} {siteConfig.name.toUpperCase()} PROTOCOL
        </p>

        {/* Links */}
        <nav className='flex items-center gap-5'>
          {footerLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className='text-muted-foreground text-xs transition-colors hover:text-foreground'
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </footer>
  );
}
