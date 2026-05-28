'use client';

import { Button } from '@/components/ui/button';

type ModerationPaginationFooterProps = {
  page: number;
  totalPages: number;
  totalItems: number;
  onPageChange: (page: number) => void;
};

export function ModerationPaginationFooter({
  page,
  totalPages,
  totalItems,
  onPageChange,
}: ModerationPaginationFooterProps) {
  if (totalPages <= 1) {
    return null;
  }

  return (
    <div className='flex items-center justify-between border-border border-t px-4 py-3 md:px-6'>
      <span className='text-muted-foreground text-xs'>
        Page {page} of {totalPages} · {totalItems} total
      </span>
      <div className='flex gap-1'>
        <Button
          type='button'
          variant='outline'
          size='xs'
          className='h-7 rounded-none px-3 text-xs'
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
        >
          Previous
        </Button>
        <Button
          type='button'
          variant='outline'
          size='xs'
          className='h-7 rounded-none px-3 text-xs'
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
        >
          Next
        </Button>
      </div>
    </div>
  );
}
