import type { ReactNode } from 'react';
import { Footer } from '@/components/layouts/Footer';
import { Header } from '@/components/layouts/Header';

interface MainLayoutProps {
  children: ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  return (
    <div className='flex min-h-screen flex-col bg-background text-foreground'>
      <Header />
      <main className='flex-1'>
        <div className='mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8'>{children}</div>
      </main>
      <Footer />
    </div>
  );
}
