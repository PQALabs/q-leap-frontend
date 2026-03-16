'use client';

import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

// ---------------------------------------------------------------------------
// MarketBasicInfo Skeleton
// ---------------------------------------------------------------------------
export function MarketBasicInfoSkeleton() {
  return (
    <div className='relative flex flex-col gap-4 rounded-2xl'>
      {/* Button placeholder */}
      <Skeleton className='absolute top-5 right-0 hidden h-8 w-36 sm:block' />

      {/* Logo + Title */}
      <div className='flex items-center gap-3'>
        <Skeleton className='h-10 w-10 rounded-full' />
        <div className='flex flex-col gap-1.5'>
          <Skeleton className='h-5 w-20' />
          <Skeleton className='h-3.5 w-48' />
        </div>
      </div>

      {/* Divider */}
      <div className='h-px w-full bg-border' />

      {/* Stats row */}
      <div className='flex flex-wrap items-end gap-8'>
        <div className='flex flex-col gap-1.5'>
          <Skeleton className='h-3 w-16' />
          <Skeleton className='h-8 w-32' />
        </div>
        <div className='flex flex-col gap-1.5'>
          <Skeleton className='h-3 w-14' />
          <Skeleton className='h-7 w-20' />
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// MarketSummary Skeleton
// ---------------------------------------------------------------------------
export function MarketSummarySkeleton() {
  return (
    <div className='flex flex-col gap-3 sm:flex-row'>
      {[...Array(4)].map((_, i) => (
        <div key={i} className='flex flex-1 flex-col gap-3 rounded-xs border border-border bg-card p-5 shadow-xs'>
          <Skeleton className='h-3 w-24' />
          <Skeleton className='h-8 w-32' />
          {i === 3 && <Skeleton className='h-2 w-full rounded-full' />}
        </div>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// CoreAssets Skeleton
// ---------------------------------------------------------------------------
export function CoreAssetsSkeleton() {
  return (
    <div className='flex flex-col gap-5 rounded-xs border border-border bg-card p-6 shadow-xs'>
      {/* Heading */}
      <Skeleton className='h-6 w-28' />

      {/* Controls row */}
      <div className='flex flex-wrap items-center justify-between gap-3'>
        <Skeleton className='h-9 w-56' />
        <Skeleton className='h-5 w-32' />
      </div>

      {/* Table skeleton */}
      <div className='hidden overflow-x-auto rounded-xs border border-border md:block'>
        <table className='w-full min-w-[640px] text-sm'>
          <thead>
            <tr className='border-border border-b bg-muted/60 font-semibold text-muted-foreground text-xs uppercase tracking-wider'>
              <th className='px-3 py-3 pl-5 text-left'>
                <Skeleton className='h-3 w-12' />
              </th>
              <th className='px-3 py-3 text-right'>
                <Skeleton className='ml-auto h-3 w-20' />
              </th>
              <th className='px-3 py-3 text-right'>
                <Skeleton className='ml-auto h-3 w-24' />
              </th>
              <th className='px-3 py-3 text-right'>
                <Skeleton className='ml-auto h-3 w-20' />
              </th>
              <th className='px-3 py-3 text-right'>
                <Skeleton className='ml-auto h-3 w-24' />
              </th>
              <th className='px-3 py-3 pr-5' />
            </tr>
          </thead>
          <tbody>
            {[...Array(4)].map((_, i) => (
              <tr key={i} className={cn('border-border', i < 3 && 'border-b')}>
                {/* Asset */}
                <td className='px-3 py-4 pl-5'>
                  <div className='flex items-center gap-3'>
                    <Skeleton className='h-9 w-9 shrink-0 rounded-full' />
                    <div className='flex flex-col gap-1'>
                      <Skeleton className='h-4 w-16' />
                      <Skeleton className='h-3 w-24' />
                    </div>
                  </div>
                </td>
                {/* Supply APY */}
                <td className='px-3 py-4 text-right'>
                  <Skeleton className='ml-auto h-4 w-12' />
                </td>
                {/* Total Supplied */}
                <td className='px-3 py-4 text-right'>
                  <div className='flex flex-col items-end gap-1'>
                    <Skeleton className='h-4 w-16' />
                    <Skeleton className='h-3 w-24' />
                  </div>
                </td>
                {/* Borrow APY */}
                <td className='px-3 py-4 text-right'>
                  <Skeleton className='ml-auto h-4 w-12' />
                </td>
                {/* Total Borrowed */}
                <td className='px-3 py-4 text-right'>
                  <div className='flex flex-col items-end gap-1'>
                    <Skeleton className='h-4 w-16' />
                    <Skeleton className='h-3 w-24' />
                  </div>
                </td>
                {/* Actions */}
                <td className='px-3 py-4 pr-5 text-right'>
                  <Skeleton className='ml-auto h-7 w-16 rounded-xs' />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile cards skeleton */}
      <div className='flex flex-col gap-3 md:hidden'>
        {[...Array(3)].map((_, i) => (
          <div key={i} className='rounded-xs border border-border p-4'>
            <div className='mb-3 flex items-center gap-3'>
              <Skeleton className='h-9 w-9 rounded-full' />
              <div className='flex flex-col gap-1'>
                <Skeleton className='h-4 w-16' />
                <Skeleton className='h-3 w-24' />
              </div>
            </div>
            <div className='grid grid-cols-2 gap-3'>
              {[...Array(4)].map((_, j) => (
                <div key={j} className='flex flex-col gap-1'>
                  <Skeleton className='h-3 w-20' />
                  <Skeleton className='h-4 w-16' />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
