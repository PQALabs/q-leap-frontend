'use client';

import { format } from 'date-fns';
import { ShieldAlert } from 'lucide-react';
import type { IBannedAddress } from '@/api/moderation';
import { AddressWithCopy } from '@/components/address-with-copy';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { formatBanExpiry } from '../utils/format-ban-expiry';

type BanListItemProps = {
  entry: IBannedAddress;
  canUnban?: boolean;
  onUnban: (entry: IBannedAddress) => void;
};

export function BanListItem({ entry, canUnban = true, onUnban }: BanListItemProps) {
  return (
    <div className='grid gap-4 border-border border-b px-4 py-4 last:border-b-0 sm:items-start sm:px-6'>
      <div className='flex min-w-0 flex-col gap-3'>
        <div className='flex items-start justify-between gap-4'>
          <div className='flex min-w-0 flex-col items-start gap-1.5'>
            <AddressWithCopy
              address={entry.address}
              copyTitle='Copy banned address'
              className='text-foreground text-sm'
              textClassName='font-semibold'
              copyButtonClassName='text-muted-foreground/70'
              copyIconClassName='size-3.5'
            />
            <div className='flex flex-wrap items-center gap-x-3 gap-y-1 text-muted-foreground text-xs'>
              <span>
                <span className='font-medium text-foreground/80'>Banned on:</span>{' '}
                {format(new Date(entry.bannedAt), 'dd/MM/yyyy HH:mm')}
              </span>
              <span>
                <span className='font-medium text-foreground/80'>Expires:</span> {formatBanExpiry(entry.expiresAt)}
              </span>
              <span className='inline-flex items-center gap-1.5'>
                <span className='font-medium text-foreground/80'>Banned by:</span>
                <AddressWithCopy
                  address={entry.bannedBy}
                  copyTitle='Copy moderator address'
                  className='gap-1.5'
                  copyButtonClassName='text-muted-foreground/70'
                  copyIconClassName='size-3'
                />
              </span>
            </div>
          </div>
          <Button
            type='button'
            size='xs'
            variant='outline'
            disabled={!canUnban}
            title={canUnban ? undefined : 'You cannot unban your own address.'}
            onClick={() => onUnban(entry)}
          >
            Unban
          </Button>
        </div>

        {entry.reason && (
          <Alert variant='warning' className='py-2 text-xs'>
            <ShieldAlert />
            <AlertDescription className='break-words text-xs'>
              <span className='font-medium'>Reason:</span> {entry.reason}
            </AlertDescription>
          </Alert>
        )}
      </div>
    </div>
  );
}
