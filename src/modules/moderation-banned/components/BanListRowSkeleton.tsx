import { Skeleton } from '@/components/ui/skeleton';

export function BanListRowSkeleton() {
  return (
    <div className='flex items-center justify-between border-border border-b px-4 py-4 md:px-6'>
      <div className='flex flex-col gap-2'>
        <Skeleton className='h-4 w-36' />
        <Skeleton className='h-3 w-48' />
      </div>
      <Skeleton className='h-7 w-16' />
    </div>
  );
}
