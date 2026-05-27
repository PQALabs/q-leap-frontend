import { Skeleton } from '@/components/ui/skeleton';

export function CommentReportRowSkeleton() {
  return (
    <div className='space-y-2 border-border border-b px-6 py-4'>
      <Skeleton className='h-4 w-48' />
      <Skeleton className='h-3 w-64' />
      <Skeleton className='h-16 w-full' />
      <Skeleton className='h-7 w-32' />
    </div>
  );
}
