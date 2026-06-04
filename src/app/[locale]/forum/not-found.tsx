import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function ForumNotFound() {
  return (
    <main className='flex min-h-[calc(100vh-64px)] flex-col items-center justify-center bg-background px-4 pb-16'>
      <div className='flex w-full max-w-md flex-col items-center gap-6 text-center'>
        {/* 404 number */}
        <div className='select-none font-bold font-serif text-[8rem] text-border leading-none'>404</div>

        {/* Message */}
        <div className='flex flex-col gap-2'>
          <h1 className='font-semibold text-foreground text-xl'>Page not found</h1>
          <p className='text-muted-foreground text-sm leading-relaxed'>
            The page you're looking for doesn't exist or has been removed.
          </p>
        </div>

        {/* CTA */}
        <Button asChild icon={<ArrowLeft className='size-4' />}>
          <Link href='/forum'>Back to Forum</Link>
        </Button>
      </div>
    </main>
  );
}
