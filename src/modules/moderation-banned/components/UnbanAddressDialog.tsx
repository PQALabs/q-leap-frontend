'use client';

import { Loader2, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';
import type { IBannedAddress } from '@/api/moderation';
import { Button } from '@/components/ui/button';
import { Dialog, DialogClose, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { getEvmMessage } from '@/lib/get-evm-message';
import { useUnbanAddress } from '../hooks/use-unban-address';

type UnbanAddressDialogProps = {
  entry: IBannedAddress | null;
  onClose: () => void;
};

export function UnbanAddressDialog({ entry, onClose }: UnbanAddressDialogProps) {
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
