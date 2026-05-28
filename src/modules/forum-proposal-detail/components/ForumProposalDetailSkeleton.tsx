import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export function ForumProposalDetailSkeleton() {
  return (
    <main className='min-h-screen bg-background px-4 pt-24 pb-16 md:px-10'>
      <div className='mx-auto flex max-w-[1200px] items-start gap-8'>
        <div className='hidden w-16 shrink-0 flex-col items-center gap-5 lg:flex'>
          <Skeleton className='h-16 w-full' />
          <Skeleton className='size-9' />
          <Skeleton className='size-9' />
          <Skeleton className='size-9' />
        </div>

        <div className='flex min-w-0 flex-1 flex-col gap-8'>
          <Card className='rounded-none border-border/80 bg-card py-0 shadow-none'>
            <CardContent className='space-y-5 p-6'>
              <div className='flex justify-between gap-6'>
                <div className='space-y-3'>
                  <Skeleton className='h-8 w-64' />
                  <Skeleton className='h-4 w-80' />
                </div>
                <Skeleton className='h-9 w-40' />
              </div>
              <Skeleton className='h-2 w-full' />
              <Skeleton className='h-2 w-full' />
              <Skeleton className='h-2 w-full' />
            </CardContent>
          </Card>

          <Card className='rounded-none border-border/80 bg-card py-0 shadow-none'>
            <CardContent className='p-6 md:p-10 lg:p-12'>
              <div className='flex items-center gap-3'>
                <Skeleton className='size-10 rounded-full' />
                <div className='space-y-2'>
                  <Skeleton className='h-4 w-56' />
                  <Skeleton className='h-3 w-40' />
                </div>
              </div>
              <div className='mt-10 space-y-5'>
                <Skeleton className='h-9 w-4/5' />
                <Skeleton className='h-6 w-2/3' />
                <Skeleton className='h-4 w-full' />
                <Skeleton className='h-4 w-full' />
                <Skeleton className='h-4 w-11/12' />
                <Skeleton className='h-4 w-5/6' />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}
