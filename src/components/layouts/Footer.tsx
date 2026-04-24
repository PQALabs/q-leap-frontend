'use client';

import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { siteConfig } from '@/config/site';

const footerLinks = ['privacy', 'terms', 'documentation'] as const;
const footerHrefs: Record<(typeof footerLinks)[number], string> = {
  privacy: '#',
  terms: '#',
  documentation: '#',
};

export function Footer() {
  const t = useTranslations('footer');
  const currentYear = new Date().getFullYear();

  return (
    <footer className='w-full border-border border-t bg-background'>
      <div className='mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 py-6 sm:flex-row sm:px-6 lg:px-8'>
        {/* Copyright */}
        <p className='text-muted-foreground text-xs'>
          © {currentYear} {siteConfig.name.toUpperCase()} {t('protocol')}
        </p>

        {/* Links */}
        <nav className='flex items-center gap-5'>
          {footerLinks.map((key) => (
            <Link
              key={key}
              href={footerHrefs[key]}
              className='text-muted-foreground text-xs transition-colors hover:text-foreground'
            >
              {t(key)}
            </Link>
          ))}
        </nav>
      </div>
    </footer>
  );
}
