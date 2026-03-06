'use client';

import Image from 'next/image';
import { useTranslations } from 'next-intl';

export default function Home() {
  const t = useTranslations('home');

  return (
    <div className='flex flex-col items-center gap-8 py-16 sm:items-start'>
      <Image className='dark:invert' src='/next.svg' alt='Next.js logo' width={100} height={20} priority />
      <div className='flex flex-col items-center gap-6 text-center sm:items-start sm:text-left'>
        <h1 className='max-w-xs font-semibold text-3xl text-black leading-10 tracking-tight dark:text-zinc-50'>
          {t('title')}
        </h1>
        <p className='max-w-md text-lg text-zinc-600 leading-8 dark:text-zinc-400'>
          {t('description')}{' '}
          <a
            href='https://vercel.com/templates?framework=next.js'
            className='font-medium text-zinc-950 dark:text-zinc-50'
          >
            {t('templates')}
          </a>{' '}
          {t('or')}{' '}
          <a href='https://nextjs.org/learn' className='font-medium text-zinc-950 dark:text-zinc-50'>
            {t('learningCenter')}
          </a>
          .
        </p>
      </div>
      <div className='flex flex-col gap-4 font-medium text-base sm:flex-row'>
        <a
          className='flex h-12 w-full items-center justify-center gap-2 rounded-full bg-foreground px-5 text-background transition-colors hover:bg-[#383838] md:w-[158px] dark:hover:bg-[#ccc]'
          href='https://vercel.com/new'
          target='_blank'
          rel='noopener noreferrer'
        >
          <Image className='dark:invert' src='/vercel.svg' alt='Vercel logomark' width={16} height={16} />
          {t('deployNow')}
        </a>
        <a
          className='flex h-12 w-full items-center justify-center rounded-full border border-black/[.08] border-solid px-5 transition-colors hover:border-transparent hover:bg-black/[.04] md:w-[158px] dark:border-white/[.145] dark:hover:bg-[#1a1a1a]'
          href='https://nextjs.org/docs'
          target='_blank'
          rel='noopener noreferrer'
        >
          {t('documentation')}
        </a>
      </div>
    </div>
  );
}
