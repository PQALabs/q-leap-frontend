'use client';

import { Skeleton } from '@/components/ui/skeleton';

export function ReserveOverviewSkeleton() {
  return (
    <main className='mx-auto flex w-full max-w-7xl flex-col gap-6 pt-0 pb-8 md:pt-8'>
      {/* ── Back button ── */}
      <Skeleton className='h-4 w-16' />

      {/* ── Top Header Bar ── */}
      <div className='flex flex-wrap items-center gap-6'>
        {/* Token identity */}
        <div className='flex items-center gap-3'>
          <Skeleton className='h-12 w-12 rounded-full' />
          <div className='flex flex-col gap-1'>
            <Skeleton className='h-4 w-16' />
            <Skeleton className='h-6 w-24' />
          </div>
        </div>

        {/* Stat pills */}
        <div className='grid grid-cols-2 gap-4 md:ml-auto md:flex md:flex-wrap md:gap-8 lg:gap-16'>
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className='flex flex-col gap-1'>
              <Skeleton className='h-3 w-24' />
              <Skeleton className='h-7 w-20' />
            </div>
          ))}
        </div>
      </div>

      {/* ── Two-column body ── */}
      <div className='grid grid-cols-1 gap-6 lg:grid-cols-[1fr_420px]'>
        {/* Left column */}
        <div className='flex flex-col gap-6'>
          {/* Reserve status config card */}
          <div className='rounded-xs border border-border bg-card p-6'>
            <Skeleton className='mb-4 h-6 w-60' />
            <div className='flex flex-col gap-4'>
              <Skeleton className='h-20 w-full' />
              <Skeleton className='h-px w-full' />
              <Skeleton className='h-16 w-full' />
              <Skeleton className='h-px w-full' />
              <Skeleton className='h-20 w-full' />
              <Skeleton className='h-px w-full' />
              <Skeleton className='h-16 w-full' />
            </div>
          </div>
          {/* User position summary card */}
          <div className='rounded-xs border border-border bg-card p-6'>
            <Skeleton className='mb-4 h-6 w-48' />
            <div className='flex gap-4'>
              <Skeleton className='h-20 flex-1' />
              <Skeleton className='h-20 flex-1' />
              <Skeleton className='h-20 flex-1' />
            </div>
          </div>
        </div>

        {/* Right column — ReserveActions */}
        <div className='rounded-xs border border-border bg-card p-5'>
          <Skeleton className='mb-4 h-9 w-full rounded-xs' />
          <div className='flex flex-col gap-4'>
            <Skeleton className='h-6 w-40' />
            <Skeleton className='h-16 w-full rounded-xs' />
            <div className='flex gap-3'>
              <Skeleton className='h-9 flex-1 rounded-xs' />
              <Skeleton className='h-9 flex-1 rounded-xs' />
            </div>
            <Skeleton className='h-20 w-full rounded-xs' />
            <Skeleton className='h-px w-full' />
            <Skeleton className='h-6 w-40' />
            <Skeleton className='h-16 w-full rounded-xs' />
            <Skeleton className='h-9 w-full rounded-xs' />
          </div>
        </div>
      </div>
    </main>
  );
}
