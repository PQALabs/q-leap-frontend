import { Skeleton } from '@/components/ui/skeleton';

export function ProposalCardSkeleton() {
  return (
    <article className='border border-border bg-card p-4'>
      <div className='flex items-center gap-2'>
        <Skeleton className='h-5 w-24 rounded-none' />
        <Skeleton className='size-1 rounded-full' />
        <Skeleton className='h-3 w-28 rounded-none' />
      </div>

      <Skeleton className='mt-3 h-6 w-4/5 rounded-none' />
      <Skeleton className='mt-3 h-4 w-full rounded-none' />
      <Skeleton className='mt-2 h-4 w-2/3 rounded-none' />

      <div className='mt-3 border-border border-t pt-3'>
        <div className='flex items-center gap-5'>
          <Skeleton className='h-4 w-10 rounded-none' />
          <Skeleton className='h-4 w-10 rounded-none' />
        </div>
      </div>
    </article>
  );
}
