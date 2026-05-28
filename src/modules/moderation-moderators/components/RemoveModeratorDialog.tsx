'use client';

import { Loader2, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import type { IModerator } from '@/api/moderation';
import { Button } from '@/components/ui/button';
import { Dialog, DialogClose, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { getEvmMessage } from '@/lib/get-evm-message';
import { useRemoveModerator } from '../hooks/use-remove-moderator';

type RemoveModeratorDialogProps = {
  moderator: IModerator | null;
  onClose: () => void;
};

export function RemoveModeratorDialog({ moderator, onClose }: RemoveModeratorDialogProps) {
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
