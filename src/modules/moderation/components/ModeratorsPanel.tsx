'use client';

import { Loader2, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import type { IModerator } from '@/api/moderation';
import { Button } from '@/components/ui/button';
import { Dialog, DialogClose, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { getEvmMessage } from '@/lib/get-evm-message';
import { formatAddress } from '@/lib/utils';
import { useForumAuthStore } from '@/stores/use-forum-auth-store';
import { useModerators } from '../hooks/use-moderators';
import { useRemoveModerator } from '../hooks/use-remove-moderator';
import { DialogAddModerator } from './DialogAddModerator';

function ModeratorRowSkeleton() {
  return (
    <div className='flex items-center justify-between border-border border-b px-6 py-4'>
      <div className='flex flex-col gap-2'>
        <Skeleton className='h-4 w-36' />
        <Skeleton className='h-3 w-20' />
      </div>
      <Skeleton className='h-7 w-7' />
    </div>
  );
}

type RemoveDialogProps = {
  moderator: IModerator | null;
  onClose: () => void;
};

function RemoveModeratorDialog({ moderator, onClose }: RemoveDialogProps) {
  const { mutateAsync, isPending } = useRemoveModerator();

  const handleConfirm = async () => {
    if (!moderator) return;
    try {
      await mutateAsync(moderator.walletAddress);
      toast.success('Moderator removed');
      onClose();
    } catch (err) {
      const message = err instanceof Error ? err.message : getEvmMessage(err);
      toast.error('Failed to remove moderator', { description: message });
    }
  };

  return (
    <Dialog open={!!moderator} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className='gap-0 rounded-none border-border bg-card p-0 sm:max-w-sm'>
        <DialogHeader className='px-6 pt-6 pb-4 text-left'>
          <DialogTitle className='font-medium text-foreground'>Remove moderator?</DialogTitle>
        </DialogHeader>

        <p className='px-6 pb-4 font-mono text-muted-foreground text-sm'>{moderator?.walletAddress}</p>

        <DialogFooter className='gap-2 border-border border-t px-6 py-4 sm:justify-start'>
          <Button
            type='button'
            variant='destructive'
            size='xs'
            className='h-7 rounded-none px-4'
            disabled={isPending}
            onClick={handleConfirm}
            icon={isPending ? <Loader2 className='animate-spin' /> : <Trash2 />}
          >
            {isPending ? 'Removing…' : 'Remove'}
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

export function ModeratorsPanel() {
  const { data: moderators, isLoading } = useModerators();
  const [pendingRemove, setPendingRemove] = useState<IModerator | null>(null);
  const isAdmin = useForumAuthStore((s) => s.user?.role === 'admin');

  return (
    <div className='border border-border bg-card'>
      <div className='flex items-center justify-between border-border border-b px-6 py-4'>
        <h2 className='font-semibold text-foreground text-sm'>Moderators</h2>
        {isAdmin && <DialogAddModerator />}
      </div>

      {isLoading && (
        <>
          <ModeratorRowSkeleton />
          <ModeratorRowSkeleton />
          <ModeratorRowSkeleton />
        </>
      )}

      {!isLoading && moderators?.length === 0 && (
        <p className='px-6 py-8 text-center text-muted-foreground text-sm'>No moderators yet.</p>
      )}

      {!isLoading &&
        moderators?.map((mod) => (
          <div
            key={mod.id}
            className='flex items-center justify-between border-border border-b px-6 py-4 last:border-b-0'
          >
            <div className='flex flex-col gap-0.5'>
              <span className='font-mono text-foreground text-sm'>{mod.walletAddress}</span>
              <span className='text-muted-foreground text-xs'>
                {formatAddress(mod.walletAddress)} · {mod.isActive ? 'active' : 'inactive'}
              </span>
            </div>

            {isAdmin && (
              <Button
                type='button'
                variant='ghost'
                size='icon'
                className='size-7 shrink-0 text-muted-foreground hover:text-destructive'
                onClick={() => setPendingRemove(mod)}
                aria-label={`Remove ${formatAddress(mod.walletAddress)}`}
              >
                <Trash2 className='size-4' />
              </Button>
            )}
          </div>
        ))}

      <RemoveModeratorDialog moderator={pendingRemove} onClose={() => setPendingRemove(null)} />
    </div>
  );
}
