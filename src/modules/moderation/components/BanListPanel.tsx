'use client';

import { Loader2, ShieldCheck } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import type { IBannedAddress } from '@/api/moderation';
import { Button } from '@/components/ui/button';
import { Dialog, DialogClose, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { getEvmMessage } from '@/lib/get-evm-message';
import { formatAddress } from '@/lib/utils';
import { useBannedAddresses } from '../hooks/use-banned-addresses';
import { useUnbanAddress } from '../hooks/use-unban-address';

function BanListRowSkeleton() {
  return (
    <div className='flex items-center justify-between border-border border-b px-6 py-4'>
      <div className='flex flex-col gap-2'>
        <Skeleton className='h-4 w-36' />
        <Skeleton className='h-3 w-48' />
      </div>
      <Skeleton className='h-7 w-16' />
    </div>
  );
}

function formatExpiry(expiresAt: string | null): string {
  if (!expiresAt) return 'Permanent';
  return new Date(expiresAt).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

type UnbanDialogProps = {
  entry: IBannedAddress | null;
  onClose: () => void;
};

function UnbanDialog({ entry, onClose }: UnbanDialogProps) {
  const { mutateAsync, isPending } = useUnbanAddress();

  const handleConfirm = async () => {
    if (!entry) return;
    try {
      await mutateAsync(entry.address);
      toast.success('Address unbanned');
      onClose();
    } catch (err) {
      const message = err instanceof Error ? err.message : getEvmMessage(err);
      toast.error('Failed to unban address', { description: message });
    }
  };

  return (
    <Dialog open={!!entry} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className='gap-0 rounded-none border-border bg-card p-0 sm:max-w-sm'>
        <DialogHeader className='px-6 pt-6 pb-4 text-left'>
          <DialogTitle className='font-medium text-foreground'>Unban address?</DialogTitle>
        </DialogHeader>

        <p className='break-all px-6 pb-4 font-mono text-muted-foreground text-sm'>{entry?.address}</p>

        <DialogFooter className='gap-2 border-border border-t px-6 py-4 sm:justify-start'>
          <Button
            type='button'
            size='xs'
            className='h-7 rounded-none px-4'
            disabled={isPending}
            onClick={handleConfirm}
            icon={isPending ? <Loader2 className='animate-spin' /> : <ShieldCheck />}
          >
            {isPending ? 'Unbanning…' : 'Unban'}
          </Button>
          <DialogClose asChild>
            <Button type='button' variant='ghost' size='xs' className='h-7 rounded-none px-2' disabled={isPending}>
              Cancel
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function BanListPanel() {
  const { data: bannedAddresses, isLoading } = useBannedAddresses();
  const [pendingUnban, setPendingUnban] = useState<IBannedAddress | null>(null);

  return (
    <div className='border border-border bg-card'>
      <div className='border-border border-b px-6 py-4'>
        <h2 className='font-semibold text-foreground text-sm'>Banned Addresses</h2>
      </div>

      {isLoading && (
        <>
          <BanListRowSkeleton />
          <BanListRowSkeleton />
          <BanListRowSkeleton />
        </>
      )}

      {!isLoading && bannedAddresses?.length === 0 && (
        <p className='px-6 py-8 text-center text-muted-foreground text-sm'>No banned addresses.</p>
      )}

      {!isLoading &&
        bannedAddresses?.map((entry) => (
          <div
            key={entry.address}
            className='flex items-center justify-between border-border border-b px-6 py-4 last:border-b-0'
          >
            <div className='flex flex-col gap-0.5'>
              <span className='font-mono text-foreground text-sm'>{formatAddress(entry.address)}</span>
              <span className='text-muted-foreground text-xs'>
                {entry.reason ? `${entry.reason} · ` : ''}
                Expires: {formatExpiry(entry.expiresAt)}
                {' · '}Banned by {formatAddress(entry.bannedBy)}
              </span>
            </div>

            <Button
              type='button'
              variant='outline'
              size='xs'
              className='h-7 shrink-0 rounded-none px-3'
              onClick={() => setPendingUnban(entry)}
            >
              Unban
            </Button>
          </div>
        ))}

      <UnbanDialog entry={pendingUnban} onClose={() => setPendingUnban(null)} />
    </div>
  );
}
