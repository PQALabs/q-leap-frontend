import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';

export function DashboardSkeleton() {
  return (
    <main className='mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 py-6 md:py-10'>
      {/* Header */}
      <Skeleton className='h-8 w-48' />

      {/* Stat cards */}
      <div className='grid grid-cols-1 gap-4 md:grid-cols-3'>
        {[1, 2, 3].map((i) => (
          <div key={i} className='flex flex-col gap-3 rounded-xs border border-border bg-card p-5'>
            <Skeleton className='h-3 w-24' />
            <Skeleton className='h-8 w-32' />
            <Skeleton className='h-2 w-full' />
          </div>
        ))}
      </div>

      {/* Supplies section */}
      <div className='flex flex-col gap-3'>
        <div className='flex items-center gap-3'>
          <Skeleton className='h-6 w-36' />
          <Skeleton className='h-6 w-32 rounded-md' />
        </div>
        <div className='rounded-xs border border-border'>
          <div className='flex gap-4 border-border border-b bg-muted/30 px-4 py-3'>
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className='h-3 w-16' />
            ))}
          </div>
          {[1, 2].map((i) => (
            <div key={i} className='flex items-center gap-4 border-border border-b bg-card px-4 py-3 last:border-b-0'>
              <Skeleton className='h-7 w-7 rounded-full' />
              <Skeleton className='h-4 w-16' />
              <Skeleton className='ml-auto h-4 w-20' />
              <Skeleton className='h-4 w-12' />
              <Skeleton className='h-5 w-9 rounded-full' />
              <Skeleton className='h-8 w-32' />
            </div>
          ))}
        </div>
      </div>

      <Separator />

      {/* Borrows section */}
      <div className='flex flex-col gap-3'>
        <div className='flex items-center gap-3'>
          <Skeleton className='h-6 w-36' />
          <Skeleton className='h-6 w-40 rounded-md' />
        </div>
        <div className='rounded-xs border border-border'>
          <div className='flex gap-4 border-border border-b bg-muted/30 px-4 py-3'>
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className='h-3 w-16' />
            ))}
          </div>
          {[1, 2].map((i) => (
            <div key={i} className='flex items-center gap-4 border-border border-b bg-card px-4 py-3 last:border-b-0'>
              <Skeleton className='h-7 w-7 rounded-full' />
              <Skeleton className='h-4 w-16' />
              <Skeleton className='ml-auto h-4 w-20' />
              <Skeleton className='h-4 w-12' />
              <Skeleton className='h-8 w-32' />
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
