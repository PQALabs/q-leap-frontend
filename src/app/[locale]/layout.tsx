import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import { notFound } from 'next/navigation';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import '../globals.css';
import { Toaster } from '@/components/ui/sonner';
import { env } from '@/config/env';
import { routing } from '@/i18n/routing';
import Providers from '../providers';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: { default: env.APP_NAME, template: `%s | ${env.APP_NAME}` },
  description: 'Decentralized lending protocol on QDay Network',
  applicationName: env.APP_NAME,
  metadataBase: new URL(env.APP_URL),
  icons: {
    icon: '/icon.png',
    apple: '/apple-icon.png',
  },
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  // Validate that the locale is supported
  if (!routing.locales.includes(locale as (typeof routing.locales)[number])) {
    notFound();
  }

  // Load messages for the current locale
  const messages = await getMessages();

  return (
    <html lang={locale} suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`} suppressHydrationWarning>
        <NextIntlClientProvider messages={messages}>
          <Providers>
            <Toaster />
            {children}
          </Providers>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
