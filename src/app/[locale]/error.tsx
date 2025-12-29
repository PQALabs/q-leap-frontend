'use client';

import { useEffect } from 'react';

export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className='flex min-h-screen flex-col items-center justify-center gap-4'>
      <h2 className='font-semibold text-foreground text-xl'>Something went wrong!</h2>
      <button
        type='button'
        onClick={() => reset()}
        className='rounded-full bg-primary px-5 py-2 text-primary-foreground text-sm transition-colors hover:opacity-90'
      >
        Try again
      </button>
    </div>
  );
}
