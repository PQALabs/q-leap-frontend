'use client';

import { format } from 'date-fns';
import { Trash2 } from 'lucide-react';
import type { IModerator } from '@/api/moderation';
import { AddressWithCopy } from '@/components/address-with-copy';
import { Button } from '@/components/ui/button';
import { formatAddress } from '@/lib/utils';

type ModeratorListItemProps = {
  moderator: IModerator;
  canRemove: boolean;
  onRemove: (moderator: IModerator) => void;
};

export function ModeratorListItem({ moderator, canRemove, onRemove }: ModeratorListItemProps) {
  return (
    <div className='grid gap-4 border-border border-b px-4 py-4 last:border-b-0 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-start md:px-6'>
      <div className='flex min-w-0 flex-col gap-1.5'>
        <AddressWithCopy
          address={moderator.walletAddress}
          copyTitle='Copy moderator address'
          className='text-foreground text-sm'
          textClassName='font-semibold'
          copyButtonClassName='text-muted-foreground/70'
          copyIconClassName='size-3.5'
        />
        <div className='flex flex-wrap items-center gap-x-3 gap-y-1 text-muted-foreground text-xs'>
          <span>
            <span className='font-medium text-foreground/80'>Added on:</span>{' '}
            {format(new Date(moderator.createdAt), 'dd/MM/yyyy HH:mm')}
          </span>
        </div>
      </div>

      {canRemove && (
        <Button
          type='button'
          variant='ghost'
          size='icon'
          className='size-7 shrink-0 text-muted-foreground hover:text-destructive'
          onClick={() => onRemove(moderator)}
          aria-label={`Remove ${formatAddress(moderator.walletAddress)}`}
        >
          <Trash2 className='size-4' />
        </Button>
      )}
    </div>
  );
}
